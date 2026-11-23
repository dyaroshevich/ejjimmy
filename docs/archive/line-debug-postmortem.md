# LINE Bot Debug Postmortem

**Date:** 2026-05-16
**Issue:** LINE menu buttons silent / catalog and calculator not working
**Duration:** ~2 hours
**Status:** Resolved

---

## Problem

LINE bot menu buttons not responding. Catalog didn't show product cards, calculator didn't show result on step 4.

## Investigation

### Step 1: Check Vercel logs

```bash
vercel logs https://tawanpower.vercel.app --limit 30 --json
```

### Catalog Error
```
"message": "must be specified"
"property": "/body/contents/1/contents/0/contents"
```

### Calculator Result Error
```
"message": "Invalid action URI"
```

## Root Cause

**LINE Flex Message API requires ALL box containers to have a `contents` array, even if empty.**

### Example of broken code
```javascript
// WRONG - causes "must be specified" error
{
  type: 'box',
  layout: 'horizontal',
  contents: [
    { type: 'text', text: 'Title', color: '#000' },  // text has no contents field
    { type: 'box', backgroundColor: '#fff', contents: [] }  // box has no contents
  ]
}

// CORRECT
{
  type: 'box',
  layout: 'horizontal',
  contents: [
    { type: 'text', text: 'Title', color: '#000', contents: [] },  // ADD contents: []
    { type: 'box', backgroundColor: '#fff', contents: [{ type: 'text', ... }] }  // ADD contents
  ]
}
```

### Broken files
1. `src/lib/line-messages.ts` — `createCalcStepMessage`, `createCalcResultMessage`, `createCatalogCarousel`
2. All box elements with nested text/button elements were missing `contents: []`

### Invalid action URI
The share button used `https://line.me/R/msg/text/?ตรวจสอบ...` (Thai text directly in URL) instead of `encodeURIComponent()`:
```javascript
// WRONG
uri: `https://line.me/R/msg/text/?ตรวจสอบ...`

// CORRECT
uri: `https://line.me/R/msg/text/?${encodeURIComponent('ตรวจสอบ...')}`
```

## Prevention

Before deploying any Flex Message:
1. Check all `box` elements have `contents: []` even if empty
2. Check all text/button inside box have `contents: []`
3. Check all URIs use `encodeURIComponent()` for Thai text
4. Check displayText in postback actions for Cyrillic/Thai corruption (was `คำнмใหม่` instead of `เริ่มใหม่`)

---

## Files Fixed

- `src/lib/line-messages.ts` — added `contents: []` to all box/text elements, fixed share URI
- `src/app/page.tsx` — removed escaped `\"` that caused build failure
- `src/app/error.tsx`, `src/app/not-found.tsx` — same escaped quote fix
- `src/components/LeadForm.tsx` — same escaped quote fix

## Environment Variables Note

`LINE_CHANNEL_ACCESS_TOKEN` and `LINE_CHANNEL_SECRET` must be set on Vercel **Production** env (not just Preview).