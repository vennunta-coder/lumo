
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import redoc from 'redoc-express';
import client from 'prom-client';

import auth from './routes/auth.js';
import profiles from './routes/profiles.js';
import posts from './routes/posts.js';
import feed from './routes/feed.js';
import media from './routes/media.js';
import dms from './routes/dms.js';
import push from './routes/push.js';
import admin from './routes/admin.js';
import realtime from './routes/realtime.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(cors({ origin: (_origin, cb) => cb(null, true), credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

const publicDir = path.join(process.cwd(), 'public');
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequests = new client.Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['route','method','code'] });
app.use((req,res,next)=>{
  const end = res.end as any;
  (res as any).end = function(chunk:any, encoding:any, cb:any){
    httpRequests.inc({ route: req.path, method: req.method, code: res.statusCode });
    return end.call(this, chunk, encoding, cb);
  };
  next();
});
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// routes
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', auth);
app.use('/profiles', profiles);
app.use('/posts', posts);
app.use('/feed', feed);
app.use('/media', media);
app.use('/dms', dms);
app.use('/push', push);
app.use('/admin', admin);
app.use('/realtime', realtime);

// docs
app.get('/openapi.json', (_req,res) => res.json({ openapi:'3.1.0', info:{ title:'LUMI Apex API', version:'3.5.0' } }));
app.get('/docs', redoc({ title: 'LUMI Apex API', specUrl: '/openapi.json' }));

// errors
app.use((err:any, _req:any, res:any, _next:any) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(PORT, () => console.log(`LUMI Apex API on :${PORT}`));
