# 📋 Tawan Power: Master Pending Tasks (Post-Audit 2026-05-18)

Этот файл объединяет все выявленные "слепые пятна", планы из ROADMAP и технические задачи.

---

## 🔴 Priority: P0 — Security & Core Stability (ASAP)

### 1. Database Security (Supabase RLS & RBAC)
- [x] Включить Row Level Security (RLS) для таблиц `leads`, `solar_products`, `knowledge`.
- [x] Реализовать RBAC (Role Based Access Control): проверка роли `admin` в метаданных пользователя вместо email.
- [x] Унифицировать создание Supabase клиента через `supabase-server.ts`.
- [x] Защитить API Route `/api/solar-products` и `/api/push/send` (убран `SERVICE_ROLE_KEY`).
- [x] Защитить `/api/notify-line`: проверка существования лида в БД перед отправкой push.

### 2. Admin Authentication Cleanup
- [x] Убедиться, что ВСЕ маршруты `/admin/*` защищены middleware.
- [x] Проверить `/admin/super/page.tsx` (был риск открытого доступа).

---

## 🟠 Priority: P1 — Business Logic & Real Data

### 3. Real Admin Details
- [x] Оживить `src/app/admin/leads/[id]/page.tsx`: заменить моковые данные на реальные поля из Supabase (Bill, kW, Payback, Location).
- [x] Добавить управление статусом лида (`new`, `contacted`, `qualified`, `lost`, `won`).

### 4. Lead Quality & Deduplication
- [x] Валидация номера телефона (Thai format: 10 digits, starts with 06/08/09).
- [x] Логика дедупликации: при повторном сабмите обновлять существующий лид, а не создавать новый.

### 5. Chat Conversion Optimization
- [x] **Edge Runtime**: Перевести `/api/chat` на `runtime: 'edge'`, чтобы избежать таймаутов (10с) при медленных ответах AI.
- [x] **Contact Proactive Flow**: Улучшить системный промпт, чтобы ИИ настойчивее просил контакт после расчета.

---

## 🟡 Priority: P2 — PWA & Admin Experience

### 6. PWA Admin App
- [x] Настроить `manifest.json` и иконки.
- [x] Внедрить **Web Push Notifications** (VAPID) — бесплатная альтернатива LINE Push.
- [x] Добавить Badge Count (счетчик на иконке приложения) для новых лидов.

### 7. Supabase Realtime
- [x] Настроить Realtime подписку в админке, чтобы список лидов обновлялся мгновенно без рефреша.

---

## 🟢 Priority: P3 — Design & Technical Debt

### 8. UI/UX Polish (Design Improvement Plan)
- [x] Убрать "AI Slop": чрезмерные градиенты, шум, тени (`shadow-xl` -> `shadow-md`).
- [x] Исправить типографику: уменьшить использование `font-black` и `uppercase`.
- [x] Ограничить выбор: не более 4 кнопок на одном шаге чата.

### 9. Technical Optimizations
- [x] Исправить N+1 запросы в `DynamicProductGroup` (SolarChat.tsx).
- [x] Заменить `<img>` на `next/image` в `ProductCard`.

---

## 🚀 Priority: P1 — TawanPost (Content Factory Evolution)

### 10. Core Infrastructure (Research & Production)
- [x] Реализовать CRUD API для `blog_posts`.
- [x] Реализовать сохранение в `content_pipeline` (Kanban) и `content_calendar`.
- [x] Подключить мульти-провайдерный ИИ (Gemini 2.0 / Groq) для анализа исследований.
- [x] Добавить MD5-хеширование для предотвращения дубликатов в Research.

### 11. Bottleneck Mitigation (Technical)
- [ ] **RAG for Research**: Внедрить векторный поиск (Supabase Vector) для обработки больших PDF. Сейчас передается только 10к символов, что недостаточно для глубокого анализа.
- [ ] **Media Library Persistence**: Реализовать реальный эндпоинт `/api/admin/content/library` с сохранением в БД и MD5-проверкой (аналогично Research).
- [ ] **Background Document Processing**: Вынести парсинг тяжелых PDF в Edge Functions или фоновые задачи, чтобы избежать таймаутов Vercel (60с).

### 12. UI/UX & Module Integration
- [ ] **"Research to Post" Bridge**: Добавить кнопку в результат AI-анализа, которая сразу переносит инсайты в AI Generator для написания статьи.
- [ ] **Visual Task Progress**: Добавить в карточки Kanban индикатор готовности (например, "Текст готов", "Изображения загружены").
- [ ] **Media Previews**: Автоматическая генерация thumbnails для видео и PDF в медиатеке.
- [ ] **Collaboration**: Добавить простую систему комментариев/заметок внутри карточек Pipeline.

---

## 📁 Related Documents
- `docs/audit/BLIND_SPOTS.md` — Детальный технический аудит.
- `REAL_WORLD_EVOLUTION_PLAN.md` — Бизнес-стратегия на будущее.
- `DESIGN_IMPROVEMENT_PLAN.md` — Гайдлайны по UI.

---
*Дата создания: 18 мая 2026*
