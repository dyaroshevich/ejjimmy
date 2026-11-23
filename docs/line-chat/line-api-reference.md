# LINE Official API Reference

**Дата:** 18 May 2026
**Проект:** Tawan Power
**Источник:** [LINE Developers Documentation](https://github.com/line/line-developers-docs-source)

---

## 📋 Обзор LINE API

```
LINE Platform:
├── Messaging API
│   ├── Push API      — отправка сообщений бота пользователю (300/месяц БЕСПЛАТНО в Tawan Power)
│   ├── Reply API     — ответ на webhook (БЕСПЛАТНО, не из лимита)
│   ├── Multicast     — множественным пользователям
│   ├── Broadcast     — всем подписчикам
│   └── Multicast/Notify API — LINE notification messages (paid)
│
├── LINE Mini App
│   ├── Service Messages API — шаблонные сообщения (5/год на токен)
│   └── LIFF SDK         — встраиваемые приложения
│
└── LINE Login
    └── Authentication
```

---

## 🔴 PUSH API (Messaging API) — ВАЖНО

### POST /v2/bot/message/push

**Используется ДЛЯ:** Отправка сообщений боту → пользователю.

**ЭТОГО ДЛЯ АДМИН УВЕДОМЛЕНИЙ — НЕ ИСПОЛЬЗУЕМ!**

**Лимит:** 300 сообщений/месяц (Free Plan)

**Используем ТОЛЬКО для:**
- ✅ Ответы нашего бота пользователю (bot → user)
- ✅ Ответ на webhook (Reply API)

**НЕ используем для:**
- ❌ Админ-уведомления (для этого Telegram + Web Push)

```typescript
// WRONG ❌ — тратит лимит 300/месяц
const response = await fetch('https://api.line.me/v2/bot/message/push', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: userId,
    messages: [{ type: 'text', text: 'Новый лид!' }]
  })
});
```

```typescript
// CORRECT ✅ — Reply API бесплатен
const response = await fetch('https://api.line.me/v2/bot/message/reply', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    replyToken: replyToken, // одноразовый токен из webhook
    messages: [{ type: 'text', text: 'Спасибо за сообщение!' }]
  })
});
```

### POST /v2/bot/message/reply (Reply API)

**БЕСПЛАТНО** — replyToken одноразовый, лимит не расходуется.

**Применение:** Ответ на действия пользователя в чате.

---

## 🔵 SERVICE MESSAGES API

**Источник:** [Service Messages](https://developers.line.biz/en/docs/line-mini-app/develop/service-messages/)

### POST /message/v3/notifier/send

Отправляет service message пользователю LINE Mini App.

**Важно:**
- Требует LIFF Access Token
- 5 сообщений на токен
- Токен обновляется при каждом использовании
- Токен живёт 1 год
- НЕ требует согласия пользователя

**Применение:** Уведомления внутри LINE Mini App.

```typescript
// Запрос сервисного токена
const tokenResponse = await fetch('https://api.line.me/message/v3/notifier/token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${channelAccessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ liffAccessToken: liffAccessToken })
});

const { service_notification_token, expires_in, max_count } = await tokenResponse.json();
```

```typescript
// Отправка service message
const sendResponse = await fetch('https://api.line.me/message/v3/notifier/send?target=service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${channelAccessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templateName: 'reservation_confirmation_en',
    notificationToken: serviceNotificationToken,
    params: { date: '2024-05-20', username: 'John' }
  })
});

const { notificationToken, expiresIn, remainingCount } = await sendResponse.json();
// remainingCount уменьшается с каждым использованием
```

**Response:**
```json
{
  "notificationToken": "34c11a03-b726-49e3-8ce0-949387a9..",
  "expiresIn": 31536000,
  "remainingCount": 3,
  "sessionId": "xD06...."
}
```

---

## 🟢 LINE NOTIFICATION MESSAGES (PNP API)

**Источник:** [LINE Notification Messages](https://developers.line.biz/en/reference/line-notification-messages/)

### POST /messages

Отправляет сообщение по **хешированному номеру телефона**.

**Требования:**
- E.164 формат номера → SHA256 hash
- Пользователь должен быть в LINE (аккаунт привязан к номеру)
- Не поддерживает retry с X-Line-Retry-Key

```typescript
import { createHash } from 'crypto';

const phoneHash = createHash('sha256').update(phoneNumber).digest('hex');

const response = await fetch('https://api.line.me/v2/bot/pnp/push', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: phoneHash,
    messages: [
      { type: 'text', text: 'Ваш заказ готов!' }
    ]
  })
});
```

### POST /v2/bot/message/pnp/templated/push

Шаблонное уведомление по телефону.

```typescript
const response = await fetch('https://api.line.me/v2/bot/message/pnp/templated/push', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Line-Delivery-Tag': deliveryTag
  },
  body: JSON.stringify({
    to: phoneHash,
    templateKey: 'shipment_completed_ja',
    body: {
      emphasizedItem: {
        itemKey: 'date_002_ja',
        content: 'Saturday, August 10, 2024'
      },
      items: [
        { itemKey: 'number_001_ja', content: '1234567' }
      ],
      buttons: [
        { buttonKey: 'check_delivery_status_ja', url: 'https://example.com/check' }
      ]
    }
  })
});
```

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| /messages | 2,000 req/sec |
| /v2/bot/message/pnp/templated | 2,000 req/sec |

---

## 🟡 WEB PUSH API (Browser Notifications)

**Стандарт:** W3C Web Push API

**Важно:** Это НЕ LINE API — это браузерный стандарт.

**Применение:** PWA Admin App → уведомления админу.

```typescript
// Запрос разрешения
const permission = await Notification.requestPermission();

// Подписка на push
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidPublicKey
});

// Отправка через наш backend
await fetch('/api/push', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    keys: subscription.toJSON().keys
  })
});
```

**В backend (Vercel API):**
```typescript
import webpush from 'web-push';

// VAPID keys — сгенерировать один раз
webpush.generateVAPIDKeys();
// Публичный ключ → клиент
// Приватный ключ → server/env

// Отправка
webpush.sendNotification(subscription, JSON.stringify({
  title: 'Новый лид!',
  body: 'Иван, +66 81 234 5678',
  icon: '/icons/icon-192.png'
}));
```

**Минусы Web Push:**
- Требует HTTPS (Vercel = ✅)
- пользователь должен разрешить уведомления
- Safari на Mac требует специальной настройки
- iOS Safari ограничен

---

## 🟠 TELEGRAM BOT (Fallback)

**Альтернатива:** бесплатные push-уведомления админу.

```typescript
// Отправка в Telegram
const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: TELEGRAM_ADMIN_CHAT_ID,
    text: `🔔 *Новый лид*\nИмя: Иван\nТелефон: +66 81 234 5678\nБюджет: 150,000 THB`,
    parse_mode: 'Markdown'
  })
});
```

**Преимущества Telegram Bot:**
- ✅ Бесплатно
- ✅ Безлимитно
- ✅ Мгновенно
- ✅ Работает везде (Android, iOS, Desktop)
- ✅ Не зависит от LINE

---

## 📊 СРАВНЕНИЕ КАНАЛОВ УВЕДОМЛЕНИЙ

| Канал | Стоимость | Лимит | Требования |
|-------|-----------|-------|------------|
| LINE Push API | Бесплатно | 300/месяц | User ID |
| LINE Reply API | Бесплатно | ∞ | Reply token |
| LINE Service Messages | Бесплатно | 5/токен | LIFF token |
| LINE PnP | Платно | По подписке | Hash phone |
| **Web Push (PWA)** | Бесплатно | ∞ | HTTPS + Permission |
| **Telegram Bot** | Бесплатно | ∞ | Bot Token + Chat ID |
| ~~LINE Notify~~ | ~~Закрыт~~ | ~~—~~ | ~~—~~ |

---

## 🎯 АРХИТЕКТУРА ДЛЯ TAWAN POWER

```
НОВЫЙ ЛИД:
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  lead-manager.ts │ ──► │  Supabase  │ ──► │  Telegram   │
│                │     │  (leads)   │     │  Bot (fallback)│
└────────────────┘     └─────────────┘     └──────────┘
                              │
                              ▼
                        ┌─────────────┐     ┌──────────┐
                        │  PWA Admin │ ──► │ Web Push │
                        │  (новый)  │     │ (primary)│
                        └─────────────┘     └──────────┘

ОТВЕТ БОТА:
┌──────────┐     ┌──────────┐
│  webhook │ ──► │ Reply API│ ──► Пользователю
│  ( LINE) │     │ (free)  │
└──────────┘     └──────────┘
```

---

## 📋 ЧЕКЛИСТ IMPLEMENTATION

### Сейчас (P0)

- [ ] Telegram Bot API — `/api/telegram/route.ts`
- [ ] Web Push в PWA Admin
- [ ] Supabase Realtime subscription
- [ ] VAPID keys для Web Push

### Документация LINE

- [Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)
- [Service Messages](https://developers.line.biz/en/docs/line-mini-app/develop/service-messages/)
- [LINE Notification Messages](https://developers.line.biz/en/docs/partner-docs/line-notification-messages/)
- [LIFF SDK](https://developers.line.biz/en/reference/liff/)

---

*Документ создан 18 May 2026 из официальной документации LINE Developers*
