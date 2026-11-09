/* Garde l'appli disponible même avec une connexion faible */
var CACHE='voyages-v9';
var FICHIERS=['./','index.html','app.js','data.js','manifest.json','hors-ligne.html','manifest-local.json','supabase.js','d3-array.min.js','d3-geo.min.js','topojson-client.min.js','icon-192.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FICHIERS)}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==CACHE}).map(function(n){return caches.delete(n)}))}));self.clients.claim()});
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(function(r){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp)});return r}).catch(function(){return caches.match(e.request)}));
});
