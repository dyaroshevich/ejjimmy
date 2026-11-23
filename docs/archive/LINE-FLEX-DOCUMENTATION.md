# LINE Flex Message Variants - Complete Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [All Variants (V1-V13)](#2-all-variants-v1-v13)
3. [How to Test](#3-how-to-test)
4. [Architecture](#4-architecture)
5. [Integration with Real Data](#5-integration-with-real-data)
6. [LINE Bot Implementation Guide](#6-line-bot-implementation-guide)
7. [Future Roadmap](#7-future-roadmap)
8. [System Alert Variants](#8-system-alert-variants)

---

## 1. Overview

### Purpose
This documentation describes 13 LINE Flex Message variants (V1-V13) for Tawan Power solar panel product cards. Each variant represents a different UX approach optimized for Thai market solar sales.

### Product Data Model

```typescript
interface SolarProduct {
  id: string;
  name: string;           // "แพ็กเกจ 5.5 kW"
  brand: string;         // "TAWAN POWER", "LONGi", "JA Solar"
  power_kw: number;      // 5.5
  price_thb: number;     // 159000
  specifications: {
    panel_brand: string;
    inverter_brand: string;
    panel_count: number;
    warranty_years: number;
    [key: string]: string | number;
  };
  system_components: Array<{
    item: string;
    qty?: number;
  }>;
  image_url?: string;
}
```

### Computed Values

```typescript
// Electricity rate: 4.7 THB/kWh
// Average sun hours: 5 hours/day
// Monthly production: power_kw * 135 kWh (5 * 30 * 0.9 efficiency)
const monthlySavings = Math.round(powerKw * 135 * 4.7);
const yearlySavings = monthlySavings * 12;
const monthlyInstallment = Math.round((priceThb * 0.9) / 24); // 10% down, 24 months
const roiYears = priceThb > 0 ? Math.round(priceThb / yearlySavings) : 0;
```

### LINE API Constraints

| Parameter | Value |
|-----------|-------|
| Max bubble size | ~2KB (2048 bytes) |
| Max carousel bubbles | 10 |
| Supported text sizes | xxs, xs, sm, md, lg, xl, xxl, 2xl, 3xl, 4xl |
| Supported cornerRadius | none, sm, md, lg, xl |
| Supported padding | none, xs, sm, md, lg, xl, xxl |
| Button height property | NOT supported on buttons |

### Design System (Tawan Power)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#10b981` | Success, savings, CTA |
| Secondary | `#f59e0b` | Warning, highlights |
| Danger | `#ef4444` | Urgency, savings amount |
| Text | `#0f172a` | Primary text |
| Muted | `#64748b` | Secondary text |
| Background | `#f0fdf4` | Green tint cards |

---

## 2. All Variants (V1-V13)

### V1: Basic Product Card (Simple, Traditional) ✅ TESTED

**Design Philosophy:** Standard product card, familiar format, reliable

**Type:** Single bubble

**Bubbles:** 1

**Size:** ~1,115 bytes

**Test File:** `test-v1.mjs`

---

### V2: Minimalist Single Bubble with Large Price Highlight ✅ TESTED

**Design Philosophy:** Ultra-minimal - price dominates, minimal text, fast scanning

**Type:** Single bubble

**Bubbles:** 1

**Size:** ~1,138 bytes

**Test File:** `test-v2.mjs`

---

### V3: Image-Focused with Stacked Info Cards ✅ TESTED

**Design Philosophy:** Image on left, info cards stacked on right

**Type:** Single bubble

**Bubbles:** 1

**Size:** ~1,283 bytes

**Test File:** `test-v3.mjs`

---

### V4: Minimalist Single Bubble with Large Price Highlight ✅ TESTED

**Design Philosophy:** Ultra-minimal - price dominates, minimal text, fast scanning

**Type:** Single bubble

**Bubbles:** 1

**Size:** ~1,500 bytes

**Test File:** `test-v4.mjs`

---

### V5: Two-Column Split Layout ✅ TESTED

**Design Philosophy:** Balanced information architecture, visual hierarchy

**Type:** Single bubble

**Bubbles:** 1

**Size:** ~2,000 bytes

**Test File:** `test-v5.mjs`

---

### V6: Steps/Progress Flow Carousel ✅ TESTED

**Design Philosophy:** Educational, step-by-step journey, build confidence

**Type:** Carousel

**Bubbles:** 5

**Total Size:** ~9,000 bytes

**Test File:** `test-v6.mjs`

---

### V7: Comparison Table with Trust Signals ✅ TESTED

**Design Philosophy:** Data-driven, comprehensive, comparison-focused

**Type:** Single bubble

**Bubbles:** 1

**Size:** ~3,000 bytes

**Test File:** `test-v7.mjs`

---

### V8: Value Proposition Carousel ✅ TESTED

**Design Philosophy:** Benefits-focused, emotional, value-driven

**Type:** Carousel

**Bubbles:** 5

**Total Size:** ~10,000 bytes

**Test File:** `test-v8.mjs`

---

### V9: Technical Specs Carousel ✅ TESTED

**Design Philosophy:** Technical depth, specifications showcase, professional

**Type:** Carousel

**Bubbles:** 10

**Total Size:** ~11,000 bytes

**Test File:** `test-v9.mjs`

---

### V10: Urgency/Scarcity (Redesigned) ✅ TESTED

**Design Philosophy:** Time pressure, limited availability, FOMO

**Type:** Carousel

**Bubbles:** 8

**Total Size:** ~9,240 bytes

**Test File:** `test-v10.mjs`

---

### V11: Urgency Premium (8-Bubble Carousel) ✅ TESTED

**Design Philosophy:** Premium urgency with countdown timer, dark accents, exclusive deals

**Type:** Carousel

**Bubbles:** 8

**Total Size:** ~17,453 bytes

**Test File:** `test-v11.mjs`

---

### V12: Calculator Premium (8-Bubble Carousel) ✅ TESTED

**Design Philosophy:** Data-driven, self-service, let users calculate their own savings

**Type:** Carousel

**Bubbles:** 8

**Total Size:** ~17,466 bytes

**Test File:** `test-v12.mjs`

---

### V13: WhatsApp-Style Premium (8-Bubble Carousel) ✅ TESTED

**Design Philosophy:** Personal, conversational, warm connection like chatting with a friend

**Type:** Carousel

**Bubbles:** 8

**Total Size:** ~16,372 bytes

**Test File:** `test-v13.mjs`

---

## 3. How to Test

### Quick Test (Manual)

1. **Setup environment:**
   ```bash
   # Make sure .env.local has LINE_CHANNEL_ACCESS_TOKEN and LINE_ADMIN_ID
   ```

2. **Run test script:**
   ```bash
   node test-v1.mjs      # Test V1 Basic
   node test-v11.mjs     # Test V11 Premium Carousel
   node test-alerts.mjs  # Test System Alerts (CRITICAL, WARNING, INFO)
   ```

3. **Check LINE Chat:**
   - Messages will appear in your LINE chat (Uf63c5b44a3ac7aad18153620fac57126)
   - Scroll/swipe carousels to see all bubbles

### All Test Files

| File | Variant | Status | Size |
|------|---------|--------|------|
| `test-v1.mjs` | V1 Basic | ✅ Tested | ~1.1KB |
| `test-v2.mjs` | V2 Minimalist | ✅ Tested | ~1.1KB |
| `test-v3.mjs` | V3 Image-Focused | ✅ Tested | ~1.3KB |
| `test-v4.mjs` | V4 Minimalist | ✅ Tested | ~1.5KB |
| `test-v5.mjs` | V5 Two-Column | ✅ Tested | ~2.0KB |
| `test-v6.mjs` | V6 Steps | ✅ Tested | ~9.0KB |
| `test-v7.mjs` | V7 Comparison | ✅ Tested | ~3.0KB |
| `test-v8.mjs` | V8 Value Prop | ✅ Tested | ~10KB |
| `test-v9.mjs` | V9 Technical | ✅ Tested | ~11KB |
| `test-v10.mjs` | V10 Urgency | ✅ Tested | ~9.2KB |
| `test-v11.mjs` | V11 Urgency Prem | ✅ Tested | ~17.5KB |
| `test-v12.mjs` | V12 Calculator Prem| ✅ Tested | ~17.5KB |
| `test-v13.mjs` | V13 WhatsApp Prem | ✅ Tested | ~16.4KB |
| `test-alerts.mjs`| System Alerts | ✅ Tested | ~2.5KB |

---

## 4. Architecture

### File Structure

```
src/lib/line.ts          # All Flex Message variants (V1-V13 + Alerts)
test-v1.mjs              # Test scripts
...
test-v13.mjs
test-alerts.mjs          # Test alerts script

LINE-FLEX-SPEC.md         # Technical specification
LINE-FLEX-DOCUMENTATION.md # This file
```

### Export Pattern

```typescript
// System Alerts
export function createSystemAlertFlexMessage(incident: IncidentData): Bubble
export async function sendAdminAlert(incident: IncidentData): Promise<any>

// Export all variants
export const PRODUCT_CARD_VARIANTS = {
  V1: createProductFlexMessageV1,
  // ... V2-V13
};
```

---

## 5. Integration with Real Data

### Current State
Hardcoded packages in V11-V13.
Automated alerts are integrated in `/api/chat/route.ts` for proactive error tracking.

### Recommended Next Steps
- Connect to Supabase `solar_products` table.
- Dynamically generate carousel bubbles from database records.

---

## 6. LINE Bot Implementation Guide

### LINE Developer Console Setup

1. **Create LINE Official Account:**
   - Go to https://developers.line.biz/console/
   - Create new Messaging API channel

2. **Get Channel Access Token:**
   - Add to `.env.local` as `LINE_CHANNEL_ACCESS_TOKEN`

3. **Set Admin ID:**
   - Add your LINE user ID to `.env.local` as `LINE_ADMIN_ID`

---

## 7. Future Roadmap

### Phase 1: Core Integration (Done ✅)
- [x] V1-V13 Flex Message variants
- [x] Automated System Alerts (CRITICAL, WARNING, INFO)
- [x] Test scripts for all 14 scenarios
- [x] Backend integration in `/api/chat` for automated error reporting

### Phase 2: Database Integration (Next)
- [ ] Connect to Supabase `solar_products` table
- [ ] Product CRUD operations in Admin panel

---

## 8. System Alert Variants

### CRITICAL Alert
**Usage:** System fully non-functional (e.g., all AI providers down).
**Visual:** Red header, 🔴 icon, high-urgency action text.

### WARNING Alert
**Usage:** Single service failure or slowness (e.g., Supabase slow).
**Visual:** Yellow header, ⚠️ icon, cautionary text.

### INFO Alert
**Usage:** Success notifications, reports (e.g., daily lead summary).
**Visual:** Blue header, ℹ️ icon, informational text.

---

**Document Version:** 3.0
**Last Updated:** 2026-05-14
**Author:** Claude Code (AI Assistant)
