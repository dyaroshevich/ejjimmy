// src/worker/index.ts
// This file is automatically picked up by @ducanh2912/next-pwa and merged into sw.js

// Using 'any' to avoid TypeScript conflicts with global 'self' and missing ServiceWorker types during main build
const sw = (self as any);

sw.addEventListener('push', (event: any) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'New Lead!';
    const options = {
      body: data.body || 'You have a new lead on Tawan Power',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
        url: data.url || '/admin/leads'
      },
      vibrate: [200, 100, 200],
      tag: 'tawan-push-notification',
      renotify: true
    };

    event.waitUntil(
      sw.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('[SW] Push parsing error:', err);
    const text = event.data.text();
    event.waitUntil(
      sw.registration.showNotification('Tawan Power', {
        body: text,
        icon: '/icons/icon-192x192.png'
      })
    );
  }
});

sw.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/leads';

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any[]) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(url);
      }
    })
  );
});

// Export empty object to treat as module
export {};
