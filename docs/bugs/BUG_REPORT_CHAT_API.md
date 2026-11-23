# Багрепорт: Chat API - Проблема с AI Providers

**Дата:** 18 April 2026  
**Проект:** TAWAN POWER Solar Chat  
**Статус:** ❌ Не работает (500 Internal Server Error)

---

## 📊 Симптомы

- При отправке сообщения в чате появляется ошибка: "ขออภัยครับ เกิดข้อผิดพลาด"
- Локально (localhost) - работает (иногда)
- Vercel Production - НЕ работает (500 error)
- Через curl - API работает (Groq, OpenRouter)

---

## 🔍 Тестирование

| Тест | Результат |
|------|-----------|
| Groq через curl | ✅ Работает |
| OpenRouter через curl | ⚠️ Разные ошибки (400, 404, 429) |
| Groq через AI SDK в Vercel | ❌ 500 error |
| OpenRouter через AI SDK в Vercel | ❌ 500 error |
| Локально npm run dev | ✅ Работает (иногда) |

---

## 📚 Изученная документация

### 1. Vercel AI SDK (context7.com/vercel/ai)
- Рекомендует использовать `toUIMessageStreamResponse()` вместо `toDataStreamResponse()`
- Рекомендует `convertToModelMessages()` для правильного формата сообщений
- Для Vercel нужен специальный формат ответа

### 2. Groq (context7.com/console_groq)
- Рекомендует использовать **groq-sdk** напрямую, а не OpenAI compatibility
- Пример: `import Groq from "groq-sdk"`

### 3. OpenRouter (context7.com/openrouter_ai)
- Рекомендует использовать **@openrouter/sdk** 
- Или использовать **OpenAI SDK** с baseURL
- Пример:
```typescript
import OpenAI from 'openai';
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '<OPENROUTER_API_KEY>',
  defaultHeaders: {
    'HTTP-Referer': 'https://tawanpower.vercel.app',
    'X-OpenRouter-Title': 'TawanPower Solar Chat'
  }
});
```

---

## 🚨 Корневая причина

**AI SDK (@ai-sdk/openai) несовместим с Vercel Serverless Functions**

- Через curl - всё работает ✅
- Через AI SDK - 500 error ❌

Это означает что нужно либо:
1. Изменить формат ответа (toUIMessageStreamResponse)
2. Использовать нативный SDK (groq-sdk или @openrouter/sdk)
3. Отказаться от AI SDK полностью и использовать чистый fetch()

---

## 🔧 Что пробовали менять

### Модели:
- Groq: `llama-3.1-8b-instant` → `llama-3.3-70b-versatile`
- OpenRouter: разные model ID (некоторые невалидные)

### Провайдеры:
- Сначала Groq → теперь OpenRouter первым

### Base URL:
- Groq: `https://api.groq.com/openai/v1` ✅
- OpenRouter: `https://openrouter.ai/api/v1` ✅

---

## 💡 Рекомендации по улучшению

### Вариант A: Исправить AI SDK (быстро)
1. Изменить `toDataStreamResponse()` → `toUIMessageStreamResponse()`
2. Добавить `convertToModelMessages()`
3. Проверить maxDuration

### Вариант B: Использовать нативные SDK (правильно)
1. Для Groq: использовать `groq-sdk` вместо @ai-sdk/openai
2. Для OpenRouter: использовать `@openrouter/sdk` или чистый fetch()

### Вариант C: Использовать чистый fetch() (надёжно)
- Убрать все AI SDK зависимости
- Использовать нативный fetch() для API вызовов
- Это точно будет работать в Vercel

---

## 📋 Текущее состояние (последний деплой)

- Код: OpenRouter первым (google/gemma-4-31b:free)
- Fallback: OpenRouter Llama + Groq
- Деплой: выполнен
- Результат: ❓ Нужно тестировать

---

## 🎯 Следующие шаги

1. Протестировать текущий деплой
2. Если не работает - перейти на чистый fetch()
3. Использовать нативные SDK вместо AI SDK