# Tawan Power LINE Bot — Bug Report & Troubleshooting Guide

**Master Fix Prompt:** `BUG_FIX_PROMPT.md` — используй этот файл для починки

**Last Updated:** 2026-05-16
**Status:** ⚠️ BLOCKED — AI Chat & Catalog flex messages not displaying

---

## Bug Summary

When users press Rich Menu buttons **"AI ปรึกษา"** and **"แพ็กเกจ"** in LINE, the flex messages don't display properly. The webhook receives postback events but the flex messages fail to render in LINE app.

---

## Root Cause Analysis

### Test Results (2026-05-16)

| Test | Action | Result |
|------|--------|--------|
| 1 | Direct LINE API reply (hardcoded flex) | ✅ Works |
| 2 | Call `createWelcomeMessage()` via dynamic import | ❌ Flex not rendering |
| 3 | Call `createCatalogFilterMessage()` via dynamic import | ❌ Flex not rendering |
| 4 | Original handlers (`handleAiChat`, `handleCatalog`) | ❌ Not called |

### Working Code Pattern

LINE successfully displays flex messages when:
```typescript
// Simple inline object - WORKS
const welcome = {
  type: 'flex',
  altText: '...',
  contents: {
    type: 'bubble',
    body: { type: 'box', layout: 'vertical', contents: [...] }
  }
};
```

### Broken Code Pattern

```typescript
// From line-messages.ts - NOT WORKING
import { createWelcomeMessage } from '@/lib/line-messages';
const welcome = createWelcomeMessage();
```

---

## LINE Flex Message Specification

### Required Properties

**Every `box` element MUST have `contents: []`:**
```typescript
{
  type: 'box',
  layout: 'vertical',
  contents: [...] // Must be empty array if no children, not missing
}
```

**Every `text` element MUST have `contents: []`:**
```typescript
{
  type: 'text',
  text: 'Hello',
  contents: [] // Required even if empty
}
```

**Image hero requires specific property names:**
```typescript
hero: {
  type: 'image',
  originalContentUrl: 'https://...', // NOT 'url'
  previewUrl: 'https://...',
  size: 'full',
  aspectMode: 'cover',
  aspectRatio: '1.51:1'
}
```

**Button action requires `displayText`:**
```typescript
{
  type: 'button',
  action: {
    type: 'postback',
    label: 'Text',
    data: 'action=...',
    displayText: 'Text' // Required
  }
}
```

### Invalid Properties

| Invalid | Valid | Reason |
|---------|-------|--------|
| `url` for hero image | `originalContentUrl` + `previewUrl` | LINE API spec |
| `paddingAll: 'none'` | `paddingAll: 'sm'` or `'lg'` | 'none' not valid value |
| Missing `contents: []` on box | Always include `contents: []` | LINE requires it |

---

## Webhook Flow

```
LINE App → POST /api/line-webhook
  → verifyLineSignature()
  → Parse events[]
  → Switch event.type
    → case 'postback'
      → event.postback.data = 'action=ai_chat'
      → handlePostback(userId, replyToken, data, displayText)
        → parseActionData(data) → { action: 'ai_chat' }
        → switch(action)
          → case 'ai_chat'
            → handleAiChat(userId, replyToken)
              → createWelcomeMessage()
              → sendResponse(userId, replyToken, [welcome])
```

---

## Known Issues

### 1. AI Chat Welcome Card Not Displaying

**Symptom:** Press "AI ปรึกษา" → see text "สวัสดีครับ!" but no flex card

**Current State:** The handlers ARE being called (verified via logging), but the flex message fails to render in LINE.

**Possibility 1:** LINE requires `contents` property on ALL elements including simple text.
**Possibility 2:** `hero` image uses wrong property name (`url` instead of `originalContentUrl`).
**Possibility 3:** Some Thai text causes encoding issues.

### 2. Catalog Categories Not Displaying

**Symptom:** Press "แพ็กเกจ" → see text but no flex card with categories

**Same root cause as #1.**

### 3. Product Carousel Not Displaying

**Symptom:** Select category → see text but no carousel

**Likely cause:** `hero.url` → should be `hero.originalContentUrl` + `hero.previewUrl`

### 4. Sofin Message Shows 0%

**FIXED:** Changed "0%" → "10%" and "ไม่ต้องดาวน์" → "เริ่มดาวน์ 10%"

---

## Troubleshooting Checklist

When LINE flex messages don't display:

- [ ] Check browser console for errors
- [ ] Verify `contents: []` on ALL box elements
- [ ] Verify `contents: []` on ALL text elements
- [ ] Check `hero.url` → must be `originalContentUrl` + `previewUrl`
- [ ] Check `paddingAll` is not `'none'` (use `'sm'`, `'md'`, `'lg'`)
- [ ] Check button actions have `displayText` property
- [ ] Test with LINE Flex Message Simulator: https://developers.line.biz/flex-simulator/

---

## LINE Flex Message Simulator

Use https://developers.line.biz/en/docs/messaging-api/flex-message-simulator/ to validate JSON before deploying.

Common errors from simulator:
- `"must be specified"` — missing `contents` on box
- `"Invalid action URI"` — displayText has Cyrillic/corrupt characters
- `"should be a valid URL"` — image URL invalid

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/app/api/line-webhook/route.ts` | Webhook endpoint, receives LINE events |
| `src/lib/line-handlers.ts` | Handles postback actions, calls message builders |
| `src/lib/line-messages.ts` | Creates all flex messages (WELCOME, CATALOG, SOFIN, CALCULATOR) |
| `src/lib/line-context.ts` | User state management (`parseActionData`) |
| `src/lib/line-rich-menu.ts` | Rich menu configuration |

---

## Next Steps

1. **Validate `createWelcomeMessage()` output** — print the JSON to console, validate with LINE simulator
2. **Validate `createCatalogFilterMessage()` output** — same approach
3. **Fix `createCatalogCarousel()`** — change `hero.url` to `hero.originalContentUrl` + `hero.previewUrl`
4. **Add all missing `contents: []`** — every text element needs it
5. **Remove debug code from webhook** — revert to original handler calls after testing

---

## Commands

```bash
# Build
npm run build

# Deploy
vercel --prod --yes

# Check webhook status
# GET https://tawanpower.vercel.app/api/line-webhook
```

---

## Session Context

**Progress so far:**
- ✅ Rich menu working (buttons trigger postback)
- ✅ Webhook receiving events
- ✅ Direct LINE API reply works
- ❌ Flex messages from `line-messages.ts` not rendering

**Last working deployment:** `https://tawanpower.vercel.app`