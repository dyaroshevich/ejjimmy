# LINE Flex Message Design Specification

## Solar Product Cards - Technical Specification v2.0

### Document Overview

This document defines 13 experimental Flex Message designs for displaying solar panel products in LINE chat. Each variant represents a different UX approach optimized for Thai market solar product sales.

**Last Updated:** 2025-01-23  
**Target:** LINE Messaging API v2  
**Language:** Thai (primary), English (labels)

---

## Table of Contents

1. [Product Data Model](#1-product-data-model)
2. [Existing Variants (V1-V3)](#2-existing-variants-v1-v3)
3. [New Variants (V4-V13)](#3-new-variants-v4-v13)
4. [LINE API Constraints](#4-line-api-constraints)
5. [Testing Protocol](#5-testing-protocol)

---

## 1. Product Data Model

All variants consume this unified data structure:

```typescript
interface SolarProduct {
  id: string;
  name: string;           // "แพ็กเกจ 5.5 kW"
  brand: string;          // "TAWAN POWER", "LONGi", "JA Solar"
  power_kw: number;       // 5.5
  price_thb number;      // 159000
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

**Computed Values:**

```typescript
// Electricity rate: 4.7 THB/kWh
// Average sun hours: 5 hours/day
// Monthly production: power_kw * 135 kWh (5 * 30 * 0.9 efficiency)
const monthlySavings = Math.round(powerKw * 135 * 4.7);
const yearlySavings = monthlySavings * 12;
const monthlyInstallment = Math.round((priceThb * 0.9) / 24); // 10% down, 24 months
const roiYears = priceThb > 0 ? Math.round(priceThb / yearlySavings) : 0;
```

---

## 2. Existing Variants (V1-V3)

### V2: Minimalist Single Bubble with Large Price Highlight

**Design Philosophy:** Ultra-minimal - price dominates, minimal text, fast scanning

```typescript
/**
 * V2: Minimalist Single Bubble with Large Price Highlight
 * Focus: Price dominance, quick decision-making
 */
export function createProductFlexMessageV2(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);
  const roiYears = priceThb > 0 ? Math.round(priceThb / (monthlySavings * 12)) : 0;

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Header with power badge
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": `${powerKw} kW`,
                  "size": "3xl",
                  "weight": "bold",
                  "color": "#10b981"
                }
              ],
              "backgroundColor": "#10b9811a",
              "cornerRadius": "md",
              "paddingAll": "8px"
            },
            {
              "type": "text",
              "text": product.name || 'Solar Power',
              "size": "xl",
              "weight": "bold",
              "color": "#0f172a",
              "flex": 1,
              "margin": "md"
            }
          ]
        },
        // Price Block - Hero
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "฿" + formatPrice(priceThb),
              "size": "4xl",
              "weight": "bold",
              "color": "#0f172a",
              "align": "center"
            },
            {
              "type": "text",
              "text": "ประหยัด ฿" + formatPrice(monthlySavings) + "/เดือน",
              "size": "lg",
              "color": "#10b981",
              "align": "center",
              "weight": "bold"
            }
          ],
          "paddingAll": "20px",
          "backgroundColor": "#f0fdf4",
          "cornerRadius": "lg"
        },
        // ROI Badge
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": "🎯 คืนทุน " + roiYears + " ปี",
              "size": "md",
              "color": "#64748b",
              "flex": 1
            },
            {
              "type": "text",
              "text": product.brand || 'TAWAN POWER',
              "size": "sm",
              "color": "#64748b"
            }
          ],
          "margin": "md"
        },
        // CTA Button
        {
          "type": "button",
          "style": "primary",
          "height": "lg",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "จองสิทธิ์ 10% ทันที",
            "text": "สนใจ " + (product.name || 'Solar System') + " ครับ สิทธิ์หัก 10%"
          }
        }
      ]
    }
  };
}
```

**Visual Layout:**

```
┌─────────────────────────────────┐
│ [5.5 kW]     แพ็กเกจ 5.5 kW    │
├─────────────────────────────────┤
│                                 │
│      ฿ 159,000                  │
│   ประหยัด ฿2,636/เดือน           │
│                                 │
├─────────────────────────────────┤
│ 🎯 คืนทุน 5 ปี    TAWAN POWER   │
├─────────────────────────────────┤
│     [ จองสิทธิ์ 10% ทันที ]      │
└─────────────────────────────────┘
```

---

### V3: Image-Focused with Stacked Info Cards

**Design Philosophy:** Image on left, info cards stacked on right

```typescript
/**
 * V3: Image-Focused with Stacked Info Cards
 * Focus: Visual appeal, balanced information
 */
export function createProductFlexMessageV3(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);
  const monthlyInstallment = Math.round((priceThb * 0.9) / 24);

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "horizontal",
      "spacing": "md",
      "contents": [
        // Left: Hero Image
        {
          "type": "box",
          "layout": "vertical",
          "flex": 1,
          "contents": [
            {
              "type": "image",
              "url": HERO_IMAGES[1],
              "size": "full",
              "aspectRatio": "1:1",
              "aspectMode": "cover",
              "cornerRadius": "md"
            }
          ]
        },
        // Right: Info Stack
        {
          "type": "box",
          "layout": "vertical",
          "flex": 2,
          "spacing": "sm",
          "contents": [
            // Title
            {
              "type": "text",
              "text": product.name || 'Solar Power',
              "size": "md",
              "weight": "bold",
              "color": "#0f172a",
              "wrap": true
            },
            // Power Badge
            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                {
                  "type": "text",
                  "text": product.brand || 'TAWAN POWER',
                  "size": "xs",
                  "color": "#64748b",
                  "flex": 1
                },
                {
                  "type": "text",
                  "text": `${powerKw} kW`,
                  "size": "sm",
                  "weight": "bold",
                  "color": "#10b981"
                }
              ]
            },
            {
              "type": "separator",
              "margin": "sm"
            },
            // Price Card
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "ราคา",
                  "size": "xs",
                  "color": "#64748b"
                },
                {
                  "type": "text",
                  "text": `฿${formatPrice(priceThb)}`,
                  "size": "lg",
                  "weight": "bold",
                  "color": "#0f172a"
                }
              ],
              "paddingAll: "sm",
              "backgroundColor": "#f8fafc",
              "cornerRadius": "sm"
            },
            // Savings Card
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "ประหยัด/เดือน",
                  "size": "xs",
                  "color": "#64748b",
                  "flex": 1
                },
                {
                  "type": "text",
                  "text": `฿${formatPrice(monthlySavings)}`,
                  "size": "md",
                  "weight": "bold",
                  "color": "#10b981"
                }
              ]
            },
            // Installment Card
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "ผ่อน/เดือน",
                  "size": "xs",
                  "color": "#64748b",
                  "flex": 1
                },
                {
                  "type": "text",
                  "text": `฿${formatPrice(monthlyInstallment)}`,
                  "size": "md",
                  "weight": "bold",
                  "color": "#f59e0b"
                }
              ]
            },
            // CTA
            {
              "type": "button",
              "style": "primary",
              "height": "sm",
              "color": "#10b981",
              "action": {
                "type": "message",
                "label": "จองสิทธิ์ 10%",
                "text": "สนใจ " + (product.name || 'Solar System') + " ครับ"
              }
            }
          ]
        }
      ]
    }
  };
}
```

**Visual Layout:**

```
┌───────────────────────────────┐
│ ┌─────────┐                   │
│ │         │  แพ็กเกจ 5.5 kW   │
│ │  IMAGE  │  TAWAN POWER 5.5kW│
│ │         │  ────────────────  │
│ │         │  ราคา              │
│ │         │  ฿ 159,000         │
│ │         │  ────────────────  │
│ └─────────┘  ประหยัด   ฿2,636   │
│             ผ่อน/เดือน ฿5,963   │
│             [ จองสิทธิ์ 10% ]   │
└───────────────────────────────┘
```

---

### V4: Feature List Carousel (1 Hero + 2 Info Bubbles)

**Design Philosophy:** Carousel format for detailed exploration

```typescript
/**
 * V4: Feature List Carousel
 * Focus: Step-by-step information flow
 */
export function createProductFlexMessageV4(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  const bubble1 = {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": HERO_IMAGES[0],
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover"
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": product.name || 'Solar Power',
          "size": "lg",
          "weight": "bold",
          "color": "#0f172a",
          "wrap": true
        },
        {
          "type": "box",
          "layout": "baseline",
          "contents": [
            { "type": "text", "text": `${powerKw} kW`, "size": "md", "weight": "bold", "color": "#10b981" },
            { "type": "text", "text": product.brand || 'TAWAN POWER', "size": "sm", "color": "#64748b", "margin": "sm" }
          ]
        },
        { "type": "separator" },
        {
          "type": "text",
          "text": `ราคา ฿${formatPrice(priceThb)} • ประหยัด ฿${formatPrice(monthlySavings)}/เดือน`,
          "size": "md",
          "color": "#0f172a",
          "margin": "md"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "horizontal",
      "contents": [
        { "type": "text", "text": "ดูรายละเอียด →", "size": "sm", "color": "#10b981", "flex": 1 },
        {
          "type": "button",
          "style": "primary",
          "height": "sm",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "จองสิทธิ์",
            "text": "สนใจ " + (product.name || 'Solar System')
          }
        }
      ]
    }
  };

  const bubble2 = {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "📋 สเปกระบบ",
          "size": "lg",
          "weight": "bold",
          "color": "#0f172a"
        },
        { "type": "separator" },
        {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            { "type": "text", "text": `• แผง ${product.specifications?.panel_brand || 'LONGi'} ${powerKw * 2}W`, "size": "sm", "color": "#64748b", "wrap": true },
            { "type": "text", "text": `• อินเวอร์เตอร์ ${product.specifications?.inverter_brand || 'Huawei'}`, "size": "sm", "color": "#64748b" },
            { "type": "text", "text": `• จำนวนแผง ${product.specifications?.panel_count || Math.round(powerKw * 2)} ชิ้น`, "size": "sm", "color": "#64748b" },
            { "type": "text", "text": `• รับประกัน ${product.specifications?.warranty_years || 25} ปี`, "size": "sm", "color": "#64748b" }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "horizontal",
      "contents": [
        { "type": "text", "text": "ดูอุปกรณ์ →", "size": "sm", "color": "#10b981", "flex": 1 }
      ]
    }
  };

  const bubble3 = {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "💰 คืนทุนเร็ว",
          "size": "lg",
          "weight": "bold",
          "color": "#0f172a"
        },
        { "type": "separator" },
        {
          "type": "box",
          "layout": "vertical",
          "spacing": "md",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ประหยัด/เดือน", "size": "sm", "color": "#64748b", "flex": 1 },
                { "type": "text", "text": `฿${formatPrice(monthlySavings)}`, "size": "lg", "weight": "bold", "color": "#10b981" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ประหยัด/ปี", "size": "sm", "color": "#64748b", "flex": 1 },
                { "type": "text", "text": `฿${formatPrice(monthlySavings * 12)}`, "size": "lg", "weight": "bold", "color": "#10b981" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "คืนทุน", "size": "sm", "color": "#64748b", "flex": 1 },
                { "type": "text", "text": `${Math.round(priceThb / (monthlySavings * 12))} ปี`, "size": "lg", "weight": "bold", "color": "#f59e0b" }
              ]
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "button",
          "style": "primary",
          "height": "md",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "จองสิทธิ์ 10% ทันที",
            "text": "สนใจ " + (product.name || 'Solar System') + " ครับ สิทธิ์หัก 10%"
          }
        }
      ]
    }
  };

  return {
    "type": "carousel",
    "contents": [bubble1, bubble2, bubble3]
  };
}
```

**Visual Layout:**

```
┌─────────────────────────────────┐
│  [          HERO IMAGE         ]│
├─────────────────────────────────┤
│  แพ็กเกจ 5.5 kW                │
│  5.5 kW | TAWAN POWER          │
│  ────────────────────────────   │
│  ราคา ฿159,000 • ประหยัด ฿2,636  │
├─────────────────────────────────┤
│  ดูรายละเอียด →  [ จองสิทธิ์ ]   │
└─────────────────────────────────┘
        ↓ Swipe
┌─────────────────────────────────┐
│  📋 สเปกระบบ                    │
│  ────────────────────────────   │
│  • แผง LONGi 275W              │
│  • อินเวอร์เตอร์ Huawei          │
│  • จำนวนแผง 20 ชิ้น             │
│  • รับประกัน 25 ปี              │
├─────────────────────────────────┤
│  ดูอุปกรณ์ →                    │
└─────────────────────────────────┘
```

---

## 3. New Variants (V4-V13)

### V5: Two-Column Split Layout

**Design Philosophy:** Equal split - image left, key facts right. Balance for quick comparison.

```typescript
/**
 * V5: Two-Column Split Layout
 * Focus: Information density with visual balance
 */
export function createProductFlexMessageV5(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "horizontal",
      "contents": [
        // Column 1: Image + Price
        {
          "type": "box",
          "layout": "vertical",
          "flex": 1,
          "contents": [
            {
              "type": "image",
              "url": HERO_IMAGES[2],
              "size": "full",
              "aspectRatio": "4:3",
              "aspectMode": "cover",
              "cornerRadius": "md"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": `฿${formatPrice(priceThb)}`,
                  "size": "xl",
                  "weight": "bold",
                  "color": "#0f172a",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": "ราคาพิเศษ",
                  "size": "xs",
                  "color": "#10b981",
                  "align": "center"
                }
              ],
              "paddingAll": "sm"
            }
          ]
        },
        // Column 2: Key Facts
        {
          "type": "box",
          "layout": "vertical",
          "flex": 1,
          "spacing": "sm",
          "contents": [
            {
              "type": "text",
              "text": product.name || 'Solar',
              "size": "sm",
              "weight": "bold",
              "color": "#0f172a",
              "wrap": true
            },
            {
              "type": "box",
              "layout": "baseline",
              "contents": [
                { "type": "text", "text": `${powerKw} kW`, "size": "md", "weight": "bold", "color": "#10b981" },
                { "type": "text", "text": product.brand || '', "size": "xs", "color": "#64748b", "margin": "xs" }
              ]
            },
            { "type": "separator" },
            {
              "type": "box",
              "layout": "vertical",
              "spacing": "xs",
              "contents": [
                { "type": "text", "text": `ประหยัด ฿${formatPrice(monthlySavings)}/เดือน`, "size": "sm", "weight": "bold", "color": "#10b981" },
                { "type": "text", "text": `ผ่อน ฿${formatPrice(Math.round(priceThb * 0.9 / 24))}/เดือน`, "size": "sm", "color": "#f59e0b" },
                { "type": "text", "text": `คืนทุน ${Math.round(priceThb / (monthlySavings * 12))} ปี`, "size": "sm", "color": "#64748b" }
              ]
            },
            {
              "type": "button",
              "style": "primary",
              "height": "sm",
              "color": "#10b981",
              "action": {
                "type": "message",
                "label": "สนใจ",
                "text": "สนใจ " + (product.name || 'Solar System')
              }
            }
          ]
        }
      ]
    }
  };
}
```

**Visual Layout:**

```
┌─────────────────────────────────┐
│ ┌───────────┬─────────────────┐  │
│ │           │  แพ็กเกจ 5.5 kW │  │
│ │   IMAGE   │  5.5kW LONGi    │  │
│ │           │  ───────────── │  │
│ │           │  ประหยัด ฿2,636  │  │
│ ├───────────┤  ผ่อน ฿5,963      │  │
│ │ ฿159,000  │  คืนทุน 5 ปี     │  │
│ │ ราคาพิเศษ  │  [ สนใจ ]       │  │
│ └───────────┴─────────────────┘  │
└─────────────────────────────────┘
```

---

### V6: Steps/Progress Flow Layout

**Design Philosophy:** Linear flow showing installation journey with numbered steps

```typescript
/**
 * V6: Steps/Progress Flow Layout
 * Focus: Process transparency, building confidence
 */
export function createProductFlexMessageV6(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Header
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                { "type": "text", "text": `${powerKw} kW`, "size": "2xl", "weight": "bold", "color": "#ffffff" },
                { "type": "text", "text": product.brand || 'TAWAN POWER', "size": "xs", "color": "#ffffff99" }
              ],
              "backgroundColor": "#10b981",
              "paddingAll: "12px",
              "cornerRadius": "md"
            },
            {
              "type": "text",
              "text": product.name || 'Solar Package',
              "size": "lg",
              "weight": "bold",
              "color": "#0f172a",
              "flex": 1,
              "margin": "md"
            }
          ]
        },
        // Price Banner
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": "฿" + formatPrice(priceThb),
              "size": "xl",
              "weight": "bold",
              "color": "#0f172a",
              "flex": 1
            },
            {
              "type": "text",
              "text": "ประหยัด ฿" + formatPrice(monthlySavings) + "/เดือน",
              "size": "sm",
              "color": "#10b981",
              "weight": "bold"
            }
          ],
          "backgroundColor": "#f0fdf4",
          "paddingAll": "md",
          "cornerRadius": "md",
          "margin": "md"
        },
        // Steps
        {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            { "type": "separator" },
            { "type": "step", "number": "1", "text": "สำรวจพื้นที่ฟรี (3-7 วัน)" },
            { "type": "step", "number": "2", "text": "ออกแบบระบบ + เสนอราคา" },
            { "type": "step", "number": "3", "text": "ติดตั้ง (1-3 วัน)" },
            { "type": "step", "number": "4", "text": "ตรวจรับ + ส่งมอบ" }
          ]
        },
        // CTA
        {
          "type": "button",
          "style": "primary",
          "height": "lg",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "นัดสำรวจฟรี",
            "text": "ขอนัดสำรวจฟรีสำหรับ " + (product.name || 'Solar System')
          }
        }
      ]
    }
  };
}
```

**Note:** For LINE, implement "step" as a box with horizontal layout containing number circle and text.

---

### V7: Comparison Table Style

**Design Philosophy:** Grid-like table comparing key metrics for quick decision making

```typescript
/**
 * V7: Comparison Table Style
 * Focus: Data-driven comparison, easy scanning
 */
export function createProductFlexMessageV7(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);
  const roiYears = Math.round(priceThb / (monthlySavings * 12));

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Header
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": product.name || 'Solar Package',
              "size": "lg",
              "weight": "bold",
              "color": "#0f172a",
              "wrap": true
            },
            {
              "type": "text",
              "text": `${powerKw} kW • ${product.brand || 'TAWAN POWER'}`,
              "size": "sm",
              "color": "#64748b"
            }
          ],
          "margin": "none"
        },
        { "type": "separator", "margin": "md" },
        // Table Header
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            { "type": "text", "text": "รายการ", "size": "xs", "color": "#64748b", "flex": 2 },
            { "type": "text", "text": "ค่าบริการ", "size": "xs", "color": "#64748b", "flex": 1, "align": "end" }
          ],
          "margin": "sm"
        },
        // Table Rows
        {
          "type": "box",
          "layout": "vertical",
          "spacing": "xs",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ราคาชุด", "size": "sm", "color": "#0f172a", "flex": 2 },
                { "type": "text", "text": `฿${formatPrice(priceThb)}`, "size": "sm", "weight": "bold", "color": "#0f172a", "flex": 1, "align": "end" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ประหยัด/เดือน", "size": "sm", "color": "#0f172a", "flex": 2 },
                { "type": "text", "text": `฿${formatPrice(monthlySavings)}`, "size": "sm", "weight": "bold", "color": "#10b981", "flex": 1, "align": "end" }
              ],
              "backgroundColor": "#f0fdf4",
              "cornerRadius": "sm"
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ผ่อน/เดือน (24 เดือน)", "size": "sm", "color": "#0f172a", "flex": 2 },
                { "type": "text", "text": `฿${formatPrice(Math.round(priceThb * 0.9 / 24))}`, "size": "sm", "weight": "bold", "color": "#f59e0b", "flex": 1, "align": "end" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ระยะเวลาคืนทุน", "size": "sm", "color": "#0f172a", "flex": 2 },
                { "type": "text", "text": `${roiYears} ปี`, "size": "sm", "weight": "bold", "color": "#0f172a", "flex": 1, "align": "end" }
              ]
            }
          ]
        },
        { "type": "separator", "margin": "md" },
        // CTA
        {
          "type": "button",
          "style": "primary",
          "height": "md",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "ขอใบเสนอราคา",
            "text": "ขอใบเสนอราคาสำหรับ " + (product.name || 'Solar System')
          }
        }
      ]
    }
  };
}
```

---

### V8: Value Proposition Focused

**Design Philosophy:** Lead with benefits, de-emphasize price, emotional appeal

```typescript
/**
 * V8: Value Proposition Focused
 * Focus: Emotional benefits over features
 */
export function createProductFlexMessageV8(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": HERO_IMAGES[1],
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover"
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Value Proposition Headline
        {
          "type": "text",
          "text": "☀️ ลดค่าไฟ ได้ทุกเดือน",
          "size": "xl",
          "weight": "bold",
          "color": "#0f172a",
          "wrap": true,
          "align": "center"
        },
        {
          "type": "text",
          "text": `สูงสุด ฿${formatPrice(monthlySavings)}/เดือน ตลอดอายุการใช้งาน 25 ปี`,
          "size": "sm",
          "color: "#64748b",
          "wrap": true,
          "align": "center",
          "margin": "sm"
        },
        { "type": "separator", "margin": "lg" },
        // Key Stats
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "contents": [
                { "type": "text", "text": `${powerKw} kW`, "size": "2xl", "weight": "bold", "color": "#10b981", "align": "center" },
                { "type": "text", "text": "กำลังการผลิต", "size": "xs", "color": "#64748b", "align": "center" }
              ]
            },
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "contents": [
                { "type": "text", "text": `฿${formatPrice(monthlySavings)}`, "size": "2xl", "weight": "bold", "color": "#10b981", "align": "center" },
                { "type": "text", "text": "ประหยัด/เดือน", "size": "xs", "color": "#64748b", "align": "center" }
              ]
            },
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "contents": [
                { "type": "text", "text": `฿${formatPrice(priceThb)}`, "size": "2xl", "weight": "bold", "color": "#10b981", "align": "center" },
                { "type": "text", "text": "ราคาชุด", "size": "xs", "color": "#64748b", "align": "center" }
              ]
            }
          ]
        },
        { "type": "separator", "margin": "lg" },
        // Trust Signals
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            { "type": "text", "text": "✅ ติดตั้งฟรี", "size": "xs", "color": "#64748b" },
            { "type": "text", "text": "✅ รับประกัน 25 ปี", "size": "xs", "color": "#64748b", "margin": "md" },
            { "type": "text", "text": "✅ ผ่อน 0%", "size": "xs", "color": "#64748b", "margin": "md" }
          ]
        },
        // CTA
        {
          "type": "button",
          "style": "primary",
          "height": "lg",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "เริ่มประหยัดวันนี้",
            "text": "สนใจ " + (product.name || 'Solar System') + " เพื่อเริ่มประหยัดค่าไฟ"
          }
        }
      ]
    }
  };
}
```

---

### V9: Technical Specs Detailed

**Design Philosophy:** Data-heavy for technical buyers, specifications prominent

```typescript
/**
 * V9: Technical Specs Detailed
 * Focus: Technical details for informed decision makers
 */
export function createProductFlexMessageV9(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const specs = product.specifications || {};
  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Title Block
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": product.name || 'Solar Package',
              "size": "lg",
              "weight": "bold",
              "color": "#0f172a",
              "flex": 1,
              "wrap": true
            },
            {
              "type": "text",
              "text": `${powerKw} kW`,
              "size": "lg",
              "weight": "bold",
              "color": "#10b981"
            }
          ]
        },
        {
          "type": "text",
          "text": `฿${formatPrice(priceThb)} • ประหยัด ฿${formatPrice(monthlySavings)}/เดือน`,
          "size": "sm",
          "color": "#64748b",
          "margin": "sm"
        },
        { "type": "separator" },
        // System Configuration
        {
          "type": "text",
          "text": "⚙️ คอนฟิกuration",
          "size": "sm",
          "weight": "bold",
          "color": "#0f172a",
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "vertical",
          "spacing": "xs",
          "contents": [
            { "type": "spec_row", "label": "แผงโซลาร์", "value": specs.panel_brand || 'LONGi 550W' },
            { "type": "spec_row", "label": "อินเวอร์เตอร์", "value": specs.inverter_brand || 'Huawei' },
            { "type": "spec_row", "label": "จำนวนแผง", "value": `${specs.panel_count || Math.round(powerKw * 2)} ชิ้น` },
            { "type": "spec_row", "label": "ขนาดรวม", "value": `${powerKw * 1000 / 550} ตร.ม.` }
          ]
        },
        { "type": "separator" },
        // Warranty
        {
          "type": "text",
          "text": "🛡️ การรับประกัน",
          "size": "sm",
          "weight": "bold",
          "color": "#0f172a",
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "vertical",
          "spacing": "xs",
          "contents": [
            { "type": "spec_row", "label": "ประกันแผง", "value": `${specs.warranty_years || 25} ปี` },
            { "type": "spec_row", "label": "ประกันอินเวอร์เตอร์", "value": `${specs.inverter_warranty || 10} ปี` },
            { "type": "spec_row", "label": "ประสิทธิภาพ", "value": '25 ปีที่ 80%' }
          ]
        },
        // CTA
        {
          "type": "button",
          "style": "primary",
          "height": "md",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "ดูรายละเอียดเพิ่มเติม",
            "text": "สเปกเพิ่มเติมของ " + (product.name || 'Solar System')
          }
        }
      ]
    }
  };
}
```

**Note:** "spec_row" is a box with horizontal layout containing label and value columns.

---

### V10: Testimonial/Authority Style

**Design Philosophy:** Social proof, trust through testimonials

```typescript
/**
 * V10: Testimonial/Authority Style
 * Focus: Social proof, building trust through others' experiences
 */
export function createProductFlexMessageV10(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Authority Badge
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": "🏆",
              "size": "xl"
            },
            {
              "type": "text",
              "text": "ติดตั้งแล้ว 500+ หลังในกระบี่",
              "size": "sm",
              "weight": "bold",
              "color": "#0f172a",
              "flex": 1,
              "margin": "sm"
            }
          ],
          "backgroundColor": "#fef3c7",
          "paddingAll": "md",
          "cornerRadius": "md"
        },
        // Product Name
        {
          "type": "text",
          "text": product.name || 'Solar Package',
          "size": "lg",
          "weight": "bold",
          "color": "#0f172a",
          "margin": "md"
        },
        // Testimonial Card
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "\"ติดตั้งแล้วค่าไฟลดจาก 8,000 บาท เหลือ 1,500 บาท ดีใจมากค่ะ\"",
              "size": "sm",
              "color": "#0f172a",
              "wrap": true,
              "italic": true
            },
            {
              "type": "text",
              "text": "— คุณสมศรี บ้านอินเดีย กระบี่",
              "size": "xs",
              "color": "#64748b",
              "margin": "sm"
            }
          ],
          "paddingAll": "md",
          "backgroundColor": "#f8fafc",
          "cornerRadius": "md"
        },
        { "type": "separator", "margin": "md" },
        // Key Numbers
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": `${powerKw} kW`,
              "size": "xl",
              "weight": "bold",
              "color": "#10b981"
            },
            {
              "type": "text",
              "text": `฿${formatPrice(priceThb)}`,
              "size": "xl",
              "weight": "bold",
              "color": "#0f172a",
              "flex": 1,
              "margin": "md"
            },
            {
              "type": "text",
              "text": `ประหยัด ฿${formatPrice(monthlySavings)}/เดือน`,
              "size": "sm",
              "color": "#10b981"
            }
          ]
        },
        // CTA
        {
          "type": "button",
          "style": "primary",
          "height": "lg",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "รับใบเสนอราคาฟรี",
            "text": "ขอใบเสนอราคาสำหรับ " + (product.name || 'Solar System')
          }
        }
      ]
    }
  };
}
```

---

### V11: Urgency/Scarcity Style

**Design Philosophy:** Time pressure, limited availability

```typescript
/**
 * V11: Urgency/Scarcity Style
 * Focus: FOMO, limited time offers
 */
export function createProductFlexMessageV11(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": HERO_IMAGES[0],
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover"
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Flash Sale Banner
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "text",
              "text": "⚡ FLASH SALE",
              "size": "sm",
              "weight": "bold",
              "color": "#ffffff"
            },
            {
              "type": "text",
              "text": "เหลือเวลา 48 ชม.",
              "size": "sm",
              "color: "#ffffff",
              "flex": 1,
              "align": "end"
            }
          ],
          "backgroundColor": "#ef4444",
          "paddingAll": "md",
          "cornerRadius": "md"
        },
        // Product Info
        {
          "type": "text",
          "text": product.name || 'Solar Package',
          "size": "lg",
          "weight": "bold",
          "color": "#0f172a",
          "margin": "md"
        },
        {
          "type": "text",
          "text": `${powerKw} kW • ${product.brand || 'TAWAN POWER'}`,
          "size": "sm",
          "color: "#64748b"
        },
        // Price Comparison
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                { "type": "text", "text": "ราคาปกติ", "size": "xs", "color": "#64748b", "align": "center" },
                { "type": "text", "text": `฿${formatPrice(Math.round(priceThb * 1.1))}`, "size": "sm", "color": "#64748b", "align": "center", "decoration": "line-through" }
              ],
              "flex": 1
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": [
                { "type": "text", "text": "ราคาพิเศษ", "size": "xs", "color": "#ef4444", "align": "center", "weight": "bold" },
                { "type": "text", "text": `฿${formatPrice(priceThb)}`, "size": "lg", "weight": "bold", "color": "#10b981", "align": "center" }
              ],
              "flex": 1,
              "backgroundColor": "#f0fdf4",
              "cornerRadius": "md",
              "paddingAll": "sm"
            }
          ],
          "margin": "md"
        },
        // Savings Highlight
        {
          "type": "text",
          "text: "🎉 ประหยัด ฿" + formatPrice(Math.round(priceThb * 0.1)) + " วันนี้เท่านั้น",
          "size": "sm",
          "weight": "bold",
          "color": "#ef4444",
          "align": "center",
          "margin": "md"
        },
        // CTA
        {
          "type": "button",
          "style": "primary",
          "height": "lg",
          "color": "#ef4444",
          "action": {
            "type": "message",
            "label": "จองสิทธิ์ 10% ทันที",
            "text": "สนใจ " + (product.name || 'Solar System') + " ครับ สิทธิ์หัก 10%"
          }
        }
      ]
    }
  };
}
```

---

### V12: Calculator Style

**Design Philosophy:** Interactive feel, let user calculate their own savings

```typescript
/**
 * V12: Calculator Style
 * Focus: User-driven exploration, self-service
 */
export function createProductFlexMessageV12(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Header
        {
          "type": "text",
          "text": "🧮 คำนวณความคุ้มค่า",
          "size": "lg",
          "weight": "bold",
          "color": "#0f172a",
          "align": "center"
        },
        {
          "type": "text",
          "text: `${product.name || 'Solar Package'} ${powerKw} kW`,
          "size": "sm",
          "color": "#64748b",
          "align": "center",
          "margin": "sm"
        },
        { "type": "separator", "margin": "lg" },
        // Calculator Display
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ค่าไฟต่อเดือน", "size": "sm", "color": "#64748b", "flex": 1 },
                { "type": "text", "text": `฿${formatPrice(Math.round(monthlySavings * 3))}`, "size": "md", "weight": "bold", "color": "#0f172a", "align": "end" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ผลิตไฟได้", "size": "sm", "color": "#64748b", "flex": 1 },
                { "type": "text", "text": `${powerKw * 135} kWh/เดือน`, "size": "md", "weight": "bold", "color": "#0f172a", "align": "end" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ประหยัด/เดือน", "size": "sm", "color": "#64748b", "flex": 1 },
                { "type": "text", "text": `฿${formatPrice(monthlySavings)}`, "size": "md", "weight": "bold", "color": "#10b981", "align": "end" }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                { "type": "text", "text": "ประหยัด/ปี", "size": "sm", "color": "#64748b", "flex": 1 },
                { "type": "text", "text": `฿${formatPrice(monthlySavings * 12)}`, "size": "md", "weight": "bold", "color": "#10b981", "align": "end" }
              ]
            }
          ],
          "backgroundColor": "#f8fafc",
          "paddingAll": "md",
          "cornerRadius": "lg"
        },
        { "type": "separator", "margin": "lg" },
        // Price
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            { "type": "text", "text": "ราคาเริ่มต้น", "size": "sm", "color": "#64748b" },
            { "type": "text", "text": `฿${formatPrice(priceThb)}`, "size": "lg", "weight": "bold", "color": "#0f172a", "flex": 1, "align": "end" }
          ]
        },
        // CTA
        {
          "type": "button",
          "style": "primary",
          "height": "lg",
          "color": "#10b981",
          "action": {
            "type": "message",
            "label": "คำนวณค่าไฟของฉัน",
            "text": "คำนวณค่าไฟของฉันสำหรับ " + (product.name || 'Solar System')
          }
        }
      ]
    }
  };
}
```

---

### V13: WhatsApp-Style Simple

**Design Philosophy:** Mimics WhatsApp conversation style, ultra-familiar

```typescript
/**
 * V13: WhatsApp-Style Simple
 * Focus: Familiar chat interface, casual tone
 */
export function createProductFlexMessageV13(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        // Chat Bubble 1
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "สวัสดีครับ! แพ็กเกจ ${powerKw} kW นี้เหมาะสำหรับบ้านที่ใช้ไฟ 4,000-6,000 บาท/เดือนครับ",
              "size": "sm",
              "color": "#0f172a",
              "wrap": true
            }
          ],
          "backgroundColor": "#f1f5f9",
          "cornerRadius": "lg",
          "paddingAll": "md"
        },
        // Product Card
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "image",
              "url": HERO_IMAGES[2],
              "size": "lg",
              "aspectRatio": "1:1",
              "aspectMode": "cover",
              "cornerRadius": "md"
            },
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "spacing": "xs",
              "margin": "md",
              "contents": [
                {
                  "type": "text",
                  "text": product.name || 'Solar Package',
                  "size": "sm",
                  "weight": "bold",
                  "color": "#0f172a",
                  "wrap": true
                },
                {
                  "type": "text",
                  "text": `฿${formatPrice(priceThb)}`,
                  "size": "md",
                  "weight": "bold",
                  "color": "#10b981"
                },
                {
                  "type": "text",
                  "text": "ประหยัด ฿${formatPrice(monthlySavings)}/เดือน",
                  "size": "xs",
                  "color": "#64748b"
                }
              ]
            }
          ],
          "paddingAll": "sm",
          "backgroundColor": "#ffffff",
          "cornerRadius": "md",
          "borderWidth": "1px",
          "borderColor": "#e2e8f0"
        },
        // Chat Bubble 2
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "สนใจติดตั้งไหมครับ? ตอนนี้มีสิทธิ์หัก 10% สำหรับผู้ที่นัดสำรวจวันนี้ครับ",
              "size": "sm",
              "color": "#0f172a",
              "wrap": true
            }
          ],
          "backgroundColor": "#10b981",
          "cornerRadius": "lg",
          "paddingAll": "md"
        },
        // Quick Replies
        {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            {
              "type": "button",
              "style": "primary",
              "height": "md",
              "color": "#10b981",
              "action": {
                "type": "message",
                "label": "สนใจครับ ขอนัดสำรวจ",
                "text": "สนใจ " + (product.name || 'Solar System') + " ครับ ขอนัดสำรวจ"
              }
            },
            {
              "type": "button",
              "style": "secondary",
              "height": "sm",
              "action": {
                "type": "message",
                "label": "ส่งรายละเอียดเพิ่มเติม",
                "text": "ส่งรายละเอียดเพิ่มเติม"
              }
            }
          ]
        }
      ]
    }
  };
}
```

---

## 4. LINE API Constraints

### Size Limits

| Parameter | Limit |
|-----------|-------|
| Flex Message size | ~2KB (2048 bytes) |
| altText length | Max 1500 characters |
| Carousel bubbles | Max 12 bubbles |
| Bubble hero image | aspectRatio: 20:13 (recommended) |

### Color Format

All colors must be in hexadecimal format:
- ✅ `"#10b981"` - Valid
- ❌ `"#10b981"` with alpha not supported directly

### Text Size Hierarchy

```
xxl > xl > lg > md > sm > xs > xxs
```

### Layout Types

| Layout | Use Case |
|--------|----------|
| `vertical` | Stacked elements, lists |
| `horizontal` | Side-by-side elements |
| `baseline` | Text with icon alignment |
| `center` | (in align property) |

### Action Types

```typescript
// Message action (sends text to chat)
{
  "type": "message",
  "label": "Button text",
  "text": "User message"
}

// URI action (opens URL)
{
  "type": "uri",
  "label": "Call now",
  "uri": "tel:+66812345678"
}

// Postback action (hidden data)
{
  "type": "postback",
  "label": "Select option",
  "data": "product=5.5kw&variant=V12"
}
```

---

## 5. Testing Protocol

### Manual Testing Checklist

- [ ] Bubble renders without overflow
- [ ] All buttons are tappable (min 44px touch target)
- [ ] Text wraps correctly on narrow screens
- [ ] Hero image loads (if applicable)
- [ ] Price formatting correct (Thai locale)
- [ ] CTA button stands out visually
- [ ] Color contrast passes WCAG 2.1 AA

### API Testing

```bash
# Send test message
curl -X POST https://api.line.me/v2/bot/message/push \
  -H "Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_ID",
    "messages": [{
      "type": "flex",
      "altText": "Product variant V12",
      "contents": <BUBBLE_JSON>
    }]
  }'
```

### Debugging Tips

1. **JSON Validation:** Use `JSON.stringify(message, null, 2)` before sending
2. **Size Check:** Verify message size under 2KB
3. **Image URLs:** Test that all image URLs are accessible
4. **Layout Issues:** Check for missing `layout` properties on boxes

---

## Appendix: Design System Tokens

```typescript
// Color Palette
const colors = {
  primary: '#10b981',      // Emerald green - brand color
  secondary: '#f59e0b',    // Amber - accent/warning
  text: '#0f172a',         // Slate 900 - primary text
  textMuted: '#64748b',    // Slate 500 - secondary text
  background: '#ffffff',    // White
  surface: '#f8fafc',      // Slate 50 - subtle background
  success: '#10b981',      // Same as primary
  danger: '#ef4444',       // Red 500 - urgency
};

// Typography Scale
const sizes = {
  hero: '4xl',            // Large price displays
  title: 'xl',            // Section headers
  subtitle: 'lg',        // Product names
  body: 'md',            // Regular content
  caption: 'sm',         // Labels, metadata
  tiny: 'xs',            // Fine print
};

// Spacing Scale
const spacing = {
  xs: '4px',   // Tight
  sm: '8px',   // Default
  md: '12px',  // Comfortable
  lg: '16px',  // Spacious
  xl: '24px',  // Section gaps
};
```

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-15 | Initial V1-V3 variants |
| 2.0 | 2025-01-23 | Added V4-V13 variants with design rationale |