/**
 * The brief file, read the same way by every script that touches it.
 *
 * `scripts/seo-plan.mjs` validates the briefs and `scripts/seo-qa.mjs` measures pages against them;
 * two readers would drift the moment one of them learned about a BOM or a quoted comma the other did
 * not, and a QA tool that quietly mis-parses a keyword is worse than no tool.
 */

import { readFileSync } from 'node:fs';

export const BRIEFS = 'content/seo/briefs.csv';

/** The eight locales the site ships. A brief's `lang` is one of these. */
export const LOCALES = ['th', 'en', 'ru', 'zh', 'de', 'fr', 'ja', 'ko'];

/**
 * Which scripts a locale writes in. A brief's copy field is only usable in a page when it is in one of
 * these: the research wrote 21 of the 24 Thai H1s in Russian, and copying one into a Thai page would be
 * the most expensive kind of silent mistake.
 */
export const SCRIPTS = {
  th: ['thai'],
  en: ['latin'],
  de: ['latin'],
  fr: ['latin'],
  ru: ['cyrillic'],
  zh: ['han'],
  ja: ['han', 'kana'],
  ko: ['hangul'],
};

/** `/th/solar-5kw-krabi` → `solar-5kw-krabi`; `/th/` → `` (the landing, not a content page). */
export function slugOf(urlSlug) {
  let path = String(urlSlug).trim().replace(/\/+$/, '');
  const locale = path.match(/^\/([a-z]{2})(\/.*)?$/);
  if (locale && LOCALES.includes(locale[1])) path = locale[2] || '/';
  return path === '/' || path === '' ? '' : path.replace(/^\//, '');
}

/** The script a string is mostly written in, by codepoint ranges. */
export function scriptOf(value) {
  const counts = {
    thai: (String(value).match(/[\u0E00-\u0E7F]/g) || []).length,
    cyrillic: (String(value).match(/[\u0400-\u04FF]/g) || []).length,
    han: (String(value).match(/[\u4E00-\u9FFF\u3400-\u4DBF]/g) || []).length,
    kana: (String(value).match(/[\u3040-\u30FF]/g) || []).length,
    hangul: (String(value).match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length,
    latin: (String(value).match(/[A-Za-z]/g) || []).length,
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] === 0 ? 'none' : best[0];
}

/** Is this field usable as copy in a page of that locale? */
export function inLanguage(value, lang) {
  const allowed = SCRIPTS[lang] ?? ['latin'];
  return allowed.includes(scriptOf(value));
}

/** Page ids in an `internal_links` cell, with `SEO-16…19` expanded into 16, 17, 18, 19. */
export function refs(cell) {
  const expanded = String(cell).replace(/SEO-(\d{2})\s*[…–—-]\s*(\d{2})/g, (_, a, b) => {
    const from = Number(a);
    const to = Number(b);
    return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) =>
      `SEO-${String(from + i).padStart(2, '0')}`,
    ).join(' ');
  });
  return [...new Set(expanded.match(/SEO-\d{2}/g) ?? [])];
}

/** RFC4180: quoted fields, "" escapes, embedded commas and newlines, CRLF or LF, optional BOM. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const body = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quoted) {
      if (c === '"') {
        if (body[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * `{ header, table, briefs }` — `table` keeps the raw cells (so a caller can check row width),
 * `briefs` is the same rows keyed by column name.
 */
export function readBriefs(file = BRIEFS) {
  const table = parseCsv(readFileSync(file, 'utf8')).filter((row) => row.length > 1);
  const header = table[0] ?? [];
  const briefs = table.slice(1).map((cells) => Object.fromEntries(header.map((key, i) => [key, cells[i] ?? ''])));
  return { header, table, briefs };
}
