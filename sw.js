const CACHE_NAME = 'flexbook-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache (app resources only)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external resources (cross-origin)
  // Only cache same-origin requests (app resources)
  if (url.origin !== self.location.origin) {
    // Let external requests (Firebase, Google Fonts, etc.) pass through
    return;
  }

  // Skip Firebase/Firestore requests (even if same-origin due to proxy)
  if (
    url.pathname.includes('firestore.googleapis.com') ||
    url.pathname.includes('firebase') ||
    url.pathname.includes('googleapis.com')
  ) {
    return;
  }

  // Network first strategy for app resources
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache non-successful responses or opaque responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        // Clone and cache successful responses
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Fallback to cache for offline (app resources only)
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          // If offline and no cache, return a simple offline page for documents
          if (request.destination === 'document') {
            return caches.match('/inaeFlexbook/index.html').then((indexCache) => {
              return indexCache || new Response('Offline - Please check your connection', {
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          }
          // For other resources, return a generic error response
          return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
