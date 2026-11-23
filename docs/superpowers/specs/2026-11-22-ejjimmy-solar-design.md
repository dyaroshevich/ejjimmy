# Ejjimmy Solar — Site + Admin Spec

**Date:** 2026-11-22  
**Template:** tawanpower (branch `template`)  
**Branch for work:** `feat/ejjimmy` (new)  
**Repo:** new repo `ejjimmy` (clone of tawanpower structure)

---

## 1. Decisions (locked)

| Decision | Choice |
|----------|--------|
| Brand | Separate new brand "Ejjimmy" — not Solar1 rebrand |
| Name meaning | No specific meaning; positioning derived from market research |
| MVP scope | Full template clone: site + AI chat + admin panel + LINE + Supabase |
| Deployment | Separate Vercel project; shared Supabase project, `ejjimmy_` table prefix |
| Language | Thai primary + English mirror; catalog/case content stays Thai in all 8 locales |
| Research | Build fresh from Solar1 research (curated, not full import) |
| Tech stack | Next.js 14.2.35 + TypeScript 5.3.3 + Supabase + Tailwind + shadcn/ui + Framer Motion + `@ai-sdk/react` |
| Locales | th (default), en, zh-CN, ru, de, fr, ja, ko |

---

## 2. Scope — what's in / out of MVP

**In scope:**
- Public site: home + ~18 curated SEO pages across 8 locales
- AI chat with RAG over Ejjimmy knowledge base, lead-qualification flow
- Lead capture → Supabase `ejjimmy_leads` + LINE notification (`/api/notify-line`)
- Admin panel: `/admin/leads`, `/admin/products`, `/admin/super`
- Product catalog (`ejjimmy_products`) curated from market research
- Lead magnets (~8 free PDFs/Excel) + 2 paid tripwires (audit 1,500 THB, roof survey 1,500 THB, 100% credit to project)
- PDPA consent checkbox on lead form
- WCAG 2.2 AA, mobile-first, semantic tokens from DESIGN.md

**Out of scope (post-MVP):**
- Full translation of catalog into all 8 locales (stays Thai)
- Calculator-with-price page (price only after lead, per cannibalization rule)
- PPA as a bookable product (referral-only, per SYS-14)
- Floating solar, off-grid island as bookable products (reference only)
- New SMS, WhatsApp, or email drip beyond LINE

---

## 3. Architecture & data flow

### 3.1 Layer diagram (text)

```
Browser (next-intl, localePrefix: as-needed)
        │
        ▼
src/app/layout.tsx  (html lang, hreflang, shell chrome: header/footer/ai-bar)
        │
├──────┴──────┬──────────────────────────────┐
│             │                              │
page.tsx      /chat (useChat, RAG)          /admin/*
(landing)     (/api/chat)                   (leads/products/super)
                                                          │
                                                          ▼
                                                    Supabase (ejjimmy_* tables)
                                                          │
                                                          ▼
                                                    /api/notify-line → LINE OA
```

### 3.2 Data model (Supabase, `ejjimmy_` prefix)

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `ejjimmy_products` | Catalog | id, name, model, category, price_thb, specs JSONB, image_url, lang, active |
| `ejjimmy_leads` | Lead submissions | id, name, phone, segment, object, budget, status, notes (PDPA consent), created_at |
| `ejjimmy_knowledge` | RAG for AI chat | id, content, source, lang, embedding |

Mirrors tawanpower's `leads` / `solar_products` / `knowledge` exactly, so `submitLead()`, `useChat`, `/api/chat`, `/api/notify-line` carry over unchanged.

### 3.3 Data flow

1. **Lead capture:** ContactSection form → `handleSubmit` (PDPA gate, `noValidate`) → `submitLead()` → `ejjimmy_leads` + `/api/notify-line` → success panel.
2. **AI chat:** `useChat` → `/api/chat` → RAG over `ejjimmy_knowledge` → qualify segment/budget/location/contact → on explicit request → LINE + Supabase.
3. **Catalog:** `/admin/products` → CRUD `ejjimmy_products` → public product cards/modals.
4. **Locale:** `resolveLocale()` ranks `Accept-Language` by `q` values, Thai floor. Unprefixed URL = Thai. `/<locale>/…` rewritten by middleware. `next-themes` for dark mode.

---

## 4. Components & pages

### 4.1 Public site (carried over from tawanpower, rebranded)

| Band / page | Source | Ejjimmy treatment |
|-------------|--------|-------------------|
| `uni-hero` | tawanpower | Ejjimmy wordmark, collage + snap strip, CTA to #contact |
| `uni-trust` | tawanpower | Partners / trust logos |
| `uni-features` | tawanpower | Services / value props |
| `uni-header` | tawanpower | Skip link, nav, locale, theme, CTA; sticky with `--pin-h` gutter offset |
| `uni-systems`/`uni-products` | tawanpower | Tier strip, category pills, product-card badges, installment line (`price × 0.9 / 24`) |
| `uni-sigen` | tawanpower | Sigenergy-style premium band |
| `uni-steps` | tawanpower | 5-step process |
| `uni-segments` | tawanpower | Home / Business / Hybrid card anatomy |
| `uni-knowledge` | tawanpower | Tabbed Q&A (not article preview) |
| `uni-cases` | tawanpower | `.grid2` cards, `.case-stats`, `#contact` CTA |
| `uni-contact` | tawanpower | `.lead-grid` + PDPA line + `.success` panel |
| `uni-footer` | tawanpower | `.foot-grid`, contact card, LINE button |
| `uni-ai-bar` | tawanpower | Sticky chat bar (IntersectionObserver, steps aside at footer) |

Inner pages: `/cases`, `/blog`, `/privacy`, `/terms`, `/login`, `/liff`, `/partner`, `/segments`, `/admin`, `/proposal`, `/v`, `/view`, `/thank-you`.

### 4.2 New / adapted components for Ejjimmy

- `ProductModal.tsx` (ported from tawanpower) — dialog with Esc, focus trap, backdrop; CTA above description; `specifications` map rendered as table with humanised keys (`panel_warranty` → "Panel warranty"), boolean as `✓`.
- Lead magnets: downloadable PDF/Excel from `public/lead-magnets/`.
- Tripwire booking: form for LM-17 / LM-19 (1,500 THB, credited to project).

### 4.3 Admin panel

| Route | Purpose |
|-------|---------|
| `/admin/leads` | View/filter `ejjimmy_leads`, PDPA consent shown in notes |
| `/admin/products` | CRUD `ejjimmy_products` (name, model, price, specs, image) |
| `/admin/super` | AI config, system settings |

69 `<label>` tags, all associated (`htmlFor`/`id` or wrapping), per `scripts/label-audit.mjs` convention.

---

## 5. Curated content from market research (build fresh, not full import)

Source: `k:\workspaces\workspaces\solar_\market_research\03-report-результат\`

| Category | Research total | Ejjimmy MVP curation | Rationale |
|----------|---------------|----------------------|-----------|
| Parts | 64 SKUs | ~20 core SKUs | Top panels (JA 630, LONGi 585), inverters (Huawei 5K/10K/20K, Deye 5K/16K), batteries (Dyness 10kWh, LVTOPSUN 5.12kWh, Huawei LUNA 7kWh), BOS essentials |
| Systems | 15 opportunities | ~6 packages | SYS-01 (5kW hybrid), SYS-02 (12kW hybrid), SYS-04 (20kW C&I one-box), SYS-05 (microinverter), SYS-07 (retrofit battery), SYS-12 (EV AC charger) |
| Lead magnets | 22 | ~8 | LM-01, LM-05, LM-06, LM-07, LM-09, LM-11, LM-17 (tripwire), LM-19 (tripwire) |
| SEO pages | 33 | ~18 | Home, 5/10/20kW packages, inverters, batteries, comparison, hotel, tax, subsidy, PEA permit, PPA, EV charger, 4 Krabi districts, audit, mistakes, calculator |

All prices in THB, `volume_th = n/a` (no made-up search volumes), `existing_url` audited before publish.

---

## 6. Error handling & accessibility

- **WCAG 2.2 AA** — no new contrast failures beyond the approved sheet's known ones (item 13 in AGENTS.md; owner's call).
- **PDPA gate** — form is `noValidate`; consent checked in `handleSubmit`, rides in `notes` as `PDPA consent v1.0 — web form, <ISO>`.
- **Error states:** empty/loading/error states on all data-fetching components; sonner toasts for submit success/failure.
- **Labels:** 69 `<label>` tags, all associated; `aria-invalid` on invalid fields.
- **Touch targets:** 44px+ minimum.
- **Reduced motion:** `useReducedMotion()` gates timers; hero auto-advance pinned to `prefers-reduced-motion: no-preference` in tests.
- **Thai:** `:lang(th){letter-spacing:0 !important; word-spacing:0 !important; line-height:var(--leading-relaxed)}`; every Thai string carries `lang="th"`; `฿` (U+0E3F) excluded from Thai-letter detection.

---

## 7. Testing & gates

| Gate | Command | Expected |
|------|---------|----------|
| TypeScript | `tsc` | 0 errors |
| Lint | `npm run lint` | 0 errors |
| i18n parity | `node scripts/i18n-parity.mjs` | 8 locales, divergent 0 |
| CSS style sync | `node scripts/od-style-sync.mjs` | 1 absent / 2 drifted / 1 waived |
| Copy fidelity | `node scripts/od-fidelity.mjs` | ≥90% per locale |
| Band edges | `node scripts/band-edges.mjs ... 390` / `1280` | 0 undeclared + declared deviations |
| Mobile behaviour | `node scripts/mobile-behaviour.mjs` | failed 0 |
| Contrast audit | `node scripts/contrast-audit.mjs` | we-paint-it-worse 0 |
| Page weight | `MSYS_NO_PATHCONV=1 node scripts/page-weight.mjs ... 390 2 /` | baseline band ceiling |
| Label audit | `node scripts/label-audit.mjs` | buckets add up to 69 |

---

## 8. Deployment

- **Repo:** new repo `ejjimmy`, branch `feat/ejjimmy`, merge to `main`, deploy to Vercel (separate project from tawanpower).
- **Supabase:** shared project, `ejjimmy_` schema/table prefix. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus AI keys (`ZAI_API_KEY`, `GROQ_API_KEY`, `GOOGLE_API_KEY`, `OPENAI_API_KEY`), `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`.
- **Dev port:** `npm run dev` on `:3476` (same as tawanpower convention; adjust if occupied).
- **Post-deploy:** one real lead submitted end-to-end by hand (shared Supabase = shared state).

---

## 9. Risks & open questions

1. **Shared Supabase:** `ejjimmy_` prefix avoids table collisions, but row-level security and connection pooling are shared with tawanpower. Confirm this is acceptable before creating migrations.
2. **Thai-only catalog:** storefront titles stay Thai in all 8 UI locales; `lang="th"` stamping on DB-content nodes is an owner decision (item 5 in AGENTS.md).
3. **Owner registration data:** `/privacy` and `/terms` still need the owner's legal entity, address, phone, tax ID (placeholders visible). Not a blocker for build, blocker for publish.
4. **SEO cannibalization:** calculator page must not show THB price (only kW, yield, savings), or it eats package pages.
5. **PWA artifacts:** `public/sw.js` + workbox files are build output, gitignored; do not commit.

---

## 10. Spec self-review

1. **Placeholder scan:** No TBD/TODO/incomplete sections. All decisions locked.
2. **Internal consistency:** Architecture matches feature descriptions; data model mirrors tawanpower so existing code carries over; language strategy consistent across sections.
3. **Scope check:** Focused on a single MVP (site + admin + chat + LINE). Post-MVP items clearly separated.
4. **Ambiguity check:** "Build fresh from research" defined via the curation table (counts per category). Deployment (shared Supabase) flagged as a risk needing confirmation.

**Spec written.** Please review it and let me know if you want changes before I create the implementation plan (via the writing-plans skill) and start scaffolding.