
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { sendPush } from '../utils/webpush.js';

const prisma = new PrismaClient();
const r = Router();

r.get('/public-key', (_req, res)=> res.json({ key: process.env.VAPID_PUBLIC_KEY || '' }));

r.post('/subscribe', requireAuth, async (req:AuthRequest, res)=>{
  const sub = req.body;
  if(!sub?.endpoint || !sub?.keys) return res.status(400).json({ error:'invalid_subscription' });
  await prisma.pushSubscription.upsert({
    where: { userId_endpoint: { userId: req.user!.id, endpoint: sub.endpoint } } as any,
    update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    create: { userId: req.user!.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth }
  });
  res.status(201).json({ ok:true });
});

export default r;
