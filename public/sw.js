const CACHE_NAME = '6s-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests unless they are for images/fonts
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Silent fail for network errors, we have the cache
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: '6S Alert', body: 'New intelligence update.' };
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: self.location.origin }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Background Sync Listener
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background Syncing data...');
    event.waitUntil(
      // Simulate a background data sync
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('[SW] Data synced successfully');
          self.registration.showNotification('6S — Intelligence Synchronisée', {
            body: 'Vos données ont été mises à jour en arrière-plan.',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'sync-notification'
          });
          resolve();
        }, 3000);
      })
    );
  }
});

// Periodic Sync Listener
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'intelligence-update') {
    console.log('[SW] Periodic Sync: Fetching daily intelligence...');
    event.waitUntil(
      // Simulate fetching new intelligence data
      fetch('/api/intelligence-update').then(response => {
        if (response.ok) {
          return self.registration.showNotification('6S — Nouvelles Prédictions', {
            body: 'De nouvelles analyses sont disponibles pour votre journée.',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'periodic-update'
          });
        }
      }).catch(() => {
        // Fallback if network fails during periodic sync
        console.log('[SW] Periodic sync failed, will retry later.');
      })
    );
  }
});
