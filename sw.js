importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCTo8DhvaAmNtV9OIgY5eLOeVgF7iQqlYk",
  authDomain: "faculty-of-commerce-2025.firebaseapp.com",
  databaseURL: "https://faculty-of-commerce-2025-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "faculty-of-commerce-2025",
  storageBucket: "faculty-of-commerce-2025.firebasestorage.app",
  messagingSenderId: "312259778835",
  appId: "1:312259778835:web:504299bb2de918596b62e6",
  measurementId: "G-QJZB7E2D5R"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'Wolf TraVal';
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://raw.githubusercontent.com/shehabt1000-boop/-/8feac62d11c707c07fd2d22afba278c69070d152/Wolf%20TraVal%20.jpg',
    badge: 'https://raw.githubusercontent.com/shehabt1000-boop/-/8feac62d11c707c07fd2d22afba278c69070d152/Wolf%20TraVal%20.jpg',
    data: { url: payload.data?.url || './index.html' } 
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = 'wolf-traval-v8'; // تحديث الإصدار
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html', // تمت الإضافة
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap',
  'https://raw.githubusercontent.com/shehabt1000-boop/-/8feac62d11c707c07fd2d22afba278c69070d152/Wolf%20TraVal%20.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.href.includes('firebase') || requestUrl.href.includes('googleapis') || requestUrl.href.includes('firestore')) {
    return;
  }

  if (event.request.method === 'POST' && requestUrl.pathname.includes('share-target')) {
    event.respondWith(Response.redirect('./index.html?action=shared'));
    return;
  }

  // استراتيجية عرض صفحة الأوفلاين
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then(response => {
            return response || caches.match('./offline.html');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offers') { console.log('Syncing...'); }
});
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-check') { console.log('Periodic check...'); }
});