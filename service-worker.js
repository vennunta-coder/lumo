
self.addEventListener('install', (e)=>{ e.waitUntil(caches.open('lumi-apex-v1').then(c=>c.addAll(['./','./index.html']))); self.skipWaiting(); });
self.addEventListener('activate', (e)=>{ self.clients.claim(); });
self.addEventListener('fetch', (e)=>{ e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).catch(()=>caches.match('./index.html')))); });
self.addEventListener('push', (event)=>{
  let data={}; try{ data = event.data?event.data.json():{} }catch(e){}
  const title=data.title||'LUMI'; const options={ body:data.body||'', icon:'./icons/icon-192.png', data:{ url:data.url||'/' } };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', (event)=>{ event.notification.close(); const url = event.notification.data?.url||'/'; event.waitUntil(clients.openWindow(url)); });
