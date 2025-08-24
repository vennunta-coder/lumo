
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();
const r = Router();

r.get('/search', async (req, res)=>{
  const q = String(req.query.q || '').toLowerCase();
  if(!q) return res.json([]);
  const list = await prisma.user.findMany({ where: { OR: [
    { handle: { contains: q, mode: 'insensitive' } },
    { displayName: { contains: q, mode: 'insensitive' } }
  ] }, take: 20, select: { id:true, handle:true, displayName:true, avatarUrl:true } });
  res.json(list);
});

r.patch('/me', requireAuth, async (req:AuthRequest, res)=>{
  const body = z.object({ displayName: z.string().min(2).optional(), bio: z.string().max(160).optional(), avatarUrl: z.string().url().optional() }).safeParse(req.body);
  if(!body.success) return res.status(400).json({ error: body.error.flatten() });
  const u = await prisma.user.update({ where: { id: req.user!.id }, data: body.data });
  res.json({ ok:true, user: { id:u.id, handle:u.handle, displayName:u.displayName, avatarUrl:u.avatarUrl, bio:u.bio } });
});

r.post('/:id/follow', requireAuth, async (req:AuthRequest, res)=>{
  if(req.params.id === req.user!.id) return res.status(400).json({ error: 'cant_follow_self' });
  try { await prisma.follow.create({ data: { followerId: req.user!.id, followingId: req.params.id } }); } catch {}
  await prisma.notification.create({ data: { userId: req.params.id, type: 'follow', payload: { from: req.user!.id } } });
  res.json({ ok:true });
});

export default r;
