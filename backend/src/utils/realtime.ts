
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

type Client = { userId: string, res: Response };
const clients = new Map<string, Set<Response>>(); // userId -> set of connections

export function authFromQuery(req: Request): string | null {
  const token = String(req.query.token || '');
  if(!token) return null;
  try { const p:any = jwt.verify(token, process.env.JWT_SECRET || 'dev'); return p.sub as string; } catch { return null; }
}

export function addClient(userId:string, res:Response){
  if(!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);
}

export function removeClient(userId:string, res:Response){
  clients.get(userId)?.delete(res);
  if(clients.get(userId)?.size === 0) clients.delete(userId);
}

export function sendEvent(userId:string, type:string, payload:any){
  const set = clients.get(userId);
  if(!set) return;
  for(const res of set){
    try {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {}
  }
}

// broadcast helper for multiple users
export function sendMany(userIds:string[], type:string, payload:any){
  for(const id of userIds) sendEvent(id, type, payload);
}
