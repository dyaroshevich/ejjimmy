# TawanPost — Master Prompt for Senior Developer

> **TawanPost** = Content Factory / Content Machine.
> AI-powered система производства контента: research → анализ → генерация → пайплайн → календарь → публикация на площадки → аналитика.
> Блог (`/blog`) — лишь один из выходных каналов.
>
> Ветка: `tawanpost-cms`

---

## 1. Концепция: Content Factory

TawanPost — это не CMS для блога. Это **конвейер производства контента**:

```
Research ──► AI Анализ ──► AI Генерация ──► Pipeline ──► Календарь ──► Публикация ──► Аналитика
  │              │               │              │             │              │             │
  ▼              ▼               ▼              ▼             ▼              ▼             ▼
PDF/CSV      Выводы /        Статьи,        Review /      Планиро-     Facebook,     Reach /
Ссылки       Инсайты         Посты,         Approval      вание по     Instagram,    Engagement
Competitors                   Video                                       TikTok,       / Clicks
                                                                           LINE, Blog
```

**4 блока в админке:**

| Блок | Модули | Описание |
|------|--------|----------|
| **План** | Обзор, Календарь, Конвейер, Исследования | Стратегия, планирование, сбор данных |
| **Производство** | AI Генератор, Медиатека | Создание контента |
| **Публикация** | Очередь постов, Аналитика | Распространение и метрики |
| **Управление** | Франчайзи, Настройки | Мульти-франчайз, конфиги |

---

## 2. Что уже работает ✅

### Public Blog (один из выходных каналов)
- **Таблица `blog_posts`** в Supabase с RLS
- **`/blog`** — сетка постов с обложками, категориями, датами (ISR 3600)
- **`/blog/[slug]`** — Markdown, SEO, JSON-LD (`BlogPosting`), OpenGraph, прогресс чтения, CTA (SSG + ISR)
- **11 seed-статей** на тайском по солнечной тематике
- **Навигация** — "บล็อก" в хедере, "TawanPost" в админ-сайдбаре

### Admin UI (10 страниц — ВСЕ НА МОКАХ)
Красивый интерфейс, но **ни одна страница не подключена к БД**:

| Страница | Роут | Статус |
|----------|------|--------|
| Обзор | `/admin/content` | Mock-статистика |
| Календарь | `/admin/content/calendar` | Mock-события |
| Конвейер | `/admin/content/pipeline` | Локальный drag-and-drop |
| Исследования | `/admin/content/research` | Mock-загрузки |
| AI Генератор | `/admin/content/generator` | Симуляция (setTimeout) |
| Медиатека | `/admin/content/library` | Mock-сетка |
| Очередь публикаций | `/admin/content/publishing` | Mock-таблица |
| Аналитика | `/admin/content/analytics` | Mock-графики |
| Франчайзи | `/admin/content/franchises` | Mock-данные |
| Настройки | `/admin/content/settings` | Локальный state |
| NewPostModal (компонент) | — | console.log, нет API |

---

## 3. План разработки

### Фаза 1 — База (Research → Хранилище)

#### 1.1 Типы и БД
- Добавить `blog_posts` в `src/lib/database.types.ts`
- Подумать над таблицами для research, scheduling, analytics (пока blog_posts как основа)
- RLS политики INSERT/UPDATE/DELETE для админа

#### 1.2 API `/api/blog` — CRUD для постов

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/blog` | Список (пагинация, поиск, фильтр по категории/статусу) |
| GET | `/api/blog?slug=...` | Один пост |
| POST | `/api/blog` | Создать |
| PUT | `/api/blog` | Обновить |
| DELETE | `/api/blog?id=...` | Удалить |

**Параметры GET:** `?search=`, `?category=`, `?status=published|draft`, `?page=&limit=`, `?sort=&order=`

#### 1.3 Редактор постов в админке
- Список постов (таблица) → `/admin/content/posts`
- Форма создания/редактирования → `/admin/content/posts/new`, `/admin/content/posts/[id]/edit`
- Поля: title, slug (авто), content (Markdown), excerpt, cover_image, category, tags, author, published, published_at, meta_title, meta_description

#### 1.4 NewPostModal → подключить к реальному API
- Заменить `console.log` на POST `/api/blog`

---

### Фаза 2 — Контент-фабрика (AI Generator)

#### 2.1 Research module
- Загрузка PDF, CSV, ссылок конкурентов
- Сохранение в Supabase Storage (bucket `content-research`)
- Извлечение текста, базовый анализ

#### 2.2 AI Generator (настоящий AI вызов)
**Вариант А:** через существующий `/api/chat`
**Вариант Б:** выделенный эндпоинт `/api/content/generate` с промптом для генерации контента

Что генерировать:
- Статьи для блога (по ключевым словам/темам)
- Социальные посты (Facebook, Instagram, TikTok, LINE)
- Сценарии видео
- Сравнения продуктов

Форма генератора уже есть — `templates`: Industrial Guide, Case Study, Brand Comparison, Social Media Post + `tone` (Professional, Educational, Conversational, Inspiring) + `topic` + `context`.

#### 2.3 Media Library
- Подключить к Supabase Storage (bucket `content-media`)
- Категории: изображения, видео, документы
- CRUD: загрузка, удаление, поиск

---

### Фаза 3 — Пайплайн и Публикация

#### 3.1 Pipeline (Kanban)
- Колонки: New → Working → Review → Done
- Привязать к статусам post → `blog_posts.status` (draft / review / published)
- Сохранять состояние в БД

#### 3.2 Календарь
- Отображать запланированные посты из БД
- Drag-and-drop для изменения даты
- Создание поста с датой публикации

#### 3.3 Очередь публикации
- Планирование по времени: `scheduled_at`
- Мульти-платформа: Facebook, Instagram, TikTok, LINE, Blog
- Статус: draft → scheduled → published → failed

#### 3.4 Multi-platform publishing
- LINE — через существующий `/api/notify-line`
- Facebook/Instagram/TikTok — через их API (или внешний сервис)
- Blog — через `blog_posts` (уже готово)

---

### Фаза 4 — Аналитика и Управление

#### 4.1 Аналитика
- Метрики из БД: количество постов, просмотры (если логировать), по месяцам
- Лучший контент, engagement
- По платформам

#### 4.2 Франчайзи
- Мульти-франчайз контент (Krabi Master, Phuket, Bangkok)
- Общие / приватные посты
- Поле `franchise` в `blog_posts` или отдельная таблица

#### 4.3 Настройки
- Сохранять brand settings, platform connections, AI master prompt в таблицу `app_settings`
- Создать таблицу, если нет

---

## 4. Tech Stack

| Компонент | Технология |
|-----------|-----------|
| Framework | Next.js 14.2.35 (App Router) |
| Язык | TypeScript 5.3.3 |
| UI | Tailwind CSS 3.4 + shadcn/ui + Framer Motion |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (buckets: `content-media`, `content-research`) |
| AI | @ai-sdk/react — Groq / Google / Z.AI / OpenRouter |
| LINE | `/api/notify-line` (существует) |

### Ключевые файлы для референса

| Файл | Зачем |
|------|-------|
| `src/lib/supabase.ts` | `supabase` (публичный) + `supabaseAdmin` (service_role — для API) |
| `src/lib/supabase-server.ts` | `createClient()` для Server Components |
| `src/app/api/solar-products/route.ts` | Пример CRUD API с supabaseAdmin |
| `src/app/api/chat/route.ts` | Пример AI вызова (для генератора) |
| `src/app/blog/page.tsx` | Публичный список постов (как читать blog_posts) |
| `src/app/blog/[slug]/page.tsx` | Детальная страница поста |
| `src/app/admin/products/new/page.tsx` | Паттерн формы в админке |
| `src/app/admin/products/[id]/edit/page.tsx` | Паттерн редактирования |
| `docs/content-mashine.html` | HTML-прототип всей Content Factory (русский) |
| `supabase/migrations/20260602_create_blog_posts.sql` | Схема blog_posts |

### Дизайн-токены (Tailwind)

Проект использует кастомные цвета `orangeLight` / `orangeNoir`:
```ts
orangeLight: { bg, sidebar, card, text, textMuted, border, input }
orangeNoir:  { bg, sidebar, card, text, textMuted, border, input }
```

---

## 5. Coding Conventions

- **Server Components** по умолчанию. `'use client'` только для интерактива
- **API routes** — `async function GET/POST/PUT/DELETE` в `src/app/api/`
- **Admin content** — layout `ContentClientLayout.tsx` даёт сайдбар TawanPost
- **Admin API** — использовать `supabaseAdmin` (обходит RLS через service_role)
- **Public reads** — `createClient()` из `supabase-server.ts` (RLS-aware)
- **Tailwind** + **Framer Motion** — уже везде используются
- **shadcn/ui** — компоненты в `src/components/ui/`
- **UI на тайском** — все лейблы, кнопки, меню на Thai
- **Mobile-first** — адаптив
- **Без комментариев** в финальном коде (код должен быть самодокументируем)

---

## 6. Database: blog_posts

```sql
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at       TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    title            TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    excerpt          TEXT,
    content          TEXT NOT NULL,            -- Markdown
    cover_image      TEXT,
    author           TEXT DEFAULT 'TAWAN POWER Team',
    published        BOOLEAN DEFAULT false,
    published_at     TIMESTAMPTZ,
    category         TEXT,
    tags             TEXT[] DEFAULT '{}',
    meta_title       TEXT,
    meta_description TEXT
);

-- RLS: публичный SELECT для опубликованных
-- INSERT/UPDATE/DELETE — через supabaseAdmin (service_role) в API
-- ⚠️ Политики на запись нужно добавить
```

**Внимание:** `blog_posts` — временное ядро. На фазе 3-4 могут появиться:
- `research_documents` (загрузки исследований)
- `publishing_queue` (запланированные публикации по платформам)
- `app_settings` (конфиги)
- `analytics_events` (просмотры, клики)

---

## 7. Git

- Ветка: `tawanpost-cms`
- Коммиты: `feat(content): ...` / `feat(generator): ...` / `feat(pipeline): ...`
- Атомарные коммиты
- `git push origin tawanpost-cms`

---

## 8. Ключевое отличие от обычной CMS

TawanPost — это **не про блог**. Блог (`/blog`) — один из 5 выходных каналов (Blog, Facebook, Instagram, TikTok, LINE).

Content Factory — это цикл:
1. **Собираем данные** (Research) ← PDF, ссылки, конкуренты
2. **Анализируем** (AI) ← выводы, инсайты, тренды
3. **Производим** (AI Generator) ← контент на основе анализа
4. **Проверяем** (Pipeline) ← review / approval
5. **Планируем** (Calendar) ← даты и время
6. **Публикуем** (Queue) ← на все площадки
7. **Измеряем** (Analytics) ← что сработало, что нет → обратно в шаг 1

Всё завязано на AI. Поэтому AI Generator и Research — ключевые модули, не просто "редактор блога".
