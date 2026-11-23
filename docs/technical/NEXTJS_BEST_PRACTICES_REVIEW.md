# Next.js Best Practices Review

**Date:** 2026-04-03  
**Branch:** `experiment/chat-fixes`  
**Next.js Version:** 14.2.10  
**Review Date:** 2026-04-03

---

## 📊 Summary

| Category | Count |
|----------|-------|
| ❌ Errors (must fix) | 5 |
| ⚠️ Warnings (should fix) | 15 |
| ✅ Good practices | 8 |

---

## ❌ ERRORS (Must Fix)

### 1. No Error/Not-Found Pages
**Severity:** 🔴 CRITICAL  
**Location:** `src/app/` (root)

**Problem:**
- No `error.tsx` anywhere in app tree
- No `not-found.tsx` anywhere in app tree
- Users see generic Next.js error pages

**Impact:**
- Poor UX при ошибках
- Нет branded 404 страницы
- Потеря пользователей при ошибках

**Fix:**
```typescript
// src/app/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2>เกิดข้อผิดพลาด</h2>
      <button onClick={() => reset()}>ลองอีกครั้ง</button>
    </div>
  );
}

// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2>404 - ไม่พบหน้านี้</h2>
    </div>
  );
}
```

---

### 2. Landing Page is 100% Client Component
**Severity:** 🔴 CRITICAL  
**Location:** `src/app/page.tsx` (line 1)

**Problem:**
- `'use client'` на всей landing page (531 строка)
- Весь JS отправляется в браузер
- SSR преимущества потеряны

**Impact:**
- Большой bundle size (~186KB First Load JS)
- Медленная загрузка на мобильных
- Плохой Lighthouse score

**Fix:**
- Вынести статические секции в Server Components
- Оставить `'use client'` только для интерактивных частей (формы, чат)

---

### 3. Supabase Anon Key in Server Route
**Severity:** 🔴 SECURITY  
**Location:** `src/app/api/chat/route.ts` (line 4)

**Problem:**
```typescript
import { supabase } from '@/lib/supabase';
// supabase.ts использует NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Impact:**
- Route handler должен использовать service role key
- Anon key bypasses Row Level Security на сервере
- Потенциальная уязвимость

**Fix:**
Создать отдельный серверный клиент с `SUPABASE_SERVICE_ROLE_KEY`

---

### 4. next.config.js ESM/CJS Mismatch
**Severity:** 🔴 BUILD  
**Location:** `next.config.js`

**Problem:**
- `package.json` имеет `"type": "module"`
- `next.config.js` использует CommonJS (`module.exports`)

**Impact:**
- Несоответствие модулей
- Может вызвать проблемы в будущем

**Fix:**
Переименовать в `next.config.mjs` с ESM синтаксисом

---

### 5. Missing Content-Type Header in Error Response
**Severity:** 🟡 API  
**Location:** `src/app/api/chat/route.ts` (line 140)

**Problem:**
```typescript
return new Response(JSON.stringify({ error: error.message }), { status: 500 });
// Missing: headers: { 'Content-Type': 'application/json' }
```

**Fix:**
```typescript
return new Response(JSON.stringify({ error: error.message }), {
  status: 500,
  headers: { 'Content-Type': 'application/json' }
});
```

---

## ⚠️ WARNINGS (Should Fix)

### 1. No Loading States
**Location:** All routes

**Problem:**
- No `loading.tsx` anywhere
- Нет streaming/loading fallback UI

**Impact:**
- Пользователи видят空白 экран при загрузке

---

### 2. SolarChat.tsx Too Large (774 lines)
**Location:** `src/components/SolarChat.tsx`

**Problem:**
- Один огромный файл
- Включает 6+ подкомпонентов
- Плохое разделение ответственности

**Fix:**
Вынести в отдельные файлы:
- `ResultDashboard.tsx`
- `JourneyWizardV9.tsx`
- `StarterMenu.tsx`
- `SuggestionChip.tsx`
- `QuickCard.tsx`

---

### 3. No Input Validation in API
**Location:** `src/app/api/chat/route.ts`

**Problem:**
- Нет валидации `messages` payload
- Нет проверки размера
- Нет rate limiting

**Impact:**
- Можно отправить огромный запрос
- Нет защиты от abuse

---

### 4. Image Optimization Missing
**Location:** Admin pages

**Problem:**
- `<img>` вместо `next/image` в admin pages
- Нет `images` конфигурации в `next.config.js`

**Files:**
- `src/app/admin/products/new/page.tsx` (line 364)
- `src/app/admin/products/[id]/edit/page.tsx` (line 395)

---

### 5. Metadata Issues
**Location:** `src/app/layout.tsx`

**Problems:**
- `lang="en"` но контент на тайском → должно быть `lang="th"`
- Нет `openGraph` metadata
- Title "Solar Krabi" но бренд "TAWAN POWER"
- Нет `robots` meta tag

---

### 6. Accessibility Issue
**Location:** `src/app/layout.tsx`

**Problem:**
```typescript
viewport: {
  maximumScale: 1,
  userScalable: false  // ❌ Users cannot zoom!
}
```

**Impact:**
- Нарушает accessibility guidelines
- Пользователи не могут увеличить текст

---

### 7. node-fetch Unnecessary
**Location:** `package.json`

**Problem:**
- `node-fetch` v3.3.2 установлен
- Next.js уже имеет встроенный `fetch`
- Лишняя зависимость

---

### 8. dotenv Unnecessary
**Location:** `package.json`

**Problem:**
- `dotenv` установлен
- Next.js handles `.env` нативно
- Нужен только для standalone scripts

---

### 9. `<head>` in Layout
**Location:** `src/app/layout.tsx`

**Problem:**
- Используется `<head>` внутри RootLayout
- В App Router нужно экспортировать `metadata` или использовать `head.tsx`

---

### 10. No robots.txt or sitemap
**Location:** Root

**Problem:**
- Нет `robots.txt` route handler
- Нет `sitemap.xml` route handler

**Impact:**
- SEO проблемы
- Поисковики не знают что индексировать

---

### 11. DetectMode is Fragile
**Location:** `src/app/api/chat/route.ts` (lines 10-23)

**Problem:**
- Простой keyword matching
- Может неправильно классифицировать сообщения

---

### 12. Error Message Leaks Implementation
**Location:** `src/app/api/chat/route.ts` (line 140)

**Problem:**
- `error.message` возвращается клиенту
- Может показать внутренние детали

---

### 13. Visual Flash on Segment Load
**Location:** `src/components/SolarChat.tsx` (line 363)

**Problem:**
- `initialMessages` инициализируется до useEffect
- Может быть flash default content перед заменой

---

### 14. Draft Input Visual Flash
**Location:** `src/components/SolarChat.tsx` (lines 449-452)

**Problem:**
- localStorage restoration может вызвать визуальный flash

---

### 15. No Rate Limiting
**Location:** `src/app/api/chat/route.ts`

**Problem:**
- API endpoint публичный без throttling
- Можно злоупотреблять

---

## ✅ WHAT'S DONE CORRECTLY

### 1. App Router Structure ✅
- Правильная структура `src/app/`
- Route handlers в `src/app/api/`
- Nested routes для admin

### 2. Client Component Directives ✅
- `'use client'` правильно используется
- Компоненты с browser API правильно маркированы

### 3. AI SDK Streaming ✅
- Использует `streamText` правильно
- Fallback между Groq и Google
- `maxDuration = 30` правильно

### 4. Font Optimization ✅
- Использует `next/font` для Inter
- Правильная настройка

### 5. React Strict Mode ✅
- `reactStrictMode: true` в next.config.js

### 6. Metadata Export ✅
- Экспортирует `metadata` и `viewport` из layout

### 7. useEffect for Browser APIs ✅
- `window.location.search` в useEffect (правильно)
- `localStorage` в useEffect (правильно)

### 8. Error Handling in useChat ✅
- `onError` callback настроен
- Try/catch в API route

---

## 🎯 TOP 5 PRIORITIES

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| **1** | Add error.tsx + not-found.tsx | Production reliability | 15 мин |
| **2** | Fix ESM/CJS mismatch | Build consistency | 5 мин |
| **3** | Add Content-Type header | API correctness | 2 мин |
| **4** | Fix lang="th" | Accessibility/SEO | 2 мин |
| **5** | Remove userScalable: false | Accessibility | 1 мин |

---

## 📋 Recommended Action Plan

### Phase 1: Critical Fixes (30 мин)
1. Create `src/app/error.tsx`
2. Create `src/app/not-found.tsx`
3. Rename `next.config.js` → `next.config.mjs`
4. Add Content-Type header to API errors
5. Fix `lang="th"` in layout

### Phase 2: Security & Performance (1 час)
6. Create Supabase service role client for server routes
7. Add input validation to API
8. Remove unnecessary dependencies (node-fetch, dotenv)
9. Fix accessibility (userScalable)

### Phase 3: Code Quality (2-3 часа)
10. Split SolarChat.tsx into smaller components
11. Extract static sections from page.tsx to Server Components
12. Add loading.tsx
13. Add OpenGraph metadata
14. Create robots.txt and sitemap.xml route handlers

### Phase 4: Production Hardening (later)
15. Add rate limiting to API
16. Add image optimization config
17. Fix admin pages to use next/image
18. Add comprehensive error handling

---

**NOTE:** This review is saved for future improvements. Current focus is on FUNCTIONALITY fixes in experiment branch.
