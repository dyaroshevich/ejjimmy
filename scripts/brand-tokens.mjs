// Emit src/app/brand.generated.css from brand.json.
// usage: node scripts/brand-tokens.mjs [--check]
//
// Stage 2 of docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md. `globals.css` keeps the approved
// OpenDesign sheet's `:root`/`.dark` verbatim — `od-style-sync` compares that file rule-by-rule
// against the frozen mock, so deleting declarations there would read as drift. The generated file
// is imported AFTER globals and therefore wins on every brand token, which is what makes
// "change --primary in the config" true without touching CSS.
//
// `--check` writes nothing and exits 1 when the file on disk is stale (a gate for CI and for the
// stages that follow: if brand.json changed and nobody re-ran the generator, this catches it).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CONFIG = 'brand.json';
const LAYOUT = 'src/app/layout.tsx';
const OUT = join(ROOT, 'src/app/brand.generated.css');

const brand = JSON.parse(readFileSync(join(ROOT, CONFIG), 'utf8'));
const theme = brand.theme || {};
const colors = theme.colors || {};
const fonts = theme.fonts || {};

if (!colors.light || !colors.dark) {
  console.error(`${CONFIG}: theme.colors.light and theme.colors.dark are required`);
  process.exit(1);
}

// The faces themselves cannot be generated: next/font needs one static import per family, and it
// downloads/subsets them at build time. So brand.json names the pair and this checks layout.tsx
// actually loads it — otherwise a new brand's font would be a comment that lies. Mapping is by the
// next/font `variable` name: --font-text draws Latin/Cyrillic/Vietnamese, --font-thai draws Thai.
const layoutSrc = readFileSync(join(ROOT, LAYOUT), 'utf8');
const loaded = {};
for (const call of layoutSrc.matchAll(/const\s+\w+\s*=\s*(\w+)\(\{[\s\S]*?\}\)/g)) {
  const variable = call[0].match(/variable:\s*["']([^"']+)["']/);
  if (variable) loaded[variable[1].replace(/^--font-/, '')] = call[1];
}
const fontDrift = [];
for (const slot of ['text', 'thai']) {
  const wanted = fonts[slot];
  const actual = loaded[slot];
  if (!actual) fontDrift.push(`${LAYOUT}: no next/font call sets --font-${slot}`);
  else if (wanted && wanted !== actual) {
    fontDrift.push(`theme.fonts.${slot} is "${wanted}" but ${LAYOUT} loads ${actual} (--font-${slot})`);
  }
}
if (fontDrift.length) {
  console.error(`brand-tokens · font pair does not match the next/font calls:`);
  for (const line of fontDrift) console.error(`  ${line}`);
  console.error(`  Fix one side — the CSS stack resolves through --font-text/--font-thai, so the config is the name and ${LAYOUT} is the loader.`);
  process.exit(1);
}

/** primaryDeep -> --primary-deep, accentFg -> --accent-fg, muted2 -> --muted-2. */
const cssVar = (key) => `--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

const fallback = fonts.fallback || 'system-ui, sans-serif';
const stack = `var(--font-text), var(--font-thai), ${fallback}`;

const declarations = (map) =>
  Object.entries(map)
    .map(([key, value]) => `  ${cssVar(key)}: ${value};`)
    .join('\n');

const css = `/* ============================================================
   GENERATED FILE — do not edit by hand.
   Source: brand.json · writer: scripts/brand-tokens.mjs
   Regenerate: npm run brand:tokens
   Imported after globals.css on purpose: it overrides the approved sheet's brand tokens, so a new
   brand changes colour and type here and nowhere in CSS.
   ============================================================ */

:root {
  /* ----- Type pair -----
     The faces themselves are self-hosted by next/font in src/app/layout.tsx (${fonts.text} + ${fonts.thai},
     see brand.json theme.fonts): next/font needs a static call per face, so it cannot be generated.
     What is generated is the stack every component resolves through; scripts/brand-tokens.mjs fails
     when theme.fonts here and the next/font calls there disagree. */
  --font-body: ${stack};
  --font-display: ${stack};

  /* ----- Brand + public light ----- */
${declarations(colors.light)}
}

.dark {
${declarations(colors.dark)}
}
`;

const check = process.argv.includes('--check');
const previous = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';

if (check) {
  const stale = previous !== css;
  console.log(
    `brand-tokens · check · ${stale ? 'STALE — run npm run brand:tokens' : 'up to date'} (${Object.keys(colors.light).length} light / ${Object.keys(colors.dark).length} dark vars)`,
  );
  process.exit(stale ? 1 : 0);
}

writeFileSync(OUT, css);
console.log(
  `brand-tokens · wrote src/app/brand.generated.css · ${Object.keys(colors.light).length} light / ${Object.keys(colors.dark).length} dark vars · ${fonts.text || '?'} + ${fonts.thai || '?'}`,
);
