# Sofin Feature Flag

## Overview

All Sofin financing content is controlled by the `NEXT_PUBLIC_SHOW_SOFIN` environment variable.

- **`false`** — Sofin is hidden from the site, AI chat, LINE bot, PDF proposals, and SEO
- **`true`** — Sofin is visible everywhere

Default (when unset): `false`

## How to Toggle

### Hide Sofin
```bash
# .env.local
NEXT_PUBLIC_SHOW_SOFIN=false

# Vercel
vercel env add NEXT_PUBLIC_APP_MODE production false
vercel --prod
```

### Show Sofin
```bash
# .env.local
NEXT_PUBLIC_SHOW_SOFIN=true

# Vercel
vercel env rm NEXT_PUBLIC_SHOW_SOFIN production
vercel env add NEXT_PUBLIC_SHOW_SOFIN production true
vercel --prod
```

## What's Affected

| Layer | Files | Behavior when `false` |
|-------|-------|----------------------|
| Landing page | `src/app/page.tsx` | SofinModelSection not rendered |
| AI Chat | `src/app/api/chat/route.ts`, `reply/route.ts` | Sofin removed from system prompt |
| LINE Bot | `src/lib/line-handlers.ts` | `handleSofin` returns early, keyword routing skipped, quick replies hidden |
| LINE Messages | `src/lib/line-messages.ts` | `createSofinMessage()` returns null; calculator shows generic "ผ่อนชำระ (36 เดือน)" instead of "Sofin" |
| LINE Rich Menu | `src/lib/line-rich-menu.ts` | Sofin zone removed from menu layout (image unchanged — text on PNG still says Sofin) |
| SEO | `src/components/JsonLd.tsx` | Sofin FAQ question removed from structured data |
| PDF Proposal | `src/components/ProposalDocument.tsx` | P5 (Sofin Financing) page hidden; `sofinCalculation` renamed to `installmentCalculation` |
| PDF Data | `src/lib/pdf/build-data.ts`, `src/lib/pdf/generator.ts` | `installmentCalculation` field (generic 10% down / 36-60 month calc) |
| Proposal Dashboard | `src/app/proposal/[id]/ProposalDashboard.tsx` | Financing section hidden |
| Knowledge Base | `data/knowledge-base.json` | `sofin-safety` entry removed |
| Blog Posts | `supabase/migrations/20260628085746_hide_sofin_blog_posts.sql` | Sofin articles set to `published = false` |

## Restoring Sofin

1. Set `NEXT_PUBLIC_SHOW_SOFIN=true` in env
2. Restore blog posts:
   ```sql
   UPDATE blog_posts SET published = true
   WHERE slug IN ('solar-financing-incentives-thailand-2026', '5-solar-misconceptions-krabi');
   ```
3. Add `sofin-safety` back to `data/knowledge-base.json`
4. Rename `installmentCalculation` back to `sofinCalculation` in:
   - `src/lib/pdf/generator.ts`
   - `src/lib/pdf/build-data.ts`
   - `src/components/ProposalDocument.tsx`
   - `src/app/proposal/[id]/ProposalDashboard.tsx`
5. Restore "Sofin" text in `src/lib/line-messages.ts:816` (calculator result)
6. Re-upload rich menu image if needed (PNG still has Sofin text)
7. Redeploy

## Files Changed

- `src/lib/feature-flags.ts` — centralized flag config
- `src/app/page.tsx` — conditional Sofin section render
- `src/app/api/chat/route.ts` — conditional system prompt
- `src/app/api/chat/reply/route.ts` — conditional system prompt
- `src/lib/line-handlers.ts` — conditional handler, routing, quick replies
- `src/lib/line-messages.ts` — conditional flex message; generic installment text in calculator
- `src/lib/line-rich-menu.ts` — conditional rich menu zones
- `src/components/JsonLd.tsx` — conditional FAQ schema
- `src/components/ProposalDocument.tsx` — conditional P5 page; `installmentCalculation` field
- `src/lib/pdf/build-data.ts` — `installmentCalculation` field
- `src/lib/pdf/generator.ts` — `installmentCalculation` interface field
- `src/app/proposal/[id]/ProposalDashboard.tsx` — conditional financing section
- `data/knowledge-base.json` — removed sofin-safety entry
- `supabase/migrations/20260628085746_hide_sofin_blog_posts.sql` — hides blog posts
- `.env.local` — `NEXT_PUBLIC_SHOW_SOFIN=false`

---

## Promotion Feature (Replacement for Sofin)

### Overview
The Sofin financing menu item has been replaced with a "🎁 โปรโมชั่น" (Promotions) feature. This is a permanent promotion for after-sales service.

### Promotion Details
- **Free maintenance for 1st year** (worth ฿5,000)
  - System inspection every 6 months
  - Panel cleaning 2 times/year
  - Performance analysis
- **After Year 1**: Annual maintenance at ฿10,000/year (~฿850/month)

### Implementation
- **Action**: `action=promotion`
- **Handler**: `handlePromotion()` in `src/lib/line-handlers.ts`
- **Message**: `createPromotionMessage()` in `src/lib/line-messages.ts`
- **Rich Menu**: Zone index 2 (replaces Sofin)

### Files Changed
- `src/lib/line-rich-menu.ts` — Sofin zone → promotion zone
- `src/lib/line-messages.ts` — `createPromotionMessage()` added; `createSofinMessage()` removed
- `src/lib/line-handlers.ts` — `handlePromotion()` added; `handleSofin()` removed
- `src/lib/__tests__/line-messages.test.ts` — Updated tests for promotion

### Removed Sofin Code
The following code was removed as part of this change:

1. **`handleSofin()` function** — Entire function deleted from `line-handlers.ts`
2. **`createSofinMessage()` function** — Entire function deleted from `line-messages.ts`
3. **Sofin case in switch statement** — Removed from `handlePostback()`
4. **Sofin keyword routing** — Removed from text message handler
5. **Sofin quick replies** — Replaced with promotion in all menus

### To Restore Sofin (If Needed)
1. Re-add `handleSofin()` function in `line-handlers.ts`
2. Re-add `createSofinMessage()` function in `line-messages.ts`
3. Restore Sofin case in switch statement
4. Restore Sofin keyword routing
5. Update rich menu zones to include Sofin
6. Set `NEXT_PUBLIC_SHOW_SOFIN=true`
7. Redeploy
