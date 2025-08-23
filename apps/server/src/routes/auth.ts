import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
const prisma = new PrismaClient();
const router = Router();
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) return res.status(400).json({ error: 'username e password são obrigatórios' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hash } });
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) { next(e); }
});
export default router;
