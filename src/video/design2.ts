// OpenDesign 2.0 — video layer (1080×1920).
// Значения цветов/радиусов/теней — 1:1 из src/app/globals.css (--primary, --radius-*, --shadow-*).
// Масштаб пространства и кегля — под вертикальный кадр TikTok (1rem сайта ≈ 32px здесь).
export const od = {
  colors: {
    bg: "#f8fafc",
    fg: "#0f172a",
    muted: "#475569",
    muted2: "#64748b",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    card: "#ffffff",
    card2: "#f1f5f9",
    primary: "#ff8a00",
    primaryDeep: "#ea580c",
    primaryInk: "#c2410c",
    secondary: "#f59e0b",
    success: "#059669",
    successInk: "#047857",
    dark: "#0f172a",
    cream: "#FFF7ED",
    white: "#ffffff",
  },
  radius: {
    sm: 12,
    base: 24,
    card: 32,
    luxe: 48,
    pill: 999,
  },
  space: {
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    5: 40,
    6: 48,
    8: 64,
    10: 80,
    12: 96,
  },
  shadow: {
    sm: "0 2px 8px rgba(15,23,42,0.08)",
    md: "0 12px 40px -12px rgba(15,23,42,0.35)",
    lg: "0 24px 60px -18px rgba(15,23,42,0.45)",
    luxe: "0 30px 70px -24px rgba(234,88,12,0.45)",
  },
} as const;

// Типографика Sarabun. Thai никогда не трекается — tracking только на Latin kicker.
export const type = {
  display: 92,
  h1: 74,
  h2: 54,
  h3: 42,
  body: 32,
  label: 28,
  kicker: 23,
  stat: 76,
} as const;

export const weight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;
