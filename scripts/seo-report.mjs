#!/usr/bin/env node
/**
 * Closes the SEO loop: a Google Search Console export goes in, `content/seo/performance.json`
 * comes out, and the run prints three candidate lists:
 *
 *   · pages with zero impressions        → rewrite the title (the page is not being shown)
 *   · pages with 2+ queries in the top 20 → cannibalisation, merge the pages
 *   · pages that slipped vs. the previous export → refresh the numbers on the page
 *
 * Nothing here touches the database, Supabase or a deploy. The only inputs are files on disk
 * and the only output is `content/seo/performance.json` (plus stdout).
 *
 * Usage:
 *   npm run seo:report                                  # looks in content/seo/gsc/
 *   npm run seo:report -- --input path/to/export.csv     # one file
 *   npm run seo:report -- --input path/to/folder         # every *.csv / *.json in it
 *   npm run seo:report -- --previous content/seo/performance.json
 *
 * Accepted inputs:
 *   · JSON: { pages: [ { url, clicks, impressions, ctr?, position?, queries? } ] }
 *          or a bare array of such pages, or { rows: [...] }.
 *   · CSV "Pages" export: columns url/page + clicks/impressions/ctr/position.
 *   · CSV "Queries" export: columns query + (url/page) + clicks/impressions/position.
 *   · A folder holding any mix of the above; pages and queries are merged by URL.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

import { parseCsv, readBriefs } from './lib/briefs.mjs';

const DEFAULT_OUT = 'content/seo/performance.json';
const DEFAULT_INPUT_DIRS = ['content/seo/gsc'];

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const has = (name) => args.includes(name);

const inputArg = flag('--input');
const outPath = flag('--out') || DEFAULT_OUT;
const previousArg = flag('--previous');
const topN = Number(flag('--top') || 20);
const dropPosition = Number(flag('--drop-position') || 2);
const dropClicks = Number(flag('--drop-clicks') || 0.3);

/* ---------------------------------------------------------------- number parsing */

const num = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const cleaned = String(value).replace(/[%\s]/g, '').replace(/,/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const pct = (value) => {
  // GSC sometimes prints "1,2%" and sometimes "0.012".
  const n = num(value);
  return n > 1 ? n / 100 : n;
};

/* ---------------------------------------------------------------- url → slug */

const slugFromUrl = (url) => {
  if (!url) return '';
  let path = String(url).trim();
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
  } catch {
    /* keep as-is */
  }
  path = path.split('?')[0].split('#')[0];
  // strip a leading locale segment so /th/foo and /foo land on the same slug
  const locale = path.match(/^\/([a-z]{2})(\/.*)?$/);
  if (locale && ['th', 'en', 'ru', 'zh', 'de', 'fr', 'ja', 'ko'].includes(locale[1])) {
    path = locale[2] || '/';
  }
  path = path.replace(/\/+$/, '');
  return path === '' || path === '/' ? '' : path.replace(/^\//, '');
};

/* ---------------------------------------------------------------- csv classification */

const headerOf = (rows) => (rows[0] || []).map((cell) => String(cell).trim().toLowerCase());

const findCol = (header, candidates) => {
  for (const candidate of candidates) {
    const idx = header.findIndex((h) => h === candidate || h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
};

const parsePagesCsv = (text) => {
  const rows = parseCsv(text).filter((row) => row.length > 1);
  if (rows.length < 2) return { pages: [], queries: [] };
  const header = headerOf(rows);
  const urlIdx = findCol(header, ['page', 'url', 'landing page', 'top pages']);
  const clicksIdx = findCol(header, ['clicks']);
  const imprIdx = findCol(header, ['impressions']);
  const ctrIdx = findCol(header, ['ctr']);
  const posIdx = findCol(header, ['position', 'avg. position', 'average position']);
  const pages = [];
  for (const row of rows.slice(1)) {
    const url = urlIdx === -1 ? '' : row[urlIdx];
    if (!url) continue;
    pages.push({
      url: String(url).trim(),
      clicks: clicksIdx === -1 ? 0 : num(row[clicksIdx]),
      impressions: imprIdx === -1 ? 0 : num(row[imprIdx]),
      ctr: ctrIdx === -1 ? null : pct(row[ctrIdx]),
      position: posIdx === -1 ? null : num(row[posIdx]),
      queries: [],
    });
  }
  return { pages, queries: [] };
};

const parseQueriesCsv = (text) => {
  const rows = parseCsv(text).filter((row) => row.length > 1);
  if (rows.length < 2) return { pages: [], queries: [] };
  const header = headerOf(rows);
  const queryIdx = findCol(header, ['query', 'search query', 'keyword']);
  const urlIdx = findCol(header, ['page', 'url', 'landing page']);
  const clicksIdx = findCol(header, ['clicks']);
  const imprIdx = findCol(header, ['impressions']);
  const posIdx = findCol(header, ['position', 'avg. position', 'average position']);
  const queries = [];
  for (const row of rows.slice(1)) {
    const q = queryIdx === -1 ? '' : String(row[queryIdx] || '').trim();
    if (!q) continue;
    queries.push({
      query: q,
      url: urlIdx === -1 ? '' : String(row[urlIdx] || '').trim(),
      clicks: clicksIdx === -1 ? 0 : num(row[clicksIdx]),
      impressions: imprIdx === -1 ? 0 : num(row[imprIdx]),
      position: posIdx === -1 ? null : num(row[posIdx]),
    });
  }
  return { pages: [], queries };
};

/* ---------------------------------------------------------------- collect input files */

const collectFiles = (target) => {
  const out = [];
  if (!target) return out;
  const full = resolve(target);
  if (!existsSync(full)) return out;
  const stat = statSync(full);
  if (stat.isFile()) {
    out.push(full);
    return out;
  }
  if (stat.isDirectory()) {
    for (const name of readdirSync(full)) {
      const p = join(full, name);
      if (!statSync(p).isFile()) continue;
      const ext = extname(name).toLowerCase();
      if (ext === '.csv' || ext === '.json') out.push(p);
    }
  }
  return out;
};

const defaultInputFiles = () => {
  for (const dir of DEFAULT_INPUT_DIRS) {
    const files = collectFiles(dir);
    if (files.length) return files;
  }
  return [];
};

/* ---------------------------------------------------------------- merge into pages */

const mergeInto = (pageMap, pages, queries) => {
  for (const p of pages) {
    const slug = slugFromUrl(p.url);
    const key = p.url || slug || `page-${pageMap.size}`;
    if (!pageMap.has(key)) {
      pageMap.set(key, {
        url: p.url || '',
        slug,
        clicks: 0,
        impressions: 0,
        ctr: p.ctr != null ? p.ctr : null,
        position: p.position != null ? p.position : null,
        queries: [],
      });
    }
    const entry = pageMap.get(key);
    entry.clicks += p.clicks || 0;
    entry.impressions += p.impressions || 0;
    if (p.ctr != null && entry.ctr == null) entry.ctr = p.ctr;
    if (p.position != null && entry.position == null) entry.position = p.position;
  }

  // attach queries
  for (const q of queries) {
    const slug = slugFromUrl(q.url);
    const key = q.url || slug;
    if (!key) continue;
    if (!pageMap.has(key)) {
      pageMap.set(key, {
        url: q.url || '',
        slug,
        clicks: 0,
        impressions: 0,
        ctr: null,
        position: null,
        queries: [],
      });
    }
    const entry = pageMap.get(key);
    entry.queries.push({
      query: q.query,
      clicks: q.clicks || 0,
      impressions: q.impressions || 0,
      position: q.position != null ? q.position : null,
    });
  }

  // recompute totals from queries when the page row had none
  for (const entry of pageMap.values()) {
    if (entry.clicks === 0 && entry.queries.length) {
      entry.clicks = entry.queries.reduce((s, q) => s + q.clicks, 0);
    }
    if (entry.impressions === 0 && entry.queries.length) {
      entry.impressions = entry.queries.reduce((s, q) => s + q.impressions, 0);
    }
    if (entry.ctr == null && entry.impressions > 0) {
      entry.ctr = entry.clicks / entry.impressions;
    }
    if (entry.position == null && entry.queries.length) {
      const weighted = entry.queries.reduce((s, q) => s + (q.position || 0) * q.impressions, 0);
      const impr = entry.queries.reduce((s, q) => s + q.impressions, 0);
      entry.position = impr > 0 ? weighted / impr : null;
    }
  }
};

/* ---------------------------------------------------------------- main */

const inputFiles = inputArg ? collectFiles(inputArg) : defaultInputFiles();

if (inputFiles.length === 0) {
  console.log('seo-report · no input found.');
  console.log('  pass --input <file-or-folder>, or drop a GSC export into content/seo/gsc/');
  console.log('  accepted: *.json (pages/rows array) and *.csv (Pages or Queries export)');
  process.exit(1);
}

const pageMap = new Map();
let previous = null;
if (previousArg && existsSync(previousArg)) {
  try {
    previous = JSON.parse(readFileSync(previousArg, 'utf8'));
  } catch {
    previous = null;
  }
} else if (existsSync(outPath)) {
  try {
    previous = JSON.parse(readFileSync(outPath, 'utf8'));
  } catch {
    previous = null;
  }
}

const previousBySlug = new Map();
if (previous && Array.isArray(previous.pages)) {
  for (const p of previous.pages) previousBySlug.set(p.slug || slugFromUrl(p.url), p);
}

for (const file of inputFiles) {
  const ext = extname(file).toLowerCase();
  const text = readFileSync(file, 'utf8');
  if (ext === '.json') {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log(`  · skipped (bad JSON): ${file}`);
      continue;
    }
    const pages = Array.isArray(data)
      ? data
      : Array.isArray(data.pages)
        ? data.pages
        : Array.isArray(data.rows)
          ? data.rows
          : [];
    const queries = Array.isArray(data.queries) ? data.queries : [];
    mergeInto(pageMap, pages, queries);
  } else {
    // try queries first (has a query column), else pages
    const rows = parseCsv(text);
    const header = headerOf(rows);
    const hasQuery = header.some((h) => h.includes('query'));
    if (hasQuery) {
      const { queries } = parseQueriesCsv(text);
      mergeInto(pageMap, [], queries);
    } else {
      const { pages } = parsePagesCsv(text);
      mergeInto(pageMap, pages, []);
    }
  }
  console.log(`  read ${basename(file)}`);
}

/* ---------------------------------------------------------------- briefs */

const { briefs } = existsSync('content/seo/briefs.csv') ? readBriefs() : { briefs: [] };
const briefBySlug = new Map(briefs.filter((b) => b.built_slug).map((b) => [b.built_slug, b]));

/* ---------------------------------------------------------------- candidates */

const previousPeriod = previous && previous.period ? previous.period : null;

const pages = [...pageMap.values()].map((entry) => {
  const slug = entry.slug || slugFromUrl(entry.url);
  const brief = briefBySlug.get(slug);
  const topQueries = entry.queries
    .filter((q) => q.position != null && q.position <= topN)
    .sort((a, b) => (b.impressions || 0) - (a.impressions || 0));
  const candidates = [];
  const reasons = [];

  // 1. no impressions → rewrite title
  if ((entry.impressions || 0) === 0) {
    candidates.push('rewrite-title');
    reasons.push('zero impressions — the page is not being shown');
  }

  // 2. 2+ queries in top N → cannibalisation
  if (topQueries.length >= 2) {
    candidates.push('cannibalization');
    reasons.push(`${topQueries.length} queries in the top ${topN} — merge or split`);
  }

  // 3. slipped vs previous export → refresh numbers
  const prev = previousBySlug.get(slug);
  if (prev) {
    const prevPos = prev.position != null ? prev.position : null;
    const currPos = entry.position != null ? entry.position : null;
    const prevClicks = prev.clicks || 0;
    const currClicks = entry.clicks || 0;
    let slipped = false;
    if (prevPos != null && currPos != null && currPos - prevPos >= dropPosition) slipped = true;
    if (prevClicks > 0 && currClicks / prevClicks <= 1 - dropClicks) slipped = true;
    if (slipped) {
      candidates.push('refresh-numbers');
      const bits = [];
      if (prevPos != null && currPos != null) bits.push(`position ${prevPos.toFixed(1)} → ${currPos.toFixed(1)}`);
      if (prevClicks > 0) bits.push(`clicks ${prevClicks} → ${currClicks}`);
      reasons.push(`slipped vs previous export (${bits.join(', ')})`);
    }
  } else if (entry.position != null && entry.position > 20 && (entry.impressions || 0) > 0) {
    // no history available: flag deep pages as a soft candidate
    candidates.push('refresh-numbers');
    reasons.push(`position ${entry.position.toFixed(1)} — outside the top 20 (no previous export to compare)`);
  }

  return {
    slug,
    url: entry.url,
    brief: brief ? brief.page_id : null,
    clicks: entry.clicks || 0,
    impressions: entry.impressions || 0,
    ctr: entry.ctr != null ? Number(entry.ctr.toFixed(4)) : null,
    position: entry.position != null ? Number(entry.position.toFixed(2)) : null,
    topQueries: topQueries.slice(0, 10),
    candidates,
    reasons,
  };
});

pages.sort((a, b) => (b.impressions || 0) - (a.impressions || 0));

const candidates = {
  'rewrite-title': pages.filter((p) => p.candidates.includes('rewrite-title')).map((p) => p.slug || p.url),
  cannibalization: pages.filter((p) => p.candidates.includes('cannibalization')).map((p) => p.slug || p.url),
  'refresh-numbers': pages.filter((p) => p.candidates.includes('refresh-numbers')).map((p) => p.slug || p.url),
};

const orphans = pages.filter((p) => !p.brief).map((p) => p.slug || p.url);

const report = {
  generatedAt: new Date().toISOString(),
  period: previousPeriod,
  source: inputFiles.map((f) => basename(f)),
  pageCount: pages.length,
  totals: {
    clicks: pages.reduce((s, p) => s + p.clicks, 0),
    impressions: pages.reduce((s, p) => s + p.impressions, 0),
  },
  candidates,
  orphans,
  pages: pages,
};

// ---------------------------------------------------------------- write

mkdirSync('content/seo', { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

/* ---------------------------------------------------------------- print */

console.log(`seo-report · ${pages.length} page(s) · ${report.totals.clicks} clicks · ${report.totals.impressions} impressions`);
console.log(`  source: ${inputFiles.map((f) => basename(f)).join(', ')}`);
console.log(`  output: ${outPath}`);

const printList = (label, list) => {
  console.log(`\n${label}: ${list.length}`);
  for (const item of list) console.log(`  · ${item}`);
};

printList('rewrite title (zero impressions)', candidates['rewrite-title']);
printList('cannibalization (2+ queries in top ' + topN + ')', candidates.cannibalization);
printList('refresh numbers (slipped)', candidates['refresh-numbers']);

if (orphans.length) {
  console.log(`\norphans — pages in the export with no brief: ${orphans.join(', ')}`);
}

if (!previousBySlug.size) {
  console.log('\nnote: no previous export found — "refresh numbers" only flags pages outside the top 20.');
  console.log('      pass --previous <file> (or keep the last run as ' + outPath + ') to enable slip detection.');
}

console.log('\nGATE - seo:report written: 0 (must be 0)');
process.exit(0);
