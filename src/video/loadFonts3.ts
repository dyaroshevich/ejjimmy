import { loadFont as loadK2D } from "@remotion/google-fonts/K2D";
import { loadFont as loadNotoSansThai } from "@remotion/google-fonts/NotoSansThai";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

// Дизайн-система 2.0: стек K2D × Noto Sans Thai × JetBrains Mono.
// K2D рисует Latin + цифры (weights 400–800), Thai падает в Noto Sans Thai,
// мелкие цифры/атрибуты — JetBrains Mono 600.
const k2d = loadK2D("normal", {
  subsets: ["latin", "latin-ext"],
  weights: ["400", "500", "600", "700", "800"],
});

const thai = loadNotoSansThai("normal", {
  subsets: ["thai", "latin"],
  weights: ["400", "500", "600", "700"],
});

const mono = loadJetBrainsMono("normal", {
  subsets: ["latin"],
  weights: ["400", "600"],
});

/** Стек display/body: Latin → K2D, Thai → Noto Sans Thai (без стрибка метрики). */
export const DS2_FAMILY = `${k2d.fontFamily}, ${thai.fontFamily}, system-ui, sans-serif`;

/** Моно-токен для мелких цифр/атрибутов. */
export const DS2_MONO = `${mono.fontFamily}, monospace`;
