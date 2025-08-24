
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import AWS from 'aws-sdk';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
const strategy = process.env.UPLOAD_STRATEGY || 'local';
const CDN = (process.env.CDN_BASE_URL||'').replace(/\/$/, '');
const BASE = (process.env.BASE_URL||'').replace(/\/$/, '');

if(strategy === 's3'){
  const s3 = new AWS.S3({
    credentials: new AWS.Credentials({ accessKeyId: process.env.S3_ACCESS_KEY_ID||'', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY||'' }),
    region: process.env.S3_REGION
  });
  r.post('/upload', requireAuth, async (_req, res) => {
    const key = 'm_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const params = { Bucket: process.env.S3_BUCKET!, Fields: { key }, Conditions: [['content-length-range', 0, 20*1024*1024]] } as any;
    const presigned = await s3.createPresignedPost(params);
    const publicBase = CDN || presigned.url;
    res.json({ strategy:'s3', presigned, publicUrl: publicBase + '/' + presigned.fields.key });
  });
} else {
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public','uploads');
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '.bin');
      cb(null, 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2) + ext);
    }
  });
  const upload = multer({ storage });
  r.post('/upload', requireAuth, upload.single('file'), (req, res) => {
    const url = (CDN || BASE) + '/uploads/' + req.file!.filename;
    res.status(201).json({ strategy:'local', url });
  });
}

export default r;
