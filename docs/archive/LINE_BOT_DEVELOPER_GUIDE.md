# LINE Bot Developer Guide

**Project:** Tawan Power
**Last Updated:** 2026-05-17 (v2)
**Status:** Production

---

## Overview

This guide documents LINE Flex Message development patterns, all bugs found and fixed, and the LINE API spec rules. Use this as the primary reference when modifying `src/lib/line-messages.ts` or `src/lib/line-handlers.ts`.

---

## Architecture

```
src/lib/
├── line-messages.ts     # Flex message builders (all create* functions)
├── line-handlers.ts    # Event handlers (handleCatalog, handleCalcStep, etc.)
├── line-context.ts     # User context (state machine)
├── line-calculator.ts # Solar calculation logic
└── line.ts            # Core LINE API (sendLineFlexMessage, sendAdminAlert)
```

### Key Data Flow

```
LINE User → LINE Server → Webhook → /api/line-webhook
  → handlePostback / handleTextMessage
  → createCatalogCarousel() / createCalcStepMessage() / etc.
  → sendLineFlexMessage() → LINE API
```

---

## LINE API Constraints (from Official Docs)

### Flex Message Structure

```typescript
// Root
{ type: 'flex', altText: string, contents: ... }

// Single bubble
{ type: 'bubble', styles?, header?, hero?, body?, footer? }

// Carousel
{ type: 'carousel', contents: bubble[] }

// Bubble blocks (hero = image or video ONLY)
hero: { type: 'image', url: string, size, aspectRatio, aspectMode }
hero: { type: 'video', url, previewUrl, altContent }
```

### Flex Size Limits

| Limit | Value | Notes |
|---|---|---|
| Max bubbles in carousel | **12** | Practical limit ~5 for UX |
| Max bubble size | ~10 KB | LINE client renders up to ~10KB reliably |
| Max carousel size | ~40 KB | Hard limit lower due to multi-bubble overhead |
| Max messages per reply | **5** | LINE API limit |
| Max image URL length | ~500 chars | Postback data has similar limit |
| Max text length (altText) | ~500 chars | Displayed when media fails |

### Image URL Requirements

**MUST be HTTPS.** HTTP URLs are rejected silently or cause errors.

```typescript
// ✅ CORRECT — HTTPS
const IMAGE_URL = 'https://images.unsplash.com/photo-xxx';

// ❌ WRONG — HTTP (will fail silently)
const IMAGE_URL = 'http://images.unsplash.com/photo-xxx';
```

### Spacing / Padding Keywords

Valid keywords for `margin`, `paddingAll`, `spacing`, `cornerRadius`:

```
none, xs, sm, md, lg, xl, xxl
```

`md` is the **default** for `spacing` and `paddingAll`. Using `md` everywhere is valid and consistent.

### Component Hierarchy Rules

| Rule | Details |
|---|---|
| **All boxes need `contents: []`** | Even empty boxes must have `contents: []`. Missing it → `"must be specified"` error. |
| **All boxes need `layout`** | `horizontal`, `vertical`, or `baseline`. |
| **Text: use `text` OR `contents`** | NOT both. Use `contents` for spans. |
| **Hero = image or video only** | Not a box. Use `url` (not `originalContentUrl`). |
| **Baseline box limits** | Cannot contain `box`, `button`, `image`. Only `text`, `icon`, `filler`. |
| **Postback data string** | Encode Thai text in `displayText`. Encode non-ASCII in URIs. |

### URI Encoding Rule

Thai text in `uri` action MUST use `encodeURIComponent()`:

```typescript
// ❌ WRONG — Thai text directly in URL
uri: 'https://line.me/R/msg/text/?ตรวจสอบ'

// ✅ CORRECT — encoded
uri: `https://line.me/R/msg/text/?${encodeURIComponent('ตรวจสอบ')}`
```

### Text Encoding

Non-ASCII text in `displayText` for postback actions was being corrupted before. Ensure proper Unicode handling:

```typescript
// The issue: คำнмใหม่ (corrupted) vs เริ่มใหม่ (correct)
// Fix: ensure strings are valid UTF-8 throughout the stack
```

---

## Bugs Found & Fixed

### Bug 1: Missing `contents: []` on all box elements
**Date:** 2026-05-16 | **Error:** `"must be specified"`
**Cause:** Every `box` component was missing `contents: []`.

### Bug 2: Thai text corrupted in URI
**Date:** 2026-05-16 | **Error:** `"Invalid action URI"`
**Cause:** Share button used Thai text directly in URL.
**Fix:** Use `encodeURIComponent()`.

### Bug 3: TypeError from spread operator
**Date:** 2026-05-16 | **Error:** `TypeError: Cannot spread non-iterable`
**Cause:** `createQuickReplies()` returned object spread as a separate array element.
**Fix:** Spread `...createQuickReplies` INTO the message object.

### Bug 4: Inconsistent error handling — silent failures
**Date:** 2026-05-16 | **Fix:** Fallback chain: `replyToLine` → `pushToLine`.

### Bug 5: Loop missing in webhook event processing
**Date:** 2026-05-16 | **Fix:** Added `for (const event of events)`.

### Bug 6: Carousel size could exceed LINE limits
**Date:** 2026-05-17 | **Limit:** 50KB JSON limit, ~10KB per bubble.
**Fix:** Truncate to 3-5 bubbles, monitor size.

### Bug 7: Missing `styles` block for dark mode compatibility
**Date:** 2026-05-17 | **Fix:** Add `styles: { body: { backgroundColor: '#FFFFFF' } }`.

### Bug 8: `lineSpacing` accepts pixel values only
**Date:** 2026-05-17 | **Error:** HTTP 400
**Cause:** Used `lineSpacing: 'sm'`. 
**Fix:** Use pixel values only (`4px`).

### Bug 9: `text` and `contents` (spans) on same element
**Date:** 2026-05-17 | **Error:** HTTP 400
**Cause:** Mutually exclusive properties.
**Fix:** Use spans for styled text, `text` (with `contents: []`) for plain text.

### Bug 10: `height` property strictly pixel-based
**Date:** 2026-05-17 | **Error:** HTTP 400
**Cause:** Used `height: 'sm'`.
**Fix:** Use pixel values only (`4px`).

---

## Quick Reference Checklist

Before deploying ANY change to LINE Flex messages:

- [ ] All `box` elements have `contents: []`
- [ ] All `text` elements inside boxes have `contents: []`
- [ ] All `image` URLs start with `https://`
- [ ] All Thai text in `uri` uses `encodeURIComponent()`
- [ ] `createQuickReplies()` is spread INTO the message object
- [ ] Bubble JSON stays under ~10KB per bubble
- [ ] `lineSpacing` uses pixel values only (`4px`)
- [ ] No element has both `text` and `contents` (spans)
- [ ] `height`/`width` properties use pixel values only (e.g., `4px`)

---

## Debugging

### Get Vercel logs
```bash
vercel logs https://tawanpower.vercel.app --limit 30 --json
```

### Test catalog API
```
GET /api/test-catalog?filter=residential
```
