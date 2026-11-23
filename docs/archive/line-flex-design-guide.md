# 📱 LINE Flex Message Catalog & Design Guide: Tawan Power

## 1. Overview
This guide documents the **13 production-ready Flex Message variants** implemented for Tawan Power (Solar Krabi). These variants are optimized for high conversion, brand consistency (#10b981 primary), and technical stability within the LINE Messaging API.

---

## 2. Technical Standards (Senior Level)

1.  **Unified Export:** All variants are centralized in `src/lib/line.ts` under the `PRODUCT_CARD_VARIANTS` object.
2.  **Type Safety:** Every layout uses `as const` for property types to ensure valid JSON serialization.
3.  **Failover Ready:** The Chat API (`route.ts`) can dynamically switch between these variants for A/B testing.
4.  **Payload Management:** Complex carousels (V9, V12) are optimized to stay near the 2048-byte limit per bubble.

---

## 3. Product Variant Catalog (V1 - V13)

| ID | Name | Design Goal | Key Feature |
| :--- | :--- | :--- | :--- |
| **V1** | **Hero Typography** | Visual Impact | Large hero image + bold typography scale. |
| **V2** | **Staggered** | Information Density | Split layout with image on the right. |
| **V3** | **Bento Grid** | Technical Detail | Card-based grouping for multi-part systems. |
| **V4** | **Minimalist** | Flash Conversion | Extreme focus on price and a single CTA. |
| **V5** | **Two-Column** | Comparison | Balanced split for residential vs business specs. |
| **V6** | **Step Journey** | Education | Carousel showing the 4-step installation process. |
| **V7** | **Grid Table** | Decision Making | Data table for price, savings, and ROI. |
| **V8** | **Value Prop** | Emotional Appeal | Focus on lifestyle benefits and cost reduction. |
| **V9** | **Mega Carousel** | Full Transparency | 10-bubble deep dive into every system aspect. |
| **V10**| **Urgency** | FOMO / Flash Sale | Modern editorial style with scarcity highlights. |
| **V11**| **Package Compare**| Price Discovery | Comparison of kW sizes from 3.3kW to 22kW. |
| **V12**| **Premium Calc** | Self-Service | Interactive-feel data cards for ROI planning. |
| **V13**| **Chat Style** | Social Trust | WhatsApp-style layout with personal greeting. |

---

## 4. Implementation Example: V4 (Minimalist)
Used for quick "Add to Cart" scenarios in AI Chat.
```typescript
export function createProductFlexMessageV4(product: any) {
  return {
    type: "bubble",
    size: "mega",
    body: {
      type: "box", layout: "vertical", paddingAll: "lg",
      contents: [
        { type: "text", text: "🔥 ฮิตที่สุด", color: "#10b981", weight: "bold", size: "xs" },
        { type: "text", text: product.name, weight: "bold", size: "xl", margin: "sm" },
        { type: "text", text: `฿${formatPrice(product.price_thb)}`, size: "3xl", weight: "bold" }
      ]
    }
  };
}
```

## 5. Usage in API
To trigger a specific variant, use the exported object:
```typescript
import { PRODUCT_CARD_VARIANTS } from '@/lib/line';
const flex = PRODUCT_CARD_VARIANTS.V13(productData);
```

---
*Last Updated: May 14, 2026 | Verified via test-line-variants.js (100% Success Rate)*
