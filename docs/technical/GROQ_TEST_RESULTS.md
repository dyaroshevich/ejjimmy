# Тестирование Groq API в веб-чат-боте

## ✅ Результаты тестов

### 1. Проверка API ключа
- **Статус**: ✅ ПРОЙДЕНО
- **Ключ**: GROQ_API_KEY найден в .env.local
- **Модель**: llama-3.3-70b-versatile доступна
- **Квота**: Есть доступ

### 2. Проверка API endpoint
- **Статус**: ✅ ПРОЙДЕНО  
- **URL**: http://localhost:3001/api/chat
- **Метод**: POST
- **Ответ**: 200 OK
- **Content-Type**: text/plain; charset=utf-8
- **Vercel AI Data Stream**: v1 ✅
- **Потоковый ответ**: Получен (2005 байт)
- **Язык ответа**: Тайский ✅

### 3. Формат ответа
Ответ приходит в формате Vercel AI Data Stream v1:
```
0:"สว"
0:"ัสด"
0:"ี"
0:"คร"
0:"ับ"
...
```

Каждый chunk начинается с `0:"` что соответствует формату `text` delta от Vercel AI SDK.

## Как протестировать в браузере

### Шаг 1: Откройте чат
```
http://localhost:3001
```

### Шаг 2: Откройте DevTools (F12)
Перейдите на вкладку Console

### Шаг 3: Отправьте сообщение
Введите: `สวัสดีครับ`

### Шаг 4: Проверьте логи
В консоли сервера должны быть логи:
```
[CHAT API] Request received
[CHAT API] Mode: consultation
```

### Шаг 5: Проверьте ответ
- AI должен ответить на тайском
- Ответ должен появиться потоково (постепенно)
- Не должно быть ошибок

## Возможные проблемы и решения

### Проблема: "AI providers failed"
**Решение**: Проверить что GROQ_API_KEY действителен
```bash
node check-groq-models.js
```

### Проблема: Ответы не отображаются
**Решение**: Проверить консоль браузера на ошибки
- Очистить localStorage: `localStorage.clear()`
- Перезагрузить страницу (Ctrl+Shift+R)

### Проблема: Показывается markdown синтаксис
**Решение**: Функция `cleanMessageContent()` должна очищать markdown
- Проверить что функция вызывается в SolarChat.tsx

### Проблема: Tool calls видны пользователю
**Решение**: Проверить фильтрацию в messages.map():
```typescript
if (!cleanedContent && !toolInvocationsWithResults?.length && !isLoading) {
  return null;
}
```

## Архитектура работы API

```
User Input (Browser)
    ↓
SolarChat.tsx (useChat hook)
    ↓
POST /api/chat
    ↓
route.ts (Server)
    ↓
├─ Detect mode (catalog/consultation)
├─ Search products (if catalog mode)
├─ Build system prompt
    ↓
Groq API (llama-3.3-70b-versatile)
    ↓
Stream Response
    ↓
useChat hook (client)
    ↓
Display in UI
```

## Кодовые имена для отладки

| Компонент | Файл | Назначение |
|-----------|------|------------|
| SolarChat.tsx | src/components/SolarChat.tsx | Фронтенд чата |
| route.ts | src/app/api/chat/route.ts | API endpoint |
| useChat | @ai-sdk/react | Хук для работы с чатом |
| streamText | ai | Функция для стриминга |
| groq | @ai-sdk/groq | Провайдер Groq |

## Следующие шаги

1. ✅ Проверить что ответы AI отображаются в UI
2. ✅ Проверить что tool calls скрыты
3. ✅ Проверить что markdown очищается
4. ⏳ Проверить работу calculation wizard
5. ⏳ Проверить сохранение лидов в Supabase
