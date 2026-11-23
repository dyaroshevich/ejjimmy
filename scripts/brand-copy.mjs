// Keep the brand and the city out of the copy pack.
// usage: node scripts/brand-copy.mjs --write   (convert messages/*.json)
//        node scripts/brand-copy.mjs --check    (gate: exit 1 when a locale still spells them out)
//
// Stage 3 of docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md. `messages/*.json` write the name as
// `{brand}` and the city as `{city}`; `src/lib/brand-copy.ts` fills both from `brand.json` once per
// request, before next-intl formats anything. A new brand is then a config edit, not eight files ×
// 56 sentences.
//
// Two rules come from the copy itself, not from taste:
//   · case — one collage caption sets the name in caps (`TAWAN POWER`), so an all-caps hit becomes
//     `{BRAND}` and the resolver upper-cases the value. The rendered pixels do not move.
//   · Thai inside another locale — ja/ko/zh still carry Thai in `line.*` and `ai.*`. Those are
//     untranslated source sentences, not city references, so the city stays Thai there (the brand
//     is Latin, so it is replaced and renders identically).
//
// The name `{brand}` was already taken: `products.askBrand` and `caseDetail.hwPanelDesc` pass a
// PANEL brand (Huawei, Jinko) under that argument. Filling it from the site brand at load would have
// printed "Tawan Power {model}" instead of "Huawei M6", so the argument was renamed `{productBrand}`
// in all 8 locales and at its two call sites — `{brand}` / `{city}` now mean the site, only.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIR = join(ROOT, 'messages');
const site = JSON.parse(readFileSync(join(ROOT, 'brand.json'), 'utf8'));
const brand = site.brand;

/**
 * Spellings a locale's copy used before the name moved into `brand.json`. Normalised on the way in
 * so one locale has one spelling: Korean carried both 끄라비 (header) and 크라비 (25 keys), Japanese
 * carried クラビ and «Krabi» in the admin/content strings.
 */
const CITY_ALIASES = { ja: ['Krabi'], ko: ['끄라비'] };

const THAI = /[\u0E00-\u0E7F]/;
const BRAND_TOKEN = /\{(brand|city)\}/gi;

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isUpper = (value) => value !== value.toLowerCase() && value === value.toUpperCase();
const token = (key, hit) => (isUpper(hit) ? `{${key.toUpperCase()}}` : `{${key}}`);
const cityFor = (locale) => brand.cityNames[locale] ?? brand.city;

function convert(value, locale) {
  let out = value.replace(/\btawan\s*power\b/gi, (hit) => token('brand', hit));
  if (locale === 'th' || !THAI.test(value)) {
    const names = [...new Set([cityFor(locale), ...(CITY_ALIASES[locale] ?? [])])]
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    if (names.length) {
      const re = new RegExp(names.map(escapeRe).join('|'), 'g');
      out = out.replace(re, (hit) => token('city', hit));
    }
  }
  return out;
}

/** What a visitor reads once the placeholders are filled — used to prove the copy did not change. */
function fill(value, locale) {
  const values = { brand: brand.name, city: cityFor(locale) };
  return value.replace(BRAND_TOKEN, (_match, key) => {
    const resolved = values[key.toLowerCase()];
    return isUpper(key) ? resolved.toUpperCase() : resolved;
  });
}

function walk(node, locale, path = '', report = { changed: [], moved: [] }) {
  if (typeof node === 'string') {
    const next = convert(node, locale);
    if (next !== node) {
      report.changed.push(path);
      if (fill(next, locale) !== node) report.moved.push({ path, from: node, to: fill(next, locale) });
    }
    return next;
  }
  if (Array.isArray(node)) return node.map((item, i) => walk(item, locale, `${path}[${i}]`, report));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] = walk(value, locale, path ? `${path}.${key}` : key, report);
    }
    return out;
  }
  return node;
}

const write = process.argv.includes('--write');
const locales = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const stale = [];
let changedKeys = 0;
const movedKeys = [];

for (const file of locales) {
  const locale = file.replace(/\.json$/, '');
  const raw = readFileSync(join(DIR, file), 'utf8');
  const report = { changed: [], moved: [] };
  const tree = walk(JSON.parse(raw), locale, '', report);

  // Keep the file's own formatting: indent width, EOL and trailing newline.
  const indent = raw.match(/\n( +)"/)?.[1] ?? '  ';
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const rendered = JSON.stringify(tree, null, indent).split('\n').join(eol) + (raw.endsWith('\n') ? eol : '');

  changedKeys += report.changed.length;
  for (const m of report.moved) movedKeys.push({ locale, ...m });

  if (rendered !== raw) {
    stale.push({ locale, count: report.changed.length });
    if (write) writeFileSync(join(DIR, file), rendered);
  }
}

const total = stale.reduce((n, s) => n + s.count, 0);
if (write) {
  console.log(
    `brand-copy · wrote ${stale.length} file(s) · ${total} strings now hold {brand} / {city} · ${movedKeys.length} of them read differently`,
  );
} else {
  console.log(
    total
      ? `brand-copy · check · ${total} strings across ${stale.length} locale file(s) still spell the brand or the city — run npm run brand:copy`
      : `brand-copy · check · ${locales.length} locales · 0 literals left`,
  );
  for (const s of stale) console.log(`  ${s.locale.padEnd(6)} ${s.count} string(s)`);
}

// The honest part of the measurement: a conversion that changes what a visitor reads is a copy
// edit, so it is printed, never silent. Expected after the first run: the two Korean and four
// Japanese sentences that used a second spelling of the city, all normalised to brand.json's name.
if (movedKeys.length) {
  console.log(`  copy changes (${movedKeys.length}) — same meaning, normalised spelling:`);
  for (const m of movedKeys) {
    console.log(`    ${m.locale} ${m.path}`);
    console.log(`      was: ${m.from.slice(0, 90)}`);
    console.log(`      now: ${m.to.slice(0, 90)}`);
  }
}

process.exit(!write && total ? 1 : 0);
