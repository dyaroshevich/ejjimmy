# API Reference — Tawan Power

**Приоритет:** P2
**Дата создания:** 12 June 2026
**Статус:** Демо-версия (требует документирования всех эндпоинтов)

---

## 📌 Зачем

Документация всех API эндпоинтов проекта. Для разработки, интеграций и debugging.

---

## 🔗 Base URLs

| Окружение | URL |
|-----------|-----|
| Production | `https://tawanpower.vercel.app` |
| Local | `http://localhost:3001` |

---

## 📡 API Routes

### POST /api/chat

AI Chat с RAG (uses knowledge base).

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Сколько стоит солнечная панель?" }
  ]
}
```

**Response:**
```json
{
  "id": "chatcmpl-xxx",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Для дома 3кВт примерно 150,000 THB..."
      }
    }
  ]
}
```

**Провайдеры (fallback chain):**
1. Z.AI (`glm-4.7-flash`) — free, reasoning
2. Groq (`llama-3.3-70b-versatile`)
3. OpenRouter (`openai/gpt-oss-120b:free`)
4. Google (`gemini-2.0-flash`)

**Rate Limits:**
- 60 requests/minute per IP
- 10 messages per conversation (qualification)

---

### POST /api/notify-line

Отправка лидов в LINE.

**Request:**
```json
{
  "lead": {
    "name": "John",
    "phone": "+66xxx",
    "segment": "villa",
    "object": "Дом 200м²",
    "budget": "500k-1M THB",
    "location": "Krabi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "16478234567890"
}
```

**Побочные действия:**
- Сохраняет лид в `leads` таблицу
- Отправляет Flex Message в LINE группу

---

### GET /api/solar-products

Получение каталога товаров.

**Query Params:**
- `?segment=villa` — фильтр по сегменту
- `?brand=jinko` — фильтр по бренду

**Response:**
```json
[
  {
    "id": 1,
    "name": "Jinko Tiger Neo 550W",
    "brand": "Jinko",
    "power": 550,
    "price": 12500,
    "warranty": 25,
    "segment": ["villa", "hotel"]
  }
]
```

---

### POST /api/pdf/proposal

Генерация PDF-предложений.

**Request:**
```json
{
  "clientName": "John Smith",
  "address": "123 Krabi Road",
  "items": [
    { "product": "Jinko Tiger Neo 550W", "qty": 12 },
    { "product": "GoodWe GW5000-NS", "qty": 1 }
  ],
  "total": 185000,
  "currency": "THB"
}
```

**Response:**
```json
{
  "url": "/api/pdf/status?id=xxx",
  "status": "generating"
}
```

**Статус:** Хрупкий — 4 баг-репорта. Требует стабилизации.

---

### GET /api/pdf/status

Проверка статуса генерации PDF.

**Query Params:**
- `?id=xxx` — ID генерации

**Response:**
```json
{
  "status": "ready",
  "url": "/pdf/proposals/proposal-xxx.pdf"
}
```

---

### GET /api/og

Генерация OpenGraph метаданных для соцсетей.

**Query Params:**
- `?title=Solar+Krabi` — заголовок
- `?desc=Best+investment` — описание

**Response:** PNG image для social sharing.

---

## 🗄 Database Schema (Supabase)

### leads

| Column | Type | Описание |
|--------|------|----------|
| id | uuid | PK |
| name | text | Имя клиента |
| phone | text | Телефон |
| segment | text | residential/villa/hotel/commercial |
| object | text | Описание объекта |
| budget | text | Бюджет |
| location | text | Локация |
| status | text | new/contacted/qualified/survey/proposal/deal/lost |
| source | text | chat/line/phone/referral |
| created_at | timestamptz | Дата создания |

### solar_products

| Column | Type | Описание |
|--------|------|----------|
| id | uuid | PK |
| name | text | Название |
| brand | text | Бренд |
| power | integer | Мощность (W) |
| price | numeric | Цена (THB) |
| warranty | integer | Гарантия (лет) |
| description | text | Описание |

### knowledge

| Column | Type | Описание |
|--------|------|----------|
| id | uuid | PK |
| content | text | Контент для RAG |
| embedding | vector(1536) | Векторное представление |
| metadata | jsonb | Доп. данные |

---

## 🔐 Authentication

| Route | Auth Required | Метод |
|-------|---------------|-------|
| /api/chat | ❌ | Public |
| /api/solar-products | ❌ | Public |
| /api/notify-line | ⚠️ | Internal (no external access) |
| /api/pdf/* | ⚠️ | Internal |
| /admin/* | ✅ | Supabase Auth + RLS |

---

## 🚨 Error Responses

```json
{
  "error": "Internal server error",
  "message": "AI provider unavailable",
  "status": 500
}
```

| Код | Описание | Действие |
|-----|----------|----------|
| 400 | Bad request | Проверить request body |
| 401 | Unauthorized | Проверить auth credentials |
| 404 | Not found | Проверить route path |
| 429 | Rate limit | Подождать, retry |
| 500 | Server error | Проверить logs |

---

## 📝 Environment Variables

| Variable | Где используется | Примечание |
|----------|------------------|------------|
| `ZAI_API_KEY` | /api/chat | Z.AI provider |
| `GROQ_API_KEY` | /api/chat | Groq provider |
| `GOOGLE_API_KEY` | /api/chat, /api/og | Google AI + OG |
| `OPENAI_API_KEY` | /api/chat | OpenAI (fallback) |
| `NEXT_PUBLIC_SUPABASE_URL` | Клиент | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Клиент | Supabase anon key |
| `LINE_CHANNEL_ACCESS_TOKEN` | /api/notify-line | LINE API |
| `LINE_CHANNEL_SECRET` | Webhook | LINE signature |

---

## 🔗 External Integrations

| Сервис | Зачем | Документация |
|--------|-------|--------------|
| Supabase | Database, Auth, Storage | supabase.com/docs |
| LINE Messaging API | Lead notifications | developers.line.me |
| Google AI (Gemini) | Chat, embeddings | ai.google.dev |
| Groq | Chat (fast inference) | console.groq.com |
| Vercel | Hosting, Functions | vercel.com/docs |
| Google Analytics | Трафик | analytics.google.com |

---

*Документ создан как шаблон. Требует документирования всех реальных эндпоинтов.*
