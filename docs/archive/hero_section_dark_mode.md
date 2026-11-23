# Plan: Dark Mode Integration - Hero Section

## Objective
Apply dark mode styles to the Hero section of the landing page (`src/app/page.tsx`).

## Changes
1.  **Section Container**: Add `dark:bg-slate-950` and `dark:border-slate-800`.
2.  **Text Content**: Update text colors to `dark:text-white` for headers and `dark:text-slate-300` for body text.
3.  **Badge**: Update badge colors to `dark:bg-emerald-900/20`, `dark:text-emerald-400`, and `dark:border-emerald-800`.

## Verification
1. Run `npm run build` to ensure no syntax errors.
2. Deploy to production via `vercel --prod --yes`.
3. Visually verify the Hero section in dark mode.
