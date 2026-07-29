// GridRival — network-first service worker.
const CACHE='gridrival-showcase-v1';
const ASSETS=['/gridrival-showcase/','/gridrival-showcase/index.html','/gridrival-showcase/manifest.webmanifest','/gridrival-showcase/icon-192.png','/gridrival-showcase/icon-512.png','/gridrival-showcase/icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET')return; if(new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});return r;}).catch(()=>caches.match(e.request).then(h=>h||caches.match('/gridrival-showcase/index.html')))); });
