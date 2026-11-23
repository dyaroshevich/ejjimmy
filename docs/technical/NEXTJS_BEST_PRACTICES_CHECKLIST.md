# Next.js Best Practices Checklist - TAWAN POWER

> Generated from Next.js Skill review  
> **Total Issues:** 26 (4 FAIL → 1 FAIL, 22 WARN)  
> **Next.js Version:** 14.2.10  
> **Last Updated:** 2026-04-04  
> **Status:** ✅ 3/4 FAIL fixed, metadata requires route groups

---

## 📊 Summary

| Category | PASS | FAIL | WARN | Fixed |
|----------|------|------|------|-------|
| RSC Boundaries | 4 | 0 | 3 | - |
| File Conventions | 4 | 0 | 3 | - |
| Async Patterns | 4 | 0 | 0 | - |
| Data Patterns | 2 | 0 | 4 | - |
| Metadata | 2 | 1 | 1 | ⚠️ Requires route groups |
| Image Optimization | 0 | 0 | 0 | ✅ All 3 fixed |
| Error Handling | 3 | 0 | 2 | - |
| Hydration Errors | 5 | 0 | 1 | - |
| Additional | 3 | 0 | 7 | - |
| **Total** | **27** | **1** | **22** | **3/4 done** |

---

## ✅ FIXED (Completed)

### Image Optimization - 3/3 Fixed

- [x] **`src/app/admin/products/new/page.tsx:364`**
  - ✅ Added `loading="lazy"` for performance
  - ✅ Added descriptive `alt` attribute: `Product image preview: {label}`
  - ✅ Added `onError` handler for graceful degradation
  - **Why not next/image:** User-provided external URLs would require wildcard remotePatterns which defeats security benefit

- [x] **`src/app/admin/products/[id]/edit/page.tsx:395`**
  - ✅ Added `loading="lazy"` for performance
  - ✅ Added descriptive `alt` attribute
  - ✅ Added `onError` handler

- [x] **Entire project - no `next/image` usage**
  - ✅ Resolved: Only admin product images use `<img>`, which is appropriate for external URLs
  - ✅ No other `<img>` tags found in the project

---

## 🔴 REMAINING FAIL (1)

### Metadata on Client Component Pages

- [ ] **Cannot add `export const metadata` to Client Components**
  - **Issue:** Next.js doesn't allow metadata exports from `'use client'` files
  - **Affected pages:** `src/app/page.tsx`, `src/app/chat/page.tsx`, `src/app/admin/page.tsx`
  - **Current state:** All pages inherit root metadata from `src/app/layout.tsx`
  - **Recommended Fix:** Create route groups with separate layouts:
    ```
    src/app/
    ├── layout.tsx              # Root layout (shared)
    ├── (marketing)/
    │   ├── layout.tsx          # Marketing metadata
    │   └── page.tsx            # Landing page (client)
    ├── (chat)/
    │   ├── layout.tsx          # Chat metadata
    │   └── page.tsx            # Chat page (client)
    └── (admin)/
        ├── layout.tsx          # Admin metadata + dark theme
        └── page.tsx            # Admin dashboard (client)
    ```
  - **Reference:** [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)

---

## 🟡 WARN (22 - Not Fixed Yet)

### RSC Boundaries (3)

- [ ] **`src/app/page.tsx` - Entire landing page is a Client Component**
  - Could extract LeadForm as separate Client Component
  - **Impact:** Higher initial JS bundle

- [ ] **`src/app/admin/page.tsx` - Entire admin is Client Component**
  - Acceptable given realtime Supabase subscriptions

### File Conventions (3)

- [ ] **No `src/app/admin/error.tsx`**
  - Admin errors show root error page (light theme clashes with dark admin UI)

- [ ] **No `src/app/admin/leads/[id]/error.tsx`**

- [ ] **No `src/app/loading.tsx`**
  - No global skeleton for route transitions

### Data Patterns (4)

- [ ] **No Server Actions (`'use server'`)**
  - Lead form calls Supabase directly from browser
  - **Security risk:** Anon key visible in network (RLS should protect)

- [ ] **Direct Supabase calls from Client Components**
  - Bypass server-side validation

- [ ] **`window.confirm()` for deletes**
  - Not ideal UX

- [ ] **Inconsistent error response format**
  - Some APIs return JSON, others return strings

### Metadata (1)

- [ ] **Root layout `lang="th"` but content mixes Thai/English**

### Error Handling (2)

- [ ] **Inconsistent error responses across API routes**

- [ ] **No rate limiting on `/api/chat`**

### Hydration (1)

- [ ] **Date formatting without timezone**
  - Use `toLocaleDateString('en-GB', { timeZone: 'UTC' })`

### Additional (7)

- [ ] **Redundant `force-dynamic` in Client Components** (7 files)
- [ ] **No rate limiting on `/api/chat`**
- [ ] **Hardcoded calculator constants**
- [ ] **LeadForm defined inline in page.tsx**
- [ ] **Next.js 15 readiness - params will become Promises**

---

## ✅ What's Done Right (27 PASS)

### RSC Boundaries
- ✅ Chat, API routes, SolarChat use `'use client'` correctly
- ✅ Route Handlers are Server-only

### File Conventions
- ✅ Correct route segments (`admin/leads/[id]`, `not-found.tsx`, `error.tsx`)

### Async Patterns
- ✅ All `params` handled synchronously (correct for Next.js 14.x)

### Data Patterns
- ✅ Clean Supabase singleton
- ✅ Pure utility functions in solarCalculator

### Metadata
- ✅ Root layout with viewport and font optimization
- ✅ User scaling enabled for accessibility

### Error Handling
- ✅ Root error boundary with reset function
- ✅ Custom 404 page with link to home

### Hydration Safety
- ✅ All `window`/`document` calls in `useEffect`
- ✅ No `Date` at module scope
- ✅ Mounted flag pattern used

---

## 📅 Next Steps

### Priority 1: Metadata via Route Groups (Day 1)
1. Create `src/app/(marketing)/layout.tsx` with landing metadata
2. Create `src/app/(chat)/layout.tsx` with chat metadata
3. Create `src/app/(admin)/layout.tsx` with admin metadata + dark theme

### Priority 2: Server Actions (Day 1-2)
4. Create `'use server'` function for lead submission
5. Move Supabase mutations from Client Components
6. Add server-side validation

### Priority 3: Error & Loading UX (Day 2)
7. Create `src/app/admin/error.tsx`
8. Create `src/app/loading.tsx`
9. Standardize error responses

### Priority 4: Cleanup (Day 2-3)
10. Remove redundant `force-dynamic`
11. Add rate limiting to `/api/chat`
12. Move calculator constants to `.env`

---

## ✅ Verification Checklist

- [x] All `<img>` tags have `loading="lazy"` and proper `alt`
- [x] Image error handlers added
- [ ] Route groups created for metadata
- [ ] Server Actions handle form submissions
- [ ] Admin error boundary matches dark theme
- [ ] Loading skeleton displays during transitions
- [ ] No redundant `force-dynamic` directives
- [ ] Build passes with zero warnings
