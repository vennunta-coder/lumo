
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { sendPush } from '../utils/webpush.js';
import { sendMany, sendEvent } from '../utils/realtime.js';

const prisma = new PrismaClient();
const r = Router();
const PROFANITY = ['idiota','estupido','burro'];
const THRESH = Number(process.env.MODERATION_AI_THRESHOLD || 0.8);

function blocked(text:string){
  if(process.env.PROFANITY_FILTER !== 'on') return false;
  const lower = text.toLowerCase();
  return PROFANITY.some(w => lower.includes(w));
}

function aiScore(text:string){ // minimal heuristic
  const t = text.toLowerCase(); let s = 0;
  if(['idiota','burro','odiar','matar'].some(w=>t.includes(w))) s += 0.6;
  if(t.includes('http')) s += 0.1;
  return Math.min(1, s);
}

r.post('/', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({ text: z.string().min(1).max(280), mood: z.string().min(1), audience: z.enum(['Amigos','Circulos','Publico']), circleId: z.string().optional(), mediaUrl: z.string().url().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  if(blocked(d.text)) return res.status(400).json({ error:'content_flagged' });
  const score = aiScore(d.text);
  const post = await prisma.post.create({ data: { authorId: req.user!.id, text: d.text, mood: d.mood, audience: d.audience, circleId: d.circleId, mediaUrl: d.mediaUrl || undefined } });
  if(score >= THRESH){ await prisma.report.create({ data: { targetId: 'post:'+post.id, reason:'toxicity', source:'ai', score } }); }

  const followers = await prisma.follow.findMany({ where: { followingId: req.user!.id }, select:{ followerId:true } });
  await prisma.notification.createMany({ data: followers.map(f => ({ userId: f.followerId, type: 'new_post', payload: { postId: post.id, authorId: req.user!.id } })) });
  const subs = await prisma.pushSubscription.findMany({ where: { userId: { in: followers.map(f=>f.followerId) } } });
  for(const s of subs){ await sendPush({ endpoint:s.endpoint, keys:{ p256dh:s.p256dh, auth:s.auth } }, { title:'Novo post ✨', body:d.text.slice(0,80), url:'/' }); }
  sendMany(followers.map(f=>f.followerId), 'notification', { type:'new_post', postId: post.id });
  res.status(201).json({ post, moderationScore: score });
});

r.post('/:id/comments', requireAuth, async (req:AuthRequest,res)=>{
  const body = z.object({ text: z.string().min(1).max(280) }).safeParse(req.body);
  if(!body.success) return res.status(400).json({ error: body.error.flatten() });
  if(blocked(body.data.text)) return res.status(400).json({ error:'content_flagged' });
  const score = aiScore(body.data.text);
  const c = await prisma.comment.create({ data: { postId: req.params.id, authorId: req.user!.id, text: body.data.text } });
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if(score >= THRESH){ await prisma.report.create({ data: { targetId:'comment:'+c.id, reason:'toxicity', source:'ai', score } }); }
  if(post){
    await prisma.notification.create({ data: { userId: post.authorId, type: 'comment', payload: { postId: post.id, from: req.user!.id } } });
    const subs = await prisma.pushSubscription.findMany({ where: { userId: post.authorId } });
    for(const s of subs){ await sendPush({ endpoint:s.endpoint, keys:{ p256dh:s.p256dh, auth:s.auth } }, { title:'Novo comentário 💬', body: body.data.text.slice(0,80), url:'/' }); }
    sendEvent(post.authorId, 'notification', { type:'comment', postId: post.id });
  }
  res.status(201).json({ comment: c, moderationScore: score });
});

export default r;
