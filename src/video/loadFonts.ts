import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import { loadFont as loadSarabun } from "@remotion/google-fonts/Sarabun";

const { fontFamily } = loadKanit();

export const FONT_FAMILY = fontFamily;

// OpenDesign 2.0: Sarabun (Thai + Latin) — гарнитура сайта.
const sarabun = loadSarabun("normal", {
  subsets: ["thai", "latin"],
  weights: ["400", "500", "600", "700", "800"],
});

export const SARA_FAMILY = sarabun.fontFamily;
