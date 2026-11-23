# Tawan Power — Blind Spots Audit

**Дата:** 17 May 2026
**Проект:** Tawan Power (Next.js + Supabase + LINE Messaging API)
**Аудит:** Security, Error Handling, Business Logic, Performance

---

## ⚡ Стратегия LINE + Админ-уведомления (обновлено 18 May 2026)

### Проблема
LINE Developer Free Plan = **300 messages/month** на Push API.
LINE Notify — **закрыт/недоступен**.
Приложение сейчас отправляет push-уведомления админу при каждом лиде — лимит сгорит за 2-3 дня.

### Новая архитектура: PWA Admin App

```
ПОТОК ЛИДОВ:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Сайт      │     │   Чат        │     │  LINE Bot   │
│   /lead     │     │   /chat      │     │  (user)     │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                    ┌─────────────┐
                    │  Supabase   │  ← ЕДИНЫЙ ЦЕНТР ХРАНЕНИЯ
                    │   leads     │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │  PWA      │  │ Telegram   │  │ LINE Bot   │
     │  Admin    │  │ Bot        │  │ (reply)    │
     │  App      │  │            │  │            │
     │ (push+badge)│ │ (fallback) │  │ (user comm)│
     └───────────┘  └───────────┘  └───────────┘
```

### Компоненты стратегии

#### 1. PWA Admin App (ОСНОВНОЕ — реализуем сейчас)

**Почему PWA:**
- **Web Push Notifications**: Работают бесплатно, приходят на любые устройства (Android, PC, iOS при установке).
- **Multi-device Support**: Пуши приходят всем админам, установившим приложение.
- **Superadmin-First**: Сейчас фокус на одном главном админе (владельце), поддержка менеджеров — в будущем.
- **Installable**: Кнопка "Установить" для мгновенного доступа с рабочего стола.

**Функционал PWA Admin:**
```
✅ Авторизация (Supabase Auth - Credentials в браузере)
✅ Dashboard с непрочитанными лидами (badge count)
✅ Web Push Notifications (VAPID/Web Push API)
✅ Список всех лидов с фильтрами по Source
✅ Детали лида (Bill, kW, Location)
✅ Управление продуктами
```

#### 2. Supabase как единый центр (Omnichannel)

**Все лиды стекаются в одну таблицу `leads`:**
- `source`: website | chat | line | telegram (future) | manual
- `status`: new | contacted | qualified | lost | won
- `unread`: boolean для индикации новых событий

**Зачем:**
- Единый "Inbox" для всех каналов продаж.
- Сквозная аналитика эффективности маркетинга.
- Исключение дублей контактов.

#### 3. Push-инфраструктура

Мы используем **Pure Web Push (VAPID)**. 
- **Плюсы**: Нет привязки к Firebase SDK, меньше лишнего кода.
- **Что нужно**: Сгенерировать VAPID ключи и добавить в `.env.local`.
- **Процесс**: При входе в админку браузер просит разрешение -> сохраняет Push Subscription в Supabase под ID пользователя.

### Роадмап реализации (Новая итерация)

| Фаза | Что | Приоритет | Статус |
|------|-----|------------|--------|
| **1. DB & Auth** | Миграция `leads` (source, status) + Настройка Supabase Auth | P0 | NEXT |
| **2. PWA Foundation** | manifest.json + Icons + Service Worker (offline cache) | P0 | NEXT |
| **3. Web Push** | Subscription manager + VAPID notification backend | P0.5 | NEXT |
| **4. Admin UI** | Dashboard с Realtime-списком и фильтрами | P1 | NEXT |
| **5. Omnichannel** | Подключение LINE к новой структуре `leads` | P1 | BACKLOG |


### Бесплатные API для админ-уведомлений

- ✅ **Web Push API** — работает в Chrome/Safari/Firefox, бесплатно
- ✅ **Telegram Bot API** — бесплатно, безлимитно
- ✅ **Supabase Realtime** — слушать изменения в leads, обновлять UI
- ✅ **LINE Reply API** — для бота (user → bot), бесплатно
- ❌ ~~LINE Notify~~ — закрыт
- ⚠️ **LINE Push** — 300/mo, только для бота

---

## 🔴 CRITICAL — Исправить ASAP

### 1. Нет авторизации на `/admin/*`

| Файл | Строка | Описание |
|------|--------|----------|
| `src/app/admin/layout.tsx` | 10-16 | Layout не проверяет сессию пользователя |
| `src/app/admin/page.tsx` | 23-40 | Загружает лиды без auth |
| `src/app/admin/leads/page.tsx` | 13-20 | Открыт доступ ко всем лидам |
| `src/app/admin/super/page.tsx` | 25-93 | Супер-админ панель полностью открыта |

**Последствия:** Любой человек, знающий URL `/admin`, `/admin/leads`, `/admin/super` — видит все данные, может редактировать.

**Решение:** Добавить middleware или проверку сессии через Supabase Auth / NextAuth.

---

### 2. RLS отключён на 3 таблицах

| Таблица | Файл миграции |
|---------|---------------|
| `leads` | `supabase/migrations/20260517000000_fix_leads_rls.sql` |
| `solar_products` | `supabase/migrations/20260315114445_disable_rls_solar_products.sql` |
| `knowledge` | Создана без RLS |

**Последствия:** Клиентские запросы (из админки) работают без ограничений. Если кто-то получит `NEXT_PUBLIC_SUPABASE_ANON_KEY` — полный доступ к данным.

**Решение:** Включить RLS + написать policies для anon key (только read) и service role (admin операции).

---

## 🟠 HIGH

### Безопасность

| # | Проблема | Файл | Строка |
|---|----------|------|--------|
| H1 | `/api/notify-line` — без авторизации | `src/app/api/notify-line/route.ts` | 4 |
| H2 | `/api/solar-products` POST — без авторизации | `src/app/api/solar-products/route.ts` | 36 |
| H3 | Нет валидации phone в лидах (XSS, мусор) | `src/lib/lead-manager.ts` | 84-102 |
| H4 | Нет rate limiting на всех API routes | Все `src/app/api/**/*.ts` | — |
| H5 | Нет XSS sanitization на name, location, notes | `src/lib/lead-manager.ts` | 49-64 |

### Бизнес-логика

| # | Проблема | Файл | Строка | Последствия |
|---|----------|------|--------|-------------|
| B1 | Дубли лидов не проверяются | `src/lib/lead-manager.ts` | 30-82 | Один человек = 10 записей |
| B2 | Калькулятор не сохраняет auto | `src/lib/line-handlers.ts` | 437-452 | Данные теряются при закрытии LINE |
| B3 | AI чат не извлекает лиды | `src/app/api/chat/route.ts` | 68-133 | Телефон/имя спрашивает, но не сохраняет |
| B4 | LIFF profile в sessionStorage | `src/app/liff/page.tsx` | 36-39 | При закрытии LINE — безымянный пользователь |
| B5 | Rich Menu script нет rollback | `scripts/setup-rich-menu.mjs` | 145-160 | Падение на середине = бот без меню |

### Производительность

| # | Проблема | Файл | Строка |
|---|----------|------|--------|
| P1 | N+1 запросы в DynamicProductGroup | `src/components/SolarChat.tsx` | 94-114 |
| P2 | Все продукты без пагинации | `src/components/ProductGrid.tsx` | 25-28 |
| P3 | `ProductCard` использует `<img>` | `src/components/ProductCard.tsx` | 70-75, 147-152 |
| P4 | Нет кэширования `/api/solar-products` | API route | — |
| P5 | SolarChat полный перерендер списка | `src/components/SolarChat.tsx` | 637-683 |

---

## 🟡 MEDIUM

### Безопасность

| # | Проблема | Файл | Строка |
|---|----------|------|--------|
| M1 | Hardcoded URL 8+ мест | `line-handlers.ts`, `line-messages.ts`, `line-webhook.ts` | — |
| M2 | `JSON.parse` без try/catch в webhook | `src/app/api/line-webhook/route.ts` | 101 |
| M11 | Vercel Serverless Timeouts (10s limit) | `src/app/api/chat/route.ts` | AI providers могут отвечать 10-30s → нужен edge runtime |
| M12 | Квоты LINE Push API (300 msg/mo) | `src/app/api/notify-line/route.ts` | **РЕШЕНО:** Переводим на Telegram + LINE Notify (см. секцию "Стратегия LINE") |
| M13 | Отсутствие PDPA Disclaimer | `src/components/LeadForm.tsx` | Нужен чекбокс согласия + текст на Thai |

### Бизнес-логика

| # | Проблема | Файл | Строка |
|---|----------|------|--------|
| M3 | LINE context — без try/catch | `src/lib/line-context.ts` | 32-50, 53-75, 109-120 |
| M4 | `handleSurveySegment`, `updateLeadWithPhone` — без error handling | `src/lib/line-handlers.ts` | 617-628, 900-914 |
| M5 | LINE webhook: неизвестные события silently ignored | `src/app/api/line-webhook/route.ts` | 183-185 |
| M6 | `LeadForm`: fetch к notify-line без await | `src/components/LeadForm.tsx` | 79-92 |
| M7 | `handleSaveResult` — silent failure | `src/components/SolarChat.tsx` | 587-597 |

### Производительность

| # | Проблема | Файл | Строка |
|---|----------|------|--------|
| M8 | Landing page — `'use client'`, нет SSR/SSG | `src/app/page.tsx` | 1 |
| M9 | `handleQuickAction` без useCallback | `src/components/SolarChat.tsx` | 503-526 |
| M10 | Нет composite индекса `(type, power_kw)` | Supabase | — |

---

## 🟢 LOW

| # | Проблема | Файл |
|---|----------|------|
| L1 | Empty state в web-каталоге не обработан | `src/app/page.tsx` |
| L2 | LINE catalog: 50+ продуктов → только 3 (hardcoded 50KB fallback) | `src/lib/line-handlers.ts:285-290` |
| L3 | Нет `loading="lazy"` на большинстве изображений | Разные |
| L4 | `parseUserBillInput` возвращает null без warn | `src/lib/line-calculator.ts:63-73` |
| L5 | `getLineProfile` без await в submitLead | `src/lib/lead-manager.ts:38-43` |

---

## Приоритеты исправления

### P0 — Критические (немедленно)

1. **Авторизация `/admin/*`** — любой может видеть/редактировать данные
2. **Включить RLS на `leads`, `solar_products`, `knowledge`** — защита на уровне БД

### P0.5 — PWA Admin App (критично для бизнеса)

3. **PWA Admin с Web Push Notifications** — приоритет №1
   - Создать `/admin/pwa` с manifest.json
   - Добавить service worker для push
   - Реализовать Web Push API
   - Auth через Supabase
   - Badge count на иконке

4. **Улучшить структуру таблицы leads**
   - Добавить `source` enum: website|chat|line|manual
   - Добавить `status` enum: new|contacted|qualified|lost|won
   - Добавить `unread` boolean для админ-интерфейса
   - Добавить `admin_id` для назначения менеджера

5. **Supabase Realtime для админки**
   - Слушать INSERT в `leads`
   - Обновлять UI в реальном времени
   - Триггерить Web Push при новом лиде

6. **Telegram Bot как fallback**
   - Создать бота через @BotFather
   - Реализовать `/api/telegram/route.ts`
   - Отправлять лиды в Telegram

7. **Исправить Vercel Timeout** — `runtime: 'edge'` для `/api/chat`

### P1 — Высокие (в ближайшее время)

5. Валидация phone + deduplication лидов
6. N+1 fix + пагинация ProductGrid + `next/image`
7. Добавить try/catch в `line-context.ts`
8. PDPA Disclaimer в LeadForm + LINE lead flow

### P2 — Средние (планово)

7. Rate limiting на AI и LINE API
8. Auto-save calculator results
9. LIFF profile персистентность в БД (fallback если sessionStorage пуст)
10. Rich Menu rollback в скрипте

### P3 — На будущее

11. Memoize SolarChat messages
12. SSR/SSG для landing page
13. useCallback на handleQuickAction
14. Composite index в Supabase

---

## Детали по каждому пункту

### H3 — Валидация phone

**Текущее поведение:**
```typescript
// src/lib/lead-manager.ts:102
phone: data.phone?.replace(/[^0-9]/g, '') || null,
```
Принимает любую строку цифр.

**Thai mobile формат:** 10 цифр, начинается с `08`, `09`, `06`

**Решение:** Добавить regex: `/^0[689]\d{8}$/`

---

### B1 — Deduplication лидов

**Текущее поведение:** При каждом сабмите — INSERT без проверки.

**Решение:** Перед INSERT проверять:
```sql
SELECT id FROM leads
WHERE phone = $1 OR line_id = $2
ORDER BY created_at DESC LIMIT 1;
```
Если есть — обновлять существующий, не создавать новый.

---

### P1 — N+1 в DynamicProductGroup

**Текущее поведение:**
```typescript
// SolarChat.tsx:94-114
productIds.forEach(id => {
  const { data } = await supabase.from('solar_products').select('*').eq('id', id);
});
```

**Решение:** Один запрос с `.in('id', productIds)`

---

### H1 — Auth на /api/notify-line

**Текущее поведение:** Любой POST на `/api/notify-line` отправляет push.

**Решение:** Добавить проверку:
- API key в header (например `X-Admin-Key`)
- Или проверка через Supabase service role
- Или HMAC signature

---

---

## 🔬 Мнение Peer-Developer (Обновлено 18 May 2026)

Проект прошел стадию "быстрого прототипа" и готов к реальным клиентам, но архитектурно сейчас напоминает "карточный домик" из-за зависимости от LINE Messaging API и отсутствия базовой безопасности в админке.

### Ключевое решение: PWA Admin App

**Почему PWA вместо LINE Notify:**
LINE Notify закрыт — это не проблема, это возможность сделать более надежную систему.

Web Push API в Chrome/Safari работает идентично Android notifications:
- Приходят на экран телефона
- Можно настроить звук + вибрацию
- Badge count на иконке (показывает непрочитанные лиды)
- Работает пока открыт браузер (или установлен PWA)

Если пользователь "установил" PWA на домашний экран телефона — это практически Android app без Google Play.

### Основные риски по моему мнению:

1.  **Нет авторизации в админке**: Отсутствие auth на `/admin` — это открытая дверь. P0.
      *   *Решение:* Supabase Auth для админов. Роли: admin, super_admin.

2.  **Структура данных не отражает реальность**: Все лиды из разных каналов (site, chat, LINE) хранятся в одной таблице без source. Невозможно анализировать эффективность каналов.
      *   *Решение:* Добавить `source` enum, `status`, `unread` boolean.

3.  **Vercel Timeout vs AI**: AI ответы иногда >10 секунд. Vercel обрывает.
      *   *Решение:* `runtime: 'edge'` в `/api/chat`.

4.  **PDPA (Thailand)**: Сбор phone без согласия — юридический риск.
      *   *Решение:* Добавить чекбокс согласия в LeadForm.

### Роадмап по приоритету:

```
СЕЙЧАС (immediate):
├── PWA Admin App (Web Push Notifications)
├── Auth на /admin (Supabase Auth)
├── Supabase: leads.source, status, unread
└── Supabase Realtime (live updates)

ПОТОМ (1-2 недели):
├── Telegram Bot (fallback notifications)
├── RLS на таблицах
└── Edge runtime для /api/chat

БУДУЩЕЕ (мечты):
├── Android APK (Trusted Web Activity)
├── F-Droid публикация
└── Офлайн-режим с IndexedDB sync
```

*Документ обновлен 18 May 2026*