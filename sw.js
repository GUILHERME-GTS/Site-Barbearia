const CACHE_NAME = 'barbearia-v1';
const assets = [
  './',
  './index.html',
  './admin.html',
  './style.css',
  './script.js',
  './admin.js',
  './manifest.json'
];

// Instala o Service Worker e guarda os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Faz o site carregar o que está no cache se estiver sem internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});