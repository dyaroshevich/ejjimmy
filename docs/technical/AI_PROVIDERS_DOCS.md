# AI Providers Integration - Technical Documentation

## Обзор

Документация по интеграции AI провайдеров (Groq, OpenRouter) в проект TAWAN POWER Solar Chat.

---

## Используемые провайдеры

### 1. Groq

**Base URL:** `https://api.groq.com/openai/v1`

**Рекомендуемые модели:**

| Модель | Лимиты (RPM/RPD/TPM/TPD) | Особенности |
|--------|-------------------------|-------------|
| `llama-3.1-8b-instant` | 30 / 14.4K / 6K / 500K | Самая высокая скорость, низкая стоимость |
| `llama-3.3-70b-versatile` | 30 / 1K / 12K / 100K | Лучшее качество, поддержка Thai |
| `mixtral-8x7b-32768` | - | Хороший баланс |
| `gemma2-9b-instruct` | - | Компактная модель |

**Установка:**
```bash
npm install groq-sdk
```

**Пример использования:**
```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    { role: "user", content: "สวัสดีครับ" }
  ]
});
```

### 2. OpenRouter

**Base URL:** `https://openrouter.ai/api/v1`

**Рекомендуемые модели:**

| Модель | Context | Стоимость | Особенности |
|--------|----------|-----------|-------------|
| `google/gemma-4-31b:free` | 262K | Бесплатно | Лучшая multilingual поддержка |
| `meta-llama/llama-3.3-70b-instruct:free` | 66K | Бесплатно | Поддержка Thai |
| `nvidia/nemotron-3-super:free` | 1M | Бесплатно | Самая большая context window |
| `openai/gpt-oss-20b:free` | 131K | Бесплатно | OpenAI совместимая |

**Установка:**
```bash
npm install @openrouter/sdk
```

**Пример использования (через OpenAI SDK):**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://tawanpower.vercel.app',
    'X-OpenRouter-Title': 'TawanPower Solar Chat'
  }
});

const completion = await openai.chat.completions.create({
  model: 'google/gemma-4-31b:free',
  messages: [
    { role: 'user', content: 'สวัสดีครับ' }
  ]
});
```

**Пример использования (через @openrouter/sdk):**
```typescript
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://tawanpower.vercel.app',
    'X-OpenRouter-Title': 'TawanPower Solar Chat'
  }
});

const completion = await openRouter.chat.send({
  model: 'google/gemma-4-31b:free',
  messages: [
    { role: 'user', content: 'สวัสดีครับ' }
  ]
});
```

---

## Vercel AI SDK -注意事项

### Проблемы совместимости

AI SDK от Vercel (`@ai-sdk/openai`) может иметь проблемы с Vercel Serverless Functions.

**Рекомендации:**

1. Использовать `toUIMessageStreamResponse()` вместо `toDataStreamResponse()`
2. Использовать `convertToModelMessages()` для правильного формата сообщений
3. Проверить maxDuration (рекомендуется 30-60 секунд)

**Пример правильного ответа:**
```typescript
import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

---

## Environment Variables

### Groq

```
GROQ_API_KEY=gsk_...
```

### OpenRouter

```
OPENAI_API_KEY=sk-or-v1-...
```

---

## Fallback логика

Рекомендуется использовать fallback между провайдерами:

1. **OpenRouter** (бесплатные модели) - первым
2. **Groq** (платные, но быстрые) - fallback

---

## Тестирование

### Локальное тестирование

```bash
# Запуск dev сервера
npm run dev

# Тестирование API
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"สวัสดีครับ"}]}'
```

### Vercel тестирование

1. Деплой через GitHub (рекомендуется)
2. Проверка Environment Variables в Vercel Dashboard
3. Тестирование на https://tawanpower.vercel.app/chat

---

## Ссылки

- [Groq Docs](https://console.groq.com/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)