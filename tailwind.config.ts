import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-text)", "var(--font-thai)", "system-ui", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        lime: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
          950: "#1a2e05",
        },
        orangeNoir: {
          DEFAULT: "#1a0e00",
          bg: "#1a0e00",
          sidebar: "#2d1a04",
          card: "#3d260a",
          cardHover: "#543612",
          text: "#fff7ed",
          textMuted: "#fdba74",
          accent: "#ff8a00",
          border: "#5c3a0e",
          input: "#3d260a",
        },
        orangeLight: {
          DEFAULT: "#fff7ed",
          bg: "#f8fafc",
          sidebar: "#ffffff",
          card: "#ffffff",
          text: "#0f172a",
          textMuted: "#64748b",
          accent: "#ff8a00",
          border: "#f1f5f9",
          input: "#f8fafc",
        },
        brand: {
          primary: "#ff8a00",
          "primary-deep": "#ea580c",
          success: "#059669",
          "admin-bg": "#1a0e00",
        },
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};
export default config;
