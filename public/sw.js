// Service Worker — Belfast Final v4 — sin caché
const CACHE_NAME = 'belfast-final-v4';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('push', e => {
    if (!e.data) return;
    const data = e.data.json();
    e.waitUntil(
        self.registration.showNotification(data.title || 'Belfast CM', {
            body: data.body || '',
            icon: '/icons/belfast-logo.jpeg',
            badge: '/icons/icon-192.png',
            tag: data.tag || 'belfast-notif',
            renotify: true,
        })
    );
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow('/dashboard'));
});
