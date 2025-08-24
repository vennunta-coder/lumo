
import { Router, Response } from 'express';
import { authFromQuery, addClient, removeClient } from '../utils/realtime.js';

const r = Router();

r.get('/stream', (req, res:Response) => {
  const userId = authFromQuery(req);
  if(!userId) return res.status(401).end();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(': ok\n\n'); // comment/heartbeat
  addClient(userId, res);
  const t = setInterval(()=>{ try{res.write(': ping\n\n');}catch{} }, 25000);
  req.on('close', ()=>{ clearInterval(t); removeClient(userId, res); });
});

export default r;
