# Technical Specification: LINE Flex Message Product Variants (V4-V13)

## 1. Overview
Goal: Create 10 additional LINE Flex Message bubble variants (V4-V13) for solar product cards.
Constraints: Max ~2KB size, Tawan Power design system compliance (#10b981 primary, Inter font).

## 2. Implementation Rules
- All variants must be implemented in `src/lib/line.ts`.
- Use TypeScript objects, avoiding broken JSON-like syntax.
- Use `as const` for layout/type properties.
- Strictly adhere to `DESIGN.md` and `DESIGN-SYSTEM/SKILL.md`.

## 3. Variant Definitions

| ID | Concept | Description |
| :--- | :--- | :--- |
| **V4** | Minimalist Price | Large price highlight, minimal text. |
| **V5** | Image-focused | Hero image (20:13), stacked info cards below. |
| **V6** | Feature Carousel | 1 hero bubble + 2 feature list bubbles. |
| **V7** | Split Layout | Two-column (Image Left, Specs Right). |
| **V8** | Step Flow | Vertical steps/progress layout. |
| **V9** | Comparison | ROI/Price comparison table. |
| **V10** | Value Prop | Focus on unique selling points. |
| **V11** | Tech Specs | Detailed horizontal specs list. |
| **V12** | Testimonial | Rating, authority badge, project photo. |
| **V13** | CTA Focus | Primary action buttons + secondary links. |

## 4. Verification Protocol
1. `npm run build` (Type safety & Syntax check).
2. `test-line-variants.js` (API connectivity check).
3. `test-card-variants.html` (Layout/Readability check).
