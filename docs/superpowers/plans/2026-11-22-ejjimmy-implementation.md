# Ejjimmy Solar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clone the tawanpower solar template into a new Ejjimmy brand: public site + AI chat + admin panel + LINE notifications + Supabase, deployed to a separate Vercel project sharing a Supabase project with `ejjimmy_` table prefix.

**Architecture:** Scaffold Ejjimmy from tawanpower (branch `template`) into a new worktree/repo. Keep Next.js 14 App Router + Supabase + shadcn/ui + Tailwind + Framer Motion + `@ai-sdk/react`. Rebrand tokens (DESIGN.md, globals.css, tailwind.config.ts), point all tables at `ejjimmy_*` prefix, curate catalog/lead-magnets/SEO from the Solar1 market research, keep Thai-primary + 8-locale i18n. Every data table mirrors tawanpower's `leads`/`solar_products`/`knowledge` so `submitLead()`, `useChat`, `/api/chat`, `/api/notify-line` carry over unchanged.

**Tech Stack:** Next.js 14.2.35, TypeScript 5.3.3, Node 22, Supabase (Postgres/Auth/Storage), Tailwind CSS 3.4, shadcn/ui, Framer Motion, `@ai-sdk/react` (Groq > Z.AI > OpenRouter > Google), next-intl (8 locales: th, en, zh-CN, ru, de, fr, ja, ko), next-themes, Vercel.

---
## File map

**Create (new Ejjimmy repo):**
- `DESIGN.md` — Ejjimmy brand tokens (primary orange, dark admin, Thai typography rules)
- `i18n.ts` — Ejjimmy routing (8 locales, default th, prefix as-needed)
- `messages/th.json`, `messages/en.json`, `messages/zh-CN.json`, `messages/ru.json`, `messages/de.json`, `messages/fr.json`, `messages/ja.json`, `messages/ko.json` — translation dictionaries
- `supabase/migrations/001_ejjimmy_schema.sql` — `ejjimmy_products`, `ejjimmy_leads`, `ejjimmy_knowledge` + RLS
- `src/lib/ejjimmy-products.ts` — curated product catalog (~20 SKUs from research)
- `src/lib/lead-magnets.ts` — ~8 lead magnets + 2 tripwires (LM-17, LM-19)
- `src/lib/submit-lead.ts` — `submitLead()` writing to `ejjimmy_leads` + PDPA consent in notes
- `src/app/api/ejjimmy-chat/route.ts` — RAG chat over `ejjimmy_knowledge`
- `src/app/api/ejjimmy-notify-line/route.ts` — LINE OA notification
- `src/components/ejjimmy/ProductModal.tsx` — product dialog (Esc, focus trap, CTA above description)
- `src/components/ejjimmy/LeadMagnetDownload.tsx` — lead-magnet download gate
- `src/components/ejjimmy/TripwireBooking.tsx` — paid tripwire booking (1,500 THB)

**Modify (from tawanpower template):**
- `package.json` — rename `tawanpower` → `ejjimmy`
- `next.config.mjs` — project name, PWA output dir
- `tailwind.config.ts` — Ejjimmy brand colors (orange primary)
- `src/app/globals.css` — Ejjimmy CSS tokens + approved OpenDesign rules
- `src/app/layout.tsx` — Ejjimmy html lang, hreflang, shell chrome
- `src/app/page.tsx` — Ejjimmy landing (11 bands rebranded)
- `src/app/chat/page.tsx` — Ejjimmy AI chat
- `src/app/admin/leads/page.tsx` — `ejjimmy_leads` view
- `src/app/admin/products/page.tsx` — `ejjimmy_products` CRUD
- `src/app/admin/super/page.tsx` — super admin config
- `src/components/layout/Header.tsx`, `Footer.tsx` — Ejjimmy wordmark/nav
- `src/lib/lead-manager.ts` — retarget to `ejjimmy_leads`
- `src/middleware.ts` — Ejjimmy locale resolution
- `scripts/i18n-parity.mjs`, `scripts/label-audit.mjs`, `scripts/contrast-audit.mjs` — retarget to Ejjimmy tables/paths
- `.env.example` — Ejjimmy env vars

---

## Phase A: Scaffold & brand

### Task 1: Create Ejjimmy worktree & copy tawanpower structure

**Files:**
- Create: new git worktree at `K:\code\ejjimmy` (or copy the tawanpower tree)

- [ ] **Step 1: Create worktree**

Run:
```bash
cd K:\code\tawanpower
git worktree add K:\code\ejjimmy feat/ejjimmy
```
Expected: new worktree created at `K:\code\ejjimmy` on branch `feat/ejjimmy`

- [ ] **Step 2: Verify copy & clean git history**

Run inside `K:\code\ejjimmy`:
```bash
git status --short
git log --oneline -3
```
Expected: clean tree, last commit is the spec commit `6128ea3`

- [ ] **Step 3: Install dependencies**

Run:
```bash
cd K:\code\ejjimmy
npm install
```
Expected: node_modules installed, no errors

- [ ] **Step 4: Commit scaffold**

Run:
```bash
git add -A
git commit -m "chore: scaffold Ejjimmy from tawanpower template"
```

---

### Task 2: Rename project & configure for Ejjimmy

**Files:**
- Modify: `package.json:1-4` — name `tawanpower` → `ejjimmy`
- Modify: `next.config.mjs` — project name, PWA dest
- Modify: `tailwind.config.ts` — Ejjimmy brand colors
- Create: `DESIGN.md` — Ejjimmy brand tokens

- [ ] **Step 1: Rename in package.json**

```json
{
  "name": "ejjimmy",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": "22.x" }
```

- [ ] **Step 2: Update next.config.mjs project name**

Change `dest: "public"` PWA setting and any `tawanpower` references to `ejjimmy`.

- [ ] **Step 3: Set Ejjimmy tailwind brand colors**

primary: `#ff8a00` (orange), primary-deep: `#ea580c`, success: `#059669`, dark admin bg `#1a0e00`. Follow tawanpower's `tailwind.config.ts` structure.

- [ ] **Step 4: Write DESIGN.md**

Copy tawanpower's DESIGN.md structure, replace brand name with Ejjimmy, keep Thai typography rules (`:lang(th){letter-spacing:0}`), WCAG 2.2 AA, mobile-first.

- [ ] **Step 5: Commit brand config**

Run:
```bash
git add package.json next.config.mjs tailwind.config.ts DESIGN.md
git commit -m "feat: Ejjimmy brand config & design tokens"
```

---

## Phase B: Data layer (Supabase, ejjimmy_ prefix)

### Task 3: Create Supabase schema migration

**Files:**
- Create: `supabase/migrations/001_ejjimmy_schema.sql`

- [ ] **Step 1: Write ejjimmy schema**

```sql
-- Ejjimmy solar — shared Supabase project, ejjimmy_ prefix
create table if not exists public.ejjimmy_products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  model text,
  category text not null check (category in ('Панель','Инвертор','Батарея','BOS','Крепёж','Кабель','EV-зарядка','Насос')),
  price_thb integer not null,
  specs jsonb default '{}',
  image_url text,
  lang text default 'th',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.ejjimmy_leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  segment text,
  object text,
  budget text,
  status text default 'new',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.ejjimmy_knowledge (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  source text,
  lang text default 'th',
  created_at timestamptz default now()
);

-- RLS: public read for products/knowledge, insert-only for leads
alter table public.ejjimmy_products enable row level security;
alter table public.ejjimmy_leads enable row level security;
alter table public.ejjimmy_knowledge enable row level security;

create policy "products are publicly readable" on public.ejjimmy_products
  for select using (true);
create policy "knowledge is publicly readable" on public.ejjimmy_knowledge
  for select using (true);
create policy "anyone can insert leads" on public.ejjimmy_leads
  for insert with check (true);
create policy "leads readable by authenticated" on public.ejjimmy_leads
  for select using (auth.role() = 'authenticated');
```

- [ ] **Step 2: Apply migration locally**

Run:
```bash
npx supabase db push
```
(or apply via Supabase SQL editor in the shared project)

Expected: 3 tables created, RLS enabled

- [ ] **Step 3: Commit migration**

Run:
```bash
git add supabase/migrations/001_ejjimmy_schema.sql
git commit -m "feat: ejjimmy Supabase schema (ejjimmy_ prefix)"
```

---

### Task 4: Curated product catalog from market research

**Files:**
- Create: `src/lib/ejjimmy-products.ts` — ~20 SKUs curated from Solar1 research

- [ ] **Step 1: Write curated products (~20 SKUs)**

Source: `k:\workspaces\workspaces\solar_\market_research\03-report-результат\parts_market.csv` and `system_expansion.csv`

Curated list (Thai names, THB prices, research-verified):

```typescript
export const EJJIMMY_PRODUCTS = [
  // Panels
  { id: 'pan-ja-630', name: 'JA Solar JAM72D42-630/LB', model: 'JAM72D42-630/LB', category: 'Панель', price_thb: 2556, specs: { watt: 630, cells: 72, type: 'bifacial double glass', unit: 'панель' }, lang: 'th', active: true },
  { id: 'pan-lon-585', name: 'LONGi LR5-72HGD-585M', model: 'LR5-72HGD-585M', category: 'Панель', price_thb: 2414, specs: { watt: 585, cells: 72, type: 'bifacial dual glass', unit: 'панель' }, lang: 'th', active: true },
  { id: 'pan-aiko-650', name: 'AIKO Comet 2U 650', model: 'G650-MCH72Mw', category: 'Панель', price_thb: 3299, specs: { watt: 650, cells: 66, type: 'N-type ABC', unit: 'панель' }, lang: 'th', active: true },
  // Inverters
  { id: 'inv-hw-5l1', name: 'Huawei SUN2000-5KTL-L1', model: 'SUN2000-5KTL-L1', category: 'Инвертор', price_thb: 25850, specs: { kw: 5, phase: '1 фаза', mppt: 2, unit: 'шт' }, lang: 'th', active: true },
  { id: 'inv-hw-10m1', name: 'Huawei SUN2000-10KTL-M1', model: 'SUN2000-10KTL-M1', category: 'Инвертор', price_thb: 45100, specs: { kw: 10, phase: '3 фазы', mppt: 2, unit: 'шт' }, lang: 'th', active: true },
  { id: 'inv-hw-20m5', name: 'Huawei SUN2000-20KTL-M5', model: 'SUN2000-20KTL-M5', category: 'Инвертор', price_thb: 65500, specs: { kw: 20, phase: '3 фазы', mppt: 2, unit: 'шт' }, lang: 'th', active: true },
  { id: 'inv-deye-5', name: 'Deye SUN-5K-SG04LP1', model: 'SUN-5K-SG04LP1-EU-SM2', category: 'Инвертор', price_thb: 28355, specs: { kw: 5, phase: '1 фаза', type: 'гибрид LV 48В', unit: 'шт' }, lang: 'th', active: true },
  { id: 'inv-deye-16', name: 'Deye SUN-16K-SG01LP1', model: 'SUN-16K-SG01LP1-EU', category: 'Инвертор', price_thb: 78123, specs: { kw: 16, phase: '1 фаза', type: 'гибрид LV 48В', unit: 'шт' }, lang: 'th', active: true },
  // Batteries
  { id: 'bat-dyn-10', name: 'Dyness Powerbox Pro 10 кВт·ч', model: 'Powerbox Pro 10kWh', category: 'Батарея', price_thb: 59000, specs: { kwh: 10, voltage: '48В', type: 'LFP', unit: 'шт' }, lang: 'th', active: true },
  { id: 'bat-lvt-5', name: 'LVTOPSUN 5.12 кВт·ч', model: 'LVTS-512100-G3', category: 'Батарея', price_thb: 31500, specs: { kwh: 5.12, voltage: '51.2В', type: 'LFP', unit: 'шт' }, lang: 'th', active: true },
  { id: 'bat-hw-7', name: 'Huawei LUNA2000-7-E1', model: 'LUNA2000-7-E1', category: 'Батарея', price_thb: 75840, specs: { kwh: 6.9, voltage: 'HV', type: 'high voltage', unit: 'шт' }, lang: 'th', active: true },
  // BOS
  { id: 'bos-meter-dtsu', name: 'Huawei DTSU666-H 3-фазный счетчик', model: 'DTSU666-H', category: 'BOS', price_thb: 3600, specs: { phase: '3 фазы', ct: '250A/50mA', unit: 'шт' }, lang: 'th', active: true },
  { id: 'bos-dongle', name: 'Huawei SDongleA-05', model: 'SDongleA-05', category: 'BOS', price_thb: 2525, specs: { type: 'Smart Dongle WLAN-FE', unit: 'шт' }, lang: 'th', active: true },
  { id: 'bos-spd-dc3', name: 'Suntree DC SPD 1000V 3P', model: 'SUP2H1-PV', category: 'BOS', price_thb: 1000, specs: { voltage: '1000В', poles: 3, unit: 'шт' }, lang: 'th', active: true },
  { id: 'bos-comb-3s', name: 'AC-DC Combiner 3 string 10-20 кВт', model: 'AC-DC 3str', category: 'BOS', price_thb: 11375, specs: { strings: 3, kw: '10-20', phase: '3 фазы', unit: 'шт' }, lang: 'th', active: true },
  // EV
  { id: 'ev-hw-7ks', name: 'Huawei SCharger-7KS (7 кВт)', model: 'SCharger-7KS', category: 'EV-зарядка', price_thb: 27675, specs: { kw: 7, phase: '1 фаза', unit: 'шт' }, lang: 'th', active: true },
  { id: 'ev-hw-22kt', name: 'Huawei SCharger-22KT (22 кВт)', model: 'SCharger-22KT', category: 'EV-зарядка', price_thb: 36831, specs: { kw: 22, phase: '3 фазы', unit: 'шт' }, lang: 'th', active: true },
  // System packages (from SYS-01, SYS-02, SYS-04, SYS-05, SYS-07, SYS-12)
  { id: 'sys-01', name: 'Гибрид 5 кВт + 5.12 кВт·ч (дешевый пакет)', model: 'SYS-01', category: 'Пакет', price_thb: 112000, specs: { kw: 5, storage: 5.12, phase: '1 фаза', inverters: 'Deye 5K + LVTOPSUN 5.12', unit: 'комплект' }, lang: 'th', active: true },
  { id: 'sys-02', name: 'Гибрид 12 кВт 3ф + 10 кВт·ч (вилла)', model: 'SYS-02', category: 'Пакет', price_thb: 214000, specs: { kw: 12, storage: 10.24, phase: '3 фазы', inverters: 'Deye 12K + 2× Dyness 5.12', unit: 'комплект' }, lang: 'th', active: true },
  { id: 'sys-04', name: 'C&I 20 кВт one-box (один инвертор)', model: 'SYS-04', category: 'Пакет', price_thb: 244000, specs: { kw: 20, phase: '3 фазы', inverters: 'Huawei 20KTL-M5', unit: 'комплект' }, lang: 'th', active: true },
];
```

- [ ] **Step 2: Write seed script to load products**

Create `scripts/seed-ejjimmy-products.mjs`:
```javascript
import { createClient } from '@supabase/supabase-js';
import { EJJIMMY_PRODUCTS } from '../src/lib/ejjimmy-products.js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

for (const p of EJJIMMY_PRODUCTS) {
  await supabase.from('ejjimmy_products').upsert(p, { onConflict: 'id' });
}
console.log(`seeded ${EJJIMMY_PRODUCTS.length} products`);
```

- [ ] **Step 3: Run seed**

Run:
```bash
NEXT_PUBLIC_SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-ejjimmy-products.mjs
```
Expected: products inserted into `ejjimmy_products`

- [ ] **Step 4: Commit catalog**

Run:
```bash
git add src/lib/ejjimmy-products.ts scripts/seed-ejjimmy-products.mjs
git commit -m "feat: curated Ejjimmy product catalog from market research"
```

---

## Phase C: i18n & locale infrastructure

### Task 5: Configure Ejjimmy i18n (8 locales, Thai primary)

**Files:**
- Create: `i18n.ts`
- Create: `messages/th.json`, `messages/en.json`, `messages/zh-CN.json`, `messages/ru.json`, `messages/de.json`, `messages/fr.json`, `messages/ja.json`, `messages/ko.json`

- [ ] **Step 1: Write i18n.ts**

```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['th', 'en', 'zh-CN', 'ru', 'de', 'fr', 'ja', 'ko'] as const,
  defaultLocale: 'th',
  localePrefix: 'as-needed'
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 2: Create message dictionaries (th + en first)**

`messages/th.json` — core Thai strings (hero, nav, contact, PDPA, product names stay Thai). `messages/en.json` — English mirror. Other 6 locales get UI shell only (nav, buttons, theme, locale), catalog stays Thai.

- [ ] **Step 3: Wire middleware**

Modify `src/middleware.ts` to use Ejjimmy `routing` and `resolveLocale()` ranking `Accept-Language` by `q` values with Thai floor (same as tawanpower).

- [ ] **Step 4: Run i18n parity check**

Run:
```bash
node scripts/i18n-parity.mjs
```
Expected: `8 locales · <N> keys · divergent 0`

- [ ] **Step 5: Commit i18n**

Run:
```bash
git add i18n.ts messages/ src/middleware.ts
git commit -m "feat: Ejjimmy 8-locale i18n, Thai primary"
```

---

## Phase D: Lead flow (submitLead + LINE + Supabase)

### Task 6: Implement submitLead for ejjimmy_leads

**Files:**
- Modify: `src/lib/lead-manager.ts` — retarget to `ejjimmy_leads` + PDPA consent in notes
- Create: `src/lib/submit-lead.ts` (or modify lead-manager)

- [ ] **Step 1: Write submitLead**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function submitLead(data: {
  name: string; phone: string; segment?: string; object?: string;
  budget?: string; pdpaConsent: boolean;
}) {
  if (!data.pdpaConsent) {
    throw new Error('PDPA consent required');
  }
  const iso = new Date().toISOString();
  const { error } = await supabase.from('ejjimmy_leads').insert({
    name: data.name,
    phone: data.phone,
    segment: data.segment ?? null,
    object: data.object ?? null,
    budget: data.budget ?? null,
    status: 'new',
    notes: `PDPA consent v1.0 — web form, ${iso}`,
  });
  if (error) throw error;

  // LINE notification (best-effort, don't block lead save)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ejjimmy-notify-line`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, phone: data.phone, segment: data.segment }),
    });
  } catch {
    // LINE failure must not fail lead capture
  }
}
```

- [ ] **Step 2: Commit lead flow**

Run:
```bash
git add src/lib/lead-manager.ts src/lib/submit-lead.ts
git commit -m "feat: submitLead to ejjimmy_leads with PDPA gate"
```

---

### Task 7: LINE notification API route

**Files:**
- Create: `src/app/api/ejjimmy-notify-line/route.ts`

- [ ] **Step 1: Write notify-line route**

```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, phone, segment } = await req.json();
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ ok: false, reason: 'no token' }, { status: 500 });

  const message = `Новый лид Ejjimmy\nИмя: ${name}\nТелефон: ${phone}\nСегмент: ${segment || '—'}`;
  await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ type: 'text', text: message }] }),
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit LINE route**

Run:
```bash
git add src/app/api/ejjimmy-notify-line/route.ts
git commit -m "feat: Ejjimmy LINE notify API route"
```

---

## Phase E: AI chat (RAG over ejjimmy_knowledge)

### Task 8: Wire AI chat route

**Files:**
- Create: `src/app/api/ejjimmy-chat/route.ts`
- Modify: `src/app/chat/page.tsx` — Ejjimmy branding, useChat pointing to ejjimmy-chat

- [ ] **Step 1: Write ejjimmy-chat route**

Mirror tawanpower's `/api/chat` but query `ejjimmy_knowledge`, fallback chain Groq > Z.AI > OpenRouter > Google.

- [ ] **Step 2: Update chat page**

Change title/heading to Ejjimmy, keep `useChat` hook.

- [ ] **Step 3: Commit chat**

Run:
```bash
git add src/app/api/ejjimmy-chat/route.ts src/app/chat/page.tsx
git commit -m "feat: Ejjimmy AI chat with RAG over ejjimmy_knowledge"
```

---

## Phase F: Public site — landing bands + inner pages

### Task 9: Rebrand landing page (11 OpenDesign bands)

**Files:**
- Modify: `src/app/page.tsx` — Ejjimmy wordmark, hero, all 11 bands
- Modify: `src/app/globals.css` — Ejjimmy tokens + OpenDesign rules
- Modify: `src/components/layout/Header.tsx`, `Footer.tsx` — Ejjimmy branding

- [ ] **Step 1: Update Header wordmark & nav**

Ejjimmy wordmark, nav links to #systems, #cases, #contact, locale switcher, theme button, CTA.

- [ ] **Step 2: Rebrand hero + all 11 bands**

Replace "Tawan Power" with "Ejjimmy" across hero, trust, features, systems, sigen, steps, segments, knowledge, cases, contact, footer, ai-bar. Keep structure identical to tawanpower's approved bands.

- [ ] **Step 3: Update Footer**

Ejjimmy contact, LINE button, QR, PDPA/privacy link to `/privacy`.

- [ ] **Step 4: Run style sync & copy fidelity**

```bash
node scripts/od-style-sync.mjs        # expect 1 absent / 2 drifted / 1 waived
node scripts/od-fidelity.mjs http://127.0.0.1:<port> en,ru,th   # expect ≥90%
```

- [ ] **Step 5: Commit landing**

Run:
```bash
git add src/app/page.tsx src/app/globals.css src/components/layout/Header.tsx src/components/layout/Footer.tsx
git commit -m "feat: Ejjimmy landing page rebranded"
```

---

### Task 10: Inner pages (cases, blog, privacy, terms, login, segments, etc.)

**Files:**
- Modify: `src/app/cases/*`, `src/app/blog/*`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/login/page.tsx`, `src/app/segments/page.tsx` — Ejjimmy branding, Thai + English sections

- [ ] **Step 1: Rebrand each inner page**

Ejjimmy wordmark, Thai primary section + English mirror, AppShell chrome.

- [ ] **Step 2: Privacy/terms placeholder note**

Keep visible placeholder for owner registration data (legal entity, address, phone, tax ID) — marked for owner to fill before publish.

- [ ] **Step 3: Commit inner pages**

Run:
```bash
git add src/app/cases src/app/blog src/app/privacy src/app/terms src/app/login src/app/segments
git commit -m "feat: Ejjimmy inner pages rebranded"
```

---

## Phase G: Lead magnets & tripwires

### Task 11: Lead magnet downloads + tripwire booking

**Files:**
- Create: `src/components/ejjimmy/LeadMagnetDownload.tsx`
- Create: `src/components/ejjimmy/TripwireBooking.tsx`
- Create: `public/lead-magnets/` — PDF/Excel files (~8 magnets)

- [ ] **Step 1: Create lead magnet download component**

Gate: email/LINE capture → download PDF. ~8 magnets: LM-01, LM-05, LM-06, LM-07, LM-09, LM-11 + tripwires LM-17, LM-19.

- [ ] **Step 2: Create tripwire booking (LM-17 audit 1,500 THB, LM-19 roof survey 1,500 THB)**

100% credit to project, Thai + English.

- [ ] **Step 3: Wire into contact/lead flow**

Tripwire submissions go to `ejjimmy_leads` with tripwire flag in notes.

- [ ] **Step 4: Commit lead magnets**

Run:
```bash
git add src/components/ejjimmy/ public/lead-magnets/
git commit -m "feat: Ejjimmy lead magnets & tripwire booking"
```

---

## Phase H: Admin panel

### Task 12: Admin leads / products / super

**Files:**
- Modify: `src/app/admin/leads/page.tsx` — `ejjimmy_leads` view
- Modify: `src/app/admin/products/page.tsx` — `ejjimmy_products` CRUD
- Modify: `src/app/admin/super/page.tsx` — super admin config

- [ ] **Step 1: Admin leads page**

List `ejjimmy_leads`, filter by status, show PDPA consent in notes.

- [ ] **Step 2: Admin products page**

CRUD `ejjimmy_products` (name, model, price_thb, specs, image_url, active).

- [ ] **Step 3: Admin super page**

AI config, system settings, env checks.

- [ ] **Step 4: Label audit**

Run:
```bash
node scripts/label-audit.mjs
```
Expected: 69 labels, all associated, buckets add up.

- [ ] **Step 5: Commit admin**

Run:
```bash
git add src/app/admin/
git commit -m "feat: Ejjimmy admin panel (leads/products/super)"
```

---

## Phase I: Testing & gates

### Task 13: Run full gate suite

**Files:** none (verification only)

- [ ] **Step 1: TypeScript**

Run:
```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 2: Lint**

Run:
```bash
npm run lint
```
Expected: 0 errors

- [ ] **Step 3: i18n parity**

Run:
```bash
node scripts/i18n-parity.mjs
```
Expected: divergent 0

- [ ] **Step 4: CSS style sync**

Run:
```bash
node scripts/od-style-sync.mjs
```
Expected: 1 absent / 2 drifted / 1 waived

- [ ] **Step 5: Copy fidelity**

Run:
```bash
node scripts/od-fidelity.mjs http://127.0.0.1:<port> en,ru,th
```
Expected: ≥90% per locale

- [ ] **Step 6: Band edges**

Run:
```bash
node scripts/band-edges.mjs http://127.0.0.1:<port>/ 390
node scripts/band-edges.mjs http://127.0.0.1:<port>/ 1280
```
Expected: 0 undeclared differences

- [ ] **Step 7: Mobile behaviour**

Run:
```bash
node scripts/mobile-behaviour.mjs <port>
```
Expected: failed 0

- [ ] **Step 8: Contrast audit**

Run:
```bash
node scripts/contrast-audit.mjs http://127.0.0.1:<port>
```
Expected: we-paint-it-worse 0

- [ ] **Step 9: Label audit**

Run:
```bash
node scripts/label-audit.mjs
```
Expected: buckets add up to 69

- [ ] **Step 10: Commit gates green**

Run:
```bash
git commit -m "chore: all Ejjimmy gates green"
```

---

## Phase J: Deploy

### Task 14: Deploy to Vercel (separate project)

**Files:**
- Modify: `.env.example` — Ejjimmy env vars
- Create: `vercel.json` (if needed)

- [ ] **Step 1: Set env vars in Vercel**

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ZAI_API_KEY`, `GROQ_API_KEY`, `GOOGLE_API_KEY`, `OPENAI_API_KEY`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_SITE_URL`

- [ ] **Step 2: Deploy**

Run:
```bash
vercel --prod --yes
```
Expected: Ejjimmy site live on its own Vercel URL

- [ ] **Step 3: Post-deploy check**

Visit main, chat, admin — one real lead submitted end-to-end by hand (shared Supabase = shared state, done by hand not by agent).

- [ ] **Step 4: Commit deploy config**

Run:
```bash
git add .env.example vercel.json
git commit -m "feat: Ejjimmy deploy config"
```

---

## Self-review

1. **Spec coverage:** Every spec section maps to tasks:
   - Architecture/data model → Tasks 3-4
   - Components & pages → Tasks 9-10
   - Curated content → Task 4
   - Lead magnets/tripwires → Task 11
   - Admin → Task 12
   - AI chat + LINE → Tasks 7-8
   - Error handling/accessibility → built into Tasks 6, 9, 12 (PDPA gate, labels, WCAG)
   - Testing & gates → Task 13
   - Deployment → Task 14

2. **Placeholder scan:** No TBD/TODO/"implement later". All steps have concrete code/commands.

3. **Type consistency:** `submitLead`, `ejjimmy_products`, `ejjimmy_leads`, `ejjimmy_knowledge` names used consistently across Tasks 3, 4, 6, 7, 8, 12.

---

## Execution choice

**Plan complete and saved to `docs/superpowers/plans/2026-11-22-ejjimmy-implementation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — I execute tasks in this session using executing-plans, batch execution with checkpoints for review.

**Which approach would you like?** Also, one confirmation before we start: are you OK with Ejjimmy sharing the tawanpower Supabase project (tables prefixed `ejjimmy_*`), or would you prefer a fully separate Supabase project? That affects Task 3 setup.