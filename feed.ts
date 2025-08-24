
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();
const r = Router();

r.get('/', requireAuth, async (req:AuthRequest,res)=>{
  const me = req.user!.id;
  const memberships = await prisma.circleMembership.findMany({ where: { userId: me }, select: { circleId: true } });
  const circleIds = memberships.map(m => m.circleId);
  const following = await prisma.follow.findMany({ where: { followerId: me }, select: { followingId:true } });
  const followingIds = new Set(following.map(f=>f.followingId));

  const posts = await prisma.post.findMany({
    where: {
      removedAt: null,
      OR: [
        { audience: 'Publico' },
        { audience: 'Amigos' },
        { audience: 'Circulos', circleId: { in: circleIds } }
      ]
    },
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id:true, displayName:true, handle:true, avatarUrl:true } },
      _count: { select: { comments: true, reactions: true } }
    }
  });

  const now = Date.now();
  const ranked = posts.map(p => {
    const ageH = (now - new Date(p.createdAt).getTime()) / 3.6e6;
    const recency = Math.max(0, 24 - ageH) / 24;
    const popular = (p._count.reactions*2 + p._count.comments*3) / 50;
    const affinity = followingIds.has((p as any).authorId) ? 2 : 0;
    const circleBoost = p.circleId ? 1 : 0;
    const score = recency*2 + popular + affinity + circleBoost;
    return { score, p };
  }).sort((a,b)=>b.score-a.score).slice(0,50).map(x => ({
    id: x.p.id, text: x.p.text, mood: x.p.mood, audience: x.p.audience, circleId: x.p.circleId, mediaUrl: x.p.mediaUrl, createdAt: x.p.createdAt,
    author: x.p.author, commentsCount: x.p._count.comments, likes: x.p._count.reactions
  }));

  res.json(ranked);
});

export default r;
