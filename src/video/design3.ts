// Дизайн-система evkrabi 2.0 — видео-слой (1080×1920).
// Источник правды: K:\code\evkrabi\design-system\design 2.0\release\DESIGN.md (v4.2).
// Правила, которые переносим на кадр: lime = действие (CTA/прогресс/цифры),
// cyan = навигация/подсветка и ВСЕГДА бейджи; градиент — только декоративные
// полосы, НЕ кнопки; третий яркий цвет запрещён; Thai не трекается.
// Масштаб под вертикальный кадр TikTok (1rem сайта ≈ 32px здесь).
export const ds = {
  colors: {
    lime: "#B7FF41",
    lime200: "#C5FF67",
    lime600: "#49661A",
    lime700: "#25330D",
    limeDark: "#D6FF2A",
    cyan: "#1BE1FB",
    cyan700: "#0B5A64",
    paper: "#F7F6F3",
    card: "#FFFFFF",
    sunken: "#ECEEE2",
    ink: "#121A07",
    night: "#0A0F0A",
    cardDark: "#1E2616",
    green: "#16A34A",
    white: "#FFFFFF",
  },
  radius: {
    sm: 24,
    base: 40, // 14px сайта ≈ 40px в кадре
    squash: 56, // squircle 20px ≈ 56px в кадре
    luxury: 72,
    pill: 999,
  },
  space: {
    1: 16,
    2: 24,
    3: 32,
    4: 48,
    5: 64,
    8: 96,
  },
  shadow: {
    soft: "0 18px 64px -24px rgba(18,26,7,0.35)",
    pop: "0 16px 48px -16px rgba(183,255,65,0.55)",
    night: "0 24px 70px -20px rgba(10,15,10,0.65)",
  },
  grad: "linear-gradient(135deg, #B7FF41, #1BE1FB)", // только декоративные полосы
} as const;

// Типографика: K2D (display/цифры) × Noto Sans Thai (Thai-текст) × JetBrains Mono (мелкие цифры).
// Стек единый: Latin рисует K2D, Thai падает в Noto Sans Thai — как на сайте.
export const type = {
  display: 92,
  h1: 74,
  h2: 54,
  h3: 42,
  body: 32,
  label: 28,
  kicker: 23,
  stat: 76,
  mono: 24,
} as const;

export const weight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  price: 800, // единственный 800 — цифры/цены, tabular-nums
} as const;
