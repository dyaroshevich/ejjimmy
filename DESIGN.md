---
name: "Ejjimmy Solar (Ejjimmy กระบี่)"
colors:
  primary: "#ff8a00"
  primary-deep: "#ea580c"
  secondary: "#f59e0b"
  tertiary: "#f59e0b"
  neutral: "#ffffff"
  success: "#059669"
  warning: "#f59e0b"
  danger: "#ef4444"
  surface: "#ffffff"
  surface-dark: "#2d1a04"
  text: "#0f172a"
  text-dark: "#ecfdf5"
  admin-bg: "#1a0e00"
  admin-sidebar: "#2d1a04"
  admin-card: "#3d260a"
typography:
  body:
    fontFamily: "Manrope (Latin/Cyrillic), Prompt (Thai), system-ui (CJK)"
    fontSize: 1rem
  h1:
    fontFamily: "Manrope 800 / Prompt 900"
    fontSize: 3rem
  body-md:
    fontFamily: "Manrope, Prompt"
    fontSize: 1rem
  label-caps:
    fontFamily: "Sarabun"
    fontSize: 0.75rem
  sourceScale: "mobile-first compact scale"
  weights: "400, 500, 600, 700, 800 + Prompt 900, tabular-nums, high-readability"
rounded:
  sm: 4px
  md: 8px
  base: 1rem
  card: 1.5rem
  hero: 2.5rem
spacing:
  sm: 4px
  md: 8px
  sourceScale: "4/8/12/16/24/32"
---

## Overview
Ejjimmy Solar (Ejjimmy กระบี่) provides expert solar energy solutions tailored specifically for Krabi, Thailand, combining local climate expertise with high-end equipment from global industry leaders. Our distinct approach blends personalized system design with intelligent, data-driven product matching, ensuring optimized efficiency for both residential and commercial clients in the unique environmental conditions of the Krabi region.

## Style Foundations
- **Visual style:** modern, clean, high-contrast, professional, data-driven, trustworthy, mobile-first, tech-forward
- **Typography scale:** mobile-first compact scale | Fonts: body/display=Sarabun (Thai+Latin), Cyrillic donor=Noto Sans (+900 for display black), fallback=Noto Sans Thai, system-ui | weights=400, 500, 600, 700, 800 + donor 900, tabular-nums, high-readability
- **Multilingual rule:** Thai text is NEVER letter-spaced (`:lang(th){letter-spacing:0}` — tracking breaks vowels/tone marks); uppercase kickers apply to Latin/Cyrillic; every Thai string carries `lang="th"`
- **Color palette:** primary, neutral, success, warning, danger, semantic-naming, 60-30-10-rule, high-visibility, glassmorphism-ready, energy-inspired | Tokens: primary=#ff8a00, primary-deep=#ea580c, secondary=#f59e0b, success=#059669, warning=#f59e0b, danger=#ef4444, surface=#ffffff, text=#0f172a
- **Public themes:** light (orangeLight: bg #f8fafc, text #0f172a) + dark (slate-950 base); cream paper #FFF7ED for PWA/offline surfaces
- **Admin Dark Mode:** bg=#1a0e00, sidebar=#2d1a04, card=#2d1a04→#3d260a (orangeNoir tokens in tailwind.config.ts), text=#fff7ed, muted=#fdba74 | Always dark (no theme toggle), orange-driven palette
- **Radius:** base 1rem (`--radius`), cards 1.5rem (`.card-luxe`), luxe panels 2.5–4rem, pills full
- **Spacing scale:** 4/8/12/16/24/32

## Accessibility
WCAG 2.2 AA, keyboard-first interactions, visible focus states, semantic HTML before ARIA, 44px+ touch targets, high-contrast-mode, legible-font-sizes, tap-feedback, screen-reader-optimized, reduced-motion

## Writing Tone
concise, confident, helpful, professional, data-driven, solution-focused, authoritative, non-intrusive, regional-aware

## Rules: Do
- prefer semantic tokens over raw values
- preserve visual hierarchy
- keep interaction states explicit
- design for empty/loading/error states
- ensure responsive behavior by default
- document accessibility rationale
- enforce-mobile-first-scaling
- prioritize-performance-first
- maintain-consistent-padding-rhythm

## Rules: Don't
- avoid low contrast text
- avoid inconsistent spacing rhythm
- avoid decorative motion without purpose
- avoid ambiguous labels
- avoid mixing multiple visual metaphors
- avoid inaccessible hit areas
- avoid-text-overflow-in-chat-bubbles
- avoid-input-focus-layout-shifts
- avoid-excessive-typography-styles


