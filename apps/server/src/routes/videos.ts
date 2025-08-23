import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { uploadBuffer } from '../services/storage';
import { isAllowedContent } from '../services/moderation';
import jwt from 'jsonwebtoken';
import { config } from '../config';
const prisma = new PrismaClient();
const router = Router();
const upload = multer();
function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'missing token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    req.userId = payload.sub;
    next();
  } catch { return res.status(401).json({ error: 'invalid token' }); }
}
router.get('/', async (req, res, next) => {
  try {
    const take = Number(req.query.take || 20);
    const cursor = req.query.cursor as string | undefined;
    const items = await prisma.video.findMany({
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { likes: true, comments: true } }, user: { select: { username: true } } },
    });
    let nextCursor: string | undefined = undefined;
    if (items.length > take) { const nextItem = items.pop(); nextCursor = nextItem?.id; }
    res.json({ items, nextCursor });
  } catch (e) { next(e); }
});
router.post('/', auth, upload.single('file'), async (req: any, res: any, next: any) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file obrigatório' });
    const ok = await isAllowedContent(file.buffer);
    if (!ok) return res.status(400).json({ error: 'conteúdo reprovado' });
    const key = `videos/${Date.now()}-${file.originalname}`;
    const url = await uploadBuffer(key, file.buffer, file.mimetype);
    const video = await prisma.video.create({ data: { url, caption: req.body.caption, userId: req.userId } });
    res.status(201).json(video);
  } catch (e) { next(e); }
});
router.post('/:id/like', auth, async (req: any, res: any, next: any) => {
  try { await prisma.like.create({ data: { userId: req.userId, videoId: req.params.id } }); res.json({ ok: true }); }
  catch (e: any) { if (e.code === 'P2002') return res.json({ ok: true }); next(e); }
});
router.post('/:id/comment', auth, async (req: any, res: any, next: any) => {
  try { const c = await prisma.comment.create({ data: { userId: req.userId, videoId: req.params.id, text: req.body.text } }); res.status(201).json(c); }
  catch (e) { next(e); }
});
router.get('/:id/comments', async (req, res, next) => {
  try { const list = await prisma.comment.findMany({ where: { videoId: req.params.id }, orderBy: { createdAt: 'asc' }, include: { user: { select: { username: true } } } }); res.json(list); }
  catch (e) { next(e); }
});
export default router;
