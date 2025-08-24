
import webpush from 'web-push';

const PUB = process.env.VAPID_PUBLIC_KEY || '';
const PRIV = process.env.VAPID_PRIVATE_KEY || '';
const SUBJ = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (PUB && PRIV) webpush.setVapidDetails(SUBJ, PUB, PRIV);

export async function sendPush(sub:any, payload:any){
  if(!PUB || !PRIV) return { ok:false, error:'vapid_not_configured' };
  try { await webpush.sendNotification(sub, JSON.stringify(payload)); return { ok:true }; }
  catch(e:any){ return { ok:false, error: e?.message || 'push_failed' }; }
}
