
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const prisma = new PrismaClient();
const r = Router();
r.use(requireAuth, requireAdmin);

r.get('/reports', async (req, res) => {
  const source = String(req.query.source||'') || undefined;
  const reason = String(req.query.reason||'') || undefined;
  const min = req.query.minScore ? Number(req.query.minScore) : undefined;
  const where:any = {};
  if(source) where.source = source;
  if(reason) where.reason = reason;
  if(min !== undefined) where.score = { gte: min };
  const list = await prisma.report.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json(list);
});

r.post('/batch', async (req, res) => {
  const actions = req.body?.actions || [];
  const results:any[] = [];
  for(const a of actions){
    if(a.type === 'remove_post'){
      await prisma.post.update({ where: { id: a.id }, data: { removedAt: new Date() } });
      results.push({ type:a.type, id:a.id, ok:true });
    } else if(a.type === 'remove_comment'){
      await prisma.comment.update({ where: { id: a.id }, data: { removedAt: new Date() } });
      results.push({ type:a.type, id:a.id, ok:true });
    } else if(a.type === 'ban_user'){
      await prisma.user.update({ where: { id: a.id }, data: { deactivated: true } });
      results.push({ type:a.type, id:a.id, ok:true });
    } else {
      results.push({ type:a.type, id:a.id, ok:false, error:'unknown_action' });
    }
  }
  res.json({ results });
});

export default r;
