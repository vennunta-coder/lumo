
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { sendEvent } from '../utils/realtime.js';
import { sendPush } from '../utils/webpush.js';

const prisma = new PrismaClient();
const r = Router();

r.post('/invite', requireAuth, async (req:AuthRequest,res)=>{
  const body = z.object({ toUserId: z.string() }).safeParse(req.body);
  if(!body.success) return res.status(400).json({ error: body.error.flatten() });
  const convo = await prisma.conversation.create({ data: {} });
  await prisma.conversationMember.createMany({ data: [
    { conversationId: convo.id, userId: req.user!.id, status: 'accepted' },
    { conversationId: convo.id, userId: body.data.toUserId, status: 'pending' }
  ]});
  sendEvent(body.data.toUserId, 'dm_invite', { conversationId: convo.id, from: req.user!.id });
  res.status(201).json({ conversationId: convo.id });
});

r.post('/:id/accept', requireAuth, async (req:AuthRequest,res)=>{
  await prisma.conversationMember.updateMany({ where: { conversationId: req.params.id, userId: req.user!.id }, data: { status: 'accepted' } });
  res.json({ ok:true });
});

r.get('/', requireAuth, async (req:AuthRequest,res)=>{
  const convos = await prisma.conversationMember.findMany({ where: { userId: req.user!.id }, include: { conversation: true } });
  res.json(convos.map(c => ({ id:c.conversationId, status:c.status })));
});

r.get('/:id/messages', requireAuth, async (req:AuthRequest,res)=>{
  const mem = await prisma.conversationMember.findUnique({ where: { conversationId_userId: { conversationId: req.params.id, userId: req.user!.id } } as any });
  if(!mem || mem.status !== 'accepted') return res.status(403).json({ error: 'not_allowed' });
  const msgs = await prisma.message.findMany({ where: { conversationId: req.params.id }, orderBy: { createdAt: 'asc' } });
  res.json(msgs);
});

r.post('/:id/messages', requireAuth, async (req:AuthRequest,res)=>{
  const mem = await prisma.conversationMember.findUnique({ where: { conversationId_userId: { conversationId: req.params.id, userId: req.user!.id } } as any });
  if(!mem || mem.status !== 'accepted') return res.status(403).json({ error: 'not_allowed' });
  const body = z.object({ text: z.string().min(1).max(1000) }).safeParse(req.body);
  if(!body.success) return res.status(400).json({ error: body.error.flatten() });
  const m = await prisma.message.create({ data: { conversationId: req.params.id, authorId: req.user!.id, text: body.data.text } });
  const others = await prisma.conversationMember.findMany({ where: { conversationId: req.params.id, NOT: { userId: req.user!.id } } });
  for(const o of others){
    sendEvent(o.userId, 'dm_message', { conversationId: req.params.id, from: req.user!.id, text: body.data.text, id: m.id, createdAt: m.createdAt });
    const subs = await prisma.pushSubscription.findMany({ where: { userId: o.userId } });
    for(const s of subs){ await sendPush({ endpoint:s.endpoint, keys:{ p256dh:s.p256dh, auth:s.auth } }, { title:'Nova DM ✉️', body: body.data.text.slice(0,80), url:'/' }); }
  }
  res.status(201).json(m);
});

export default r;
