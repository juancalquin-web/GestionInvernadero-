// Service worker de la app (PWA). Guarda la interfaz en caché para que se pueda abrir sin conexión.
// Subir este número cuando cambien los archivos, para que el navegador descargue la versión nueva.
const CACHE = 'invernadero-v2';

// Archivos locales de la app
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.json',
  'icons/icono-planta192.png',
  'icons/icono-planta512.png',
  'JS/app.js',
  'CSS/global.css',
  'CSS/colorLogin.css',
  'CSS/dashboard.css',
  'CSS/invernadero.css',
  'CSS/agregar.css',
  'CSS/admin.css',
  'CSS/estadisticas.css',
  'Vistas/login.html',
  'Vistas/Usuario/dashboard.html',
  'Vistas/Usuario/invernadero.html',
  'Vistas/Usuario/agregar.html',
  'Vistas/Usuario/estadisticas.html',
  'Vistas/Admin/admin.html',
  'Vistas/Admin/admin-usuarios.html',
  'Vistas/Admin/admin-invernaderos.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Borra cachés de versiones anteriores.
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se guarda una copia de las respuestas válidas (incluye Alpine desde el CDN, que es "opaca" porwue viene desde otro lado).
        if (response.ok || response.type === 'opaque') {
          const copia = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copia));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
