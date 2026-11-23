# Tawan Power LINE Bot — Bug Fix Master Prompt

**Reference:** `BUG_REPORT.md` — полная документация по проблеме

---

## Задача

Починить LINE bot — flex сообщения не отображаются в LINE приложении.

---

## Проблема

При нажатии кнопок **"AI ปรึกษา"** и **"แพ็กเกจ"** в LINE Rich Menu:
- Вебхук получает postback события ✅
- Хендлеры вызываются ✅  
- Flex JSON отправляется в LINE API ✅
- НО в LINE приложении карточки НЕ отображаются ❌

---

## Ключевой инсайт из тестов

**РАБОТАЕТ:** простой inline flex объект
```typescript
{
  type: 'flex',
  altText: 'Test',
  contents: {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [...]  // ← contents на box обязателен
    }
  }
}
```

**НЕ РАБОТАЕТ:** вызов `createWelcomeMessage()` из `src/lib/line-messages.ts`

---

## LINE Flex Message Spec (ОБЯЗАТЕЛЬНО К ИСПОЛЬЗОВАНИЮ)

### Every `box` element MUST have `contents: []`
```typescript
{
  type: 'box',
  layout: 'vertical',
  contents: [] // Даже если пустой — должен быть
}
```

### Every `text` element MUST have `contents: []`
```typescript
{
  type: 'text',
  text: 'Hello',
  contents: [] // Обязательно!
}
```

### Hero image requires specific property names
```typescript
hero: {
  type: 'image',
  originalContentUrl: 'https://...', // НЕ 'url'
  previewUrl: 'https://...',
  size: 'full',
  aspectMode: 'cover',
  aspectRatio: '1.51:1'
}
```

### Button action requires `displayText`
```typescript
{
  type: 'button',
  action: {
    type: 'postback',
    label: 'Text',
    data: 'action=...',
    displayText: 'Text' // Обязательно
  }
}
```

### Invalid properties to avoid
| Invalid | Valid | Why |
|---------|-------|-----|
| `url` for hero | `originalContentUrl` + `previewUrl` | LINE spec |
| `paddingAll: 'none'` | `paddingAll: 'sm'` or `'lg'` | 'none' not valid |
| Missing `contents` on box | Always `contents: []` | LINE requires |

---

## Файлы для работы

| Файл | Описание |
|------|----------|
| `src/lib/line-messages.ts` | Создаёт все flex messages |
| `src/lib/line-handlers.ts` | Обрабатывает postback действия |
| `src/app/api/line-webhook/route.ts` |Webhook endpoint |

---

## Пошаговый план

### Шаг 1: Валидировать вывод функций

В `line-messages.ts` добавить console.log для проверки JSON:

```typescript
// В createWelcomeMessage()
console.log('[DEBUG] Welcome message:', JSON.stringify(welcome, null, 2));
```

### Шаг 2: Проверить каждый элемент

Для каждого flex сообщения проверить:
- [ ] Все `box` имеют `contents: []`
- [ ] Все `text` имеют `contents: []`
- [ ] `hero.url` заменён на `originalContentUrl` + `previewUrl`
- [ ] `paddingAll` не равен `'none'`
- [ ] Все `button` actions имеют `displayText`

### Шаг 3: Использовать LINE Flex Simulator

URL: https://developers.line.biz/en/docs/messaging-api/flex-message-simulator/

Вставить JSON из `createWelcomeMessage()` и проверить валидацию.

### Шаг 4: Минимальный тест

Создать упрощённую версию `createWelcomeMessage()` с МИНИМАЛЬНЫМ количеством элементов и проверить работает ли.

---

## Критерии успеха

Flex карточки должны:
1. ✅ Отображаться в LINE при нажатии "AI ปรึกษา"
2. ✅ Отображаться в LINE при нажатии "แพ็กเกจ"
3. ✅ Показывать категории при выборе
4. ✅ Показывать product carousel

---

## Команды

```bash
# Сборка
npm run build

# Деплой
vercel --prod --yes

# Тест webhook
# GET https://tawanpower.vercel.app/api/line-webhook
```

---

## Дополнительная информация

- Thai language: primary, casual endings (ครับ/ค่ะ)
- Brand theme: green (#10B981)
- All LINE responses via webhook (not Keywords)
- Deployment: https://tawanpower.vercel.app

---

**Документация:** `BUG_REPORT.md`