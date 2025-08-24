
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const r = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  handle: z.string().min(3).regex(/^[a-z0-9_\.]+$/i, 'handle inválido'),
});

r.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, displayName, handle } = parsed.data;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, passwordHash: hash, displayName, handle } });
    return res.status(201).json({ id: user.id });
  } catch (e:any) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'email_or_handle_in_use' });
    return res.status(500).json({ error: 'create_failed' });
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });
r.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  if (user.deactivated) return res.status(403).json({ error: 'account_deactivated' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET || 'dev', { subject: user.id, expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, displayName: user.displayName, handle: user.handle, emailVerified: user.emailVerified, role: user.role } });
});

export default r;
