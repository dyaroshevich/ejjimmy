// public/custom-sw.js
// Custom Service Worker logic for Rich Push Notifications with Grouping & Badge

self.addEventListener('push', (event) => {
  console.log('[SW] Push Event Received');
  
  let payload = { title: 'Tawan Power', body: 'New notification', url: '/admin', type: 'system' };
  
  if (event.data) {
    try {
      payload = event.data.json();
      console.log('[SW] Payload JSON:', payload);
    } catch (e) {
      payload.body = event.data.text();
      console.log('[SW] Payload Text:', payload.body);
    }
  }

  const title = payload.title || 'Tawan Power';
  const tag = payload.tag || 'tawanpower-general';
  
  event.waitUntil((async () => {
    // 1. Badge handling
    if (payload.badgeCount !== undefined && 'setBadge' in self.registration) {
      await self.registration.setBadge(payload.badgeCount).catch(() => {});
    }

    // 2. Simple grouping: if same tag is active, we just show a new one which will replace the old one
    // unless we want to stack them. In PWA renotify:true helps.
    const options = {
      body: payload.body || payload.message || 'Check your admin panel.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: tag,
      renotify: true,
      data: {
        url: payload.url || '/admin',
        type: payload.type || 'system'
      },
      actions: getActions(payload.type)
    };

    console.log('[SW] Showing notification:', title, tag);
    return self.registration.showNotification(title, options);
  })());
});

function getActions(type) {
  switch (type) {
    case 'new_lead': return [{ action: 'view', title: '👁️ View Lead' }];
    case 'line_message': return [{ action: 'view', title: '💬 Reply' }];
    default: return [];
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/admin';

  event.waitUntil((async () => {
    // Clear badge
    if ('clearBadge' in self.registration) {
      await self.registration.clearBadge().catch(() => {});
    }

    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    
    for (const client of clientList) {
      if (client.url.includes('/admin') && 'focus' in client) {
        await client.focus();
        if ('navigate' in client) return client.navigate(url);
      }
    }
    
    if (self.clients.openWindow) {
      return self.clients.openWindow(url);
    }
  })());
});



