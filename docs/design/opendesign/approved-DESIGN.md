# Tawan Power — Design System

Solar installer · Krabi, Thailand · Trilingual TH / RU / EN.
Tone: concise, confident, helpful, regional-aware.
File contract: `tokens.css` is the single source of truth. This doc explains usage.

## 1. Themes

| Scope | Selector | bg | surface/card | text | muted | border |
|---|---|---|---|---|---|---|
| Public light (default) | `:root` | `#f8fafc` | `#ffffff` | `#0f172a` | `#475569` | `#e2e8f0` |
| Public dark | `.dark` | `#020617` (slate-950) | `#0f172a` | `#f8fafc` | `#94a3b8` | `#1e293b` |
| Admin (always dark) | `.admin` / `[data-theme="admin"]` | `#1a0e00` | card `#3d260a` | `#fff7ed` | `#fdba74` | `#5c3a0e` |

Admin sidebar: `#2d1a04`. Admin never renders light — lock the scope on `<body class="admin">` or a wrapping section.

## 2. Brand color — exact production values

```css
--primary: #ff8a00;  --primary-deep: #ea580c;
--secondary: #f59e0b; --success: #059669;
--warning: #f59e0b;   --danger: #ef4444;
--surface: #ffffff;   --text: #0f172a;
```

Rules (Fitts / Nielsen heuristics — one decisive action per viewport):

- One accent (`--primary`) max twice per screen. Primary CTA is solid `--primary` with `#0f172a` text on light; hover goes `--primary-deep` + `#fff7ed` (contrast rises, never falls).
- Secondary / ghost entries are outline or text links, never a second solid button for the same action.
- Status: success/warning/danger only for state, never decoration. Pair each with its `-bg` tint token.
- Admin success text uses `#34d399` (AA on `#3d260a`); light keeps `#059669`.

Contrast (WCAG 2.2 AA, verified pairs):

- `#0f172a` on `#ffffff` / `#f8fafc` — 15+:1. `#0f172a` on `#ff8a00` — ~8:1.
- `#fff7ed` on `#1a0e00` / `#3d260a` — 14+:1. `#fdba74` on `#1a0e00` — ~9:1 (body-large / muted only, never small body).
- `#475569` on `#ffffff` — 7:1. `#ea580c` body text on white — use bold ≥18px or pair with dark text; default CTA keeps dark text on orange.

## 3. Typography — multilingual, verified

```css
--font-body / --font-display: "Sarabun", "Noto Sans", "Noto Sans Thai", system-ui;
```

- **Sarabun** carries Latin + Thai. **Noto Sans** is the Cyrillic (U+0400–U+04FF) donor. **Noto Sans Thai** is the Thai fallback.
- Weights: 400 / 500 / 600 / 700 / 800, plus donor **900** for display black (`.display--black`). Thai display caps at 700–800 (Thai glyphs have no true 900).
- Leading: headings 1.15, body 1.6, Thai 1.8 (`:lang(th)`).

HARD RULES (enforced in `tokens.css`):

1. Thai text is **never letter-spaced**: `:lang(th){letter-spacing:0}`.
2. Uppercase kickers are **Latin/Cyrillic only**. `.kicker:lang(th)` resets to none + zero tracking.
3. Every Thai string carries `lang="th"` (also `lang="ru"` / `lang="en"` on siblings for correct shaping + AT pronunciation).

Atoms → Molecules: `kicker` + `display` + body = hero molecule; never set Thai in `.display--black`.

## 4. Radius · Spacing · Elevation

```css
--radius-base: 1rem;  --radius-card: 1.5rem;
--radius-luxe: 2.5rem; --radius-luxe-lg: 4rem; --radius-pill: 999px;
--sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-6:24px; --sp-8:32px;
```

- Buttons/inputs: `1rem`. Cards: `1.5rem`. Luxe panels (quote, hero, offer): `2.5–4rem`. Pills: badges, filters.
- Spacing composes in 4/8/12/16/24/32 only — no arbitrary margins (Variables/Tokens discipline).
- Shadows: `--shadow-sm` cards, `--shadow-md` popovers, `--shadow-luxe` orange-glow hero/offer panels.

## 5. shadcn/ui base components (Atoms)

`.btn` (variants `--primary --secondary --ghost --danger`, sizes default 48px / `--sm` 44px, `--pill`), `.card` / `.card--luxe`, `.badge` (`--primary --success --warning --danger`), `.input` + `.field label`. All min targets **44px** (WCAG 2.5.8 + Fitts). Every focusable element: 3px `--ring` `:focus-visible`.

## 6. Accessibility (WCAG 2.1 AA + 2.2 2.5.8)

- Contrast: body ≥ 4.5:1, large/icons ≥ 3:1. Hover states move background lightness ±0.06–0.12, never dim foreground to `--muted`.
- Targets ≥ 44px; keyboard order = visual order; visible focus ring always.
- `prefers-reduced-motion: reduce` kills transitions/animations in `tokens.css`.
- Thai: no truncation mid-word, no `white-space:nowrap` on Thai buttons; allow wrap.

## 7. Usage

```html
<link rel="stylesheet" href="tokens.css">
<body> <!-- public light -->
<body class="dark"> <!-- public dark -->
<body class="admin"> <!-- admin always-dark -->
<p lang="th">ติดตั้งโซลาร์เซลล์ในกระบี่</p>
<p lang="ru">Солнечные панели в Краби</p>
<p lang="en">Solar installation in Krabi</p>
```

Do not invent new palette values. Derive tints with `oklch()` / `color-mix()` from the tokens above.
