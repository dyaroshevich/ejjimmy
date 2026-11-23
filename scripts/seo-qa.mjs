#!/usr/bin/env node
/**
 * Reads the twelve pages the way a crawler and a reader do, and says where they disagree with the briefs.
 *
 * `npm run seo:check` proves the pages exist, are registered and are in the sitemap; it says nothing about
 * what is inside them. `npm run seo:plan` proves the briefs are consistent; it says nothing about whether a
 * page kept the promise of its brief. This is the instrument for the page itself:
 *
 *   node scripts/seo-qa.mjs            # well-formedness is the gate; brief fidelity is printed
 *   node scripts/seo-qa.mjs --strict   # brief fidelity is the gate too (exits 1 on any gap)
 *
 * Two kinds of finding, on purpose:
 *
 *   · **errors** — breakage that is never a judgement call: a page with no `h1` at all, two `h1`s in one
 *     scope (a `section lang` is a scope, which is why `checklist` legitimately carries three, one per
 *     language), an empty `title`/`description`, markdown left in the meta text (it renders literally in
 *     `<title>`), a `{placeholder}` the resolver does not know, two pages sharing a `title` or an `h1`,
 *     and a `[label](href)` whose internal path resolves to no route and no page.
 *   · **gaps** — the page against its own brief: `title` over 60 characters, `description` over 160 or
 *     under 60, an `h1` missing a word of the `primary_keyword`, body copy under `0.8 × word_target`.
 *     Printed on every run, fatal only under `--strict`.
 *
 * Why the second kind is not fatal by default: the briefs were generated from research estimates
 * (`word_target` says so itself: "n/a, оценка по косвенным признакам"), and the pages were written as
 * condensed Thai articles. Nine of the ten matched pages sit between 0.34 and 0.91 of their target. A gate
 * that is red on content nobody agreed to rewrite is a gate people learn to skip — so the number is on
 * screen every run and the decision stays where it belongs.
 *
 * Two measurements are deliberately not naive. `description` has a ceiling (160) and a thin floor (60),
 * not the plan's 120–160 band: Thai characters are wide, a 90-character Thai description already fills the
 * snippet, so enforcing the Latin floor would pad copy to be truncated. And word count runs through
 * `Intl.Segmenter` with the page's own language, because Thai is written without spaces and a
 * whitespace count would call a 600-word page 150 words.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

import { readBriefs } from './lib/briefs.mjs';

const DIR = 'content/pages';
const APP = 'src/app';
const BRAND = 'brand.json';
const SITE_CONFIG = 'src/lib/site.config.ts';

/** Title tags truncate around 580 px; 60 Latin characters is the usual working ceiling. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 60;
const VOLUME_FLOOR = 0.8;

/** Marks are `**bold**`, `_italic_`, `` `code` `` — presentation, not text. */
const stripMarks = (value) => String(value).replace(/\*\*|`|_/g, '');
const squash = (value) => value.replace(/\s+/g, ' ').trim().toLowerCase();

const strict = process.argv.includes('--strict');

const problems = [];
const gaps = [];
const notes = [];
const fail = (message) => problems.push(message);
const gap = (message) => gaps.push(message);

/* ---------------------------------------------------------------- the copy pack's values */

const brand = JSON.parse(readFileSync(BRAND, 'utf8')).brand;
const phone = existsSync(SITE_CONFIG)
  ? (/(?:const|let)\s+PHONE_DISPLAY\s*=\s*'([^']*)'/.exec(readFileSync(SITE_CONFIG, 'utf8'))?.[1] ?? '')
  : '';
const copyFor = (lang) => ({ brand: brand.name, city: brand.cityNames?.[lang] ?? brand.city, phone });

/** Same contract as `src/lib/brand-copy.ts`: `{brand}`, `{city}`, `{phone}`, `{BRAND}` goes upper-case. */
const fill = (value, values) =>
  String(value).replace(/\{(brand|city|phone)\}/gi, (match, key) => {
    const resolved = values[key.toLowerCase()] ?? '';
    return match === match.toUpperCase() && match !== match.toLowerCase() ? resolved.toUpperCase() : resolved;
  });

const UNKNOWN_PLACEHOLDER = /\{[a-zA-Z][a-zA-Z0-9_-]*\}/;

/* ---------------------------------------------------------------- the routes an href may point at */

const pages = new Set(
  existsSync(DIR)
    ? readdirSync(DIR)
        .filter((name) => name.endsWith('.json'))
        .map((name) => name.slice(0, -'.json'.length))
    : [],
);

const staticRoutes = new Set(['/']);
const dynamicRoutes = [];
const walkApp = (dir, prefix) => {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('(') || entry.startsWith('_') || entry.startsWith('.')) continue;
    const full = `${dir}/${entry}`;
    if (!statSync(full).isDirectory()) continue;
    const path = `${prefix}/${entry}`;
    // `[slug]` under a folder is a whole namespace: `/cases/anything` is a route, the target is not checkable here.
    if (entry.startsWith('[')) {
      dynamicRoutes.push(prefix || '/');
      continue;
    }
    if (existsSync(`${full}/page.tsx`)) staticRoutes.add(path);
    walkApp(full, path);
  }
};
if (existsSync(APP)) walkApp(APP, '');

/* ---------------------------------------------------------------- walk the pages */

const files = existsSync(DIR) ? readdirSync(DIR).filter((name) => name.endsWith('.json')).sort() : [];
const draftOf = new Map(
  files.map((file) => [file, JSON.parse(readFileSync(`${DIR}/${file}`, 'utf8')).draft === true]),
);
const drafts = files.filter((file) => draftOf.get(file)).map((file) => file.slice(0, -'.json'.length));
const { briefs } = readBriefs();
const briefBySlug = new Map(briefs.filter((brief) => brief.built_slug).map((brief) => [brief.built_slug, brief]));

const titles = new Map();
const headings = new Map();
const linkKinds = { page: 0, route: 0, dynamic: 0, line: 0, external: 0 };
let blocks = 0;
let matched = 0;

const measured = [];

/** Every node, the way `seo:check` counts them. */
const countBlocks = (list) =>
  list.reduce((total, block) => total + 1 + (block.t === 'section' ? countBlocks(block.blocks ?? []) : 0), 0);

for (const file of files) {
  const slug = file.slice(0, -'.json'.length);
  const page = JSON.parse(readFileSync(`${DIR}/${file}`, 'utf8'));

  /* A draft is a skeleton `seo:new` just wrote: counting it against a brief nobody has written the page
     for would drown the report in expected gaps. Its blocks still count, so the totals match seo:check. */
  if (page.draft === true) {
    blocks += countBlocks(page.blocks ?? []);
    continue;
  }
  blocks += countBlocks(page.blocks ?? []);
  const values = copyFor(page.lang || 'th');
  const text = (value) => fill(stripMarks(value), values);

  /* One scope per block list: the page itself, and every `section` inside it. A section carries its own
     `lang` and its own `<h1>`, which is how one URL serves the checklist in three languages. */
  const scopes = [];
  const collect = (list, where) => {
    scopes.push({ where, list });
    for (const block of list) {
      if (block.t === 'section') collect(block.blocks ?? [], `${where} > section${block.lang ? `(${block.lang})` : ''}`);
    }
  };
  collect(page.blocks ?? [], 'blocks');

  let h1Count = 0;
  let firstH1 = '';
  const body = [];
  const headingsList = [];

  for (const scope of scopes) {
    const own = scope.list.filter((block) => block.t !== 'section');
    const scopeH1s = own.filter((block) => block.t === 'h1').map((block) => text(block.v));
    if (scopeH1s.length > 1) {
      fail(`${slug}: ${scopeH1s.length} h1 blocks in ${scope.where} — a scope gets one`);
    }
    if (scopeH1s.length) {
      h1Count += scopeH1s.length;
      if (!firstH1) firstH1 = scopeH1s[0];
      headingsList.push(...scopeH1s);
    }
  }

  for (const block of (function flatten(list) {
    const out = [];
    for (const item of list) {
      out.push(item);
      if (item.t === 'section') out.push(...flatten(item.blocks ?? []));
    }
    return out;
  })(page.blocks ?? [])) {
    if (block.t === 'section') continue;
    if (block.t === 'table') {
      for (const cell of [...(block.head ?? []).flat(), ...(block.rows ?? []).flat()]) body.push(text(cell));
    } else if (Array.isArray(block.v)) {
      for (const line of block.v) body.push(text(line));
    } else if (typeof block.v === 'string' && block.t !== 'kicker') {
      if (block.t !== 'h1' && block.t !== 'h2' && block.t !== 'h3' && block.t !== 'h4') body.push(text(block.v));
    }
  }

  if (h1Count === 0) fail(`${slug}: no h1 anywhere on the page`);

  const title = text(page.title ?? '');
  const description = text(page.description ?? '');

  if (!title) fail(`${slug}: title is empty`);
  if (!description) fail(`${slug}: description is empty`);
  for (const [field, raw, value] of [
    ['title', page.title ?? '', title],
    ['description', page.description ?? '', description],
  ]) {
    // On the raw string: `title` above has its marks stripped for measuring, which would hide them.
    if (/\*\*|`|\[[^\]]*\]\([^)]*\)/.test(String(raw))) {
      fail(`${slug}: ${field} carries markdown, which renders literally in the tag`);
    }
    if (UNKNOWN_PLACEHOLDER.test(value)) fail(`${slug}: ${field} still holds ${UNKNOWN_PLACEHOLDER.exec(value)[0]}`);
  }

  if (title) {
    const key = squash(title);
    if (titles.has(key)) fail(`${slug}: title is identical to ${titles.get(key)}`);
    else titles.set(key, slug);
  }
  /* Only the `h1` is compared across pages: h2s like «ราคานี้ได้อะไร» are section titles several pages
     have a right to share, while two pages with one h1 are two pages claiming one query. */
  for (const heading of headingsList) {
    const key = squash(heading);
    if (!key) continue;
    if (headings.has(key)) fail(`${slug}: h1 "${heading.slice(0, 44)}" is also ${headings.get(key)}'s`);
    else headings.set(key, slug);
  }

  /* Links: `[label](href)` inside any string. `@line` resolves at render from `site.config.ts`. */
  const strings = [];
  const harvest = (value) => {
    if (typeof value === 'string') strings.push(value);
    else if (Array.isArray(value)) value.forEach(harvest);
    else if (value && typeof value === 'object') Object.values(value).forEach(harvest);
  };
  harvest(page.blocks);

  const seen = new Set();
  for (const source of strings) {
    for (const match of source.matchAll(/\[([^\]\n]*)\]\(([^)\s]+)\)/g)) {
      const href = match[2];
      if (seen.has(href)) continue;
      seen.add(href);

      if (href === '@line') {
        linkKinds.line++;
        continue;
      }
      if (/^(?:https?:|mailto:|tel:)/.test(href)) {
        linkKinds.external++;
        continue;
      }
      if (!href.startsWith('/')) {
        fail(`${slug}: link "${href}" is neither a route, an absolute URL, @line nor mail/tel`);
        continue;
      }

      const path = href.split('#')[0] || '/';
      if (staticRoutes.has(path)) linkKinds.route++;
      else if (path.split('/').length === 2 && pages.has(path.slice(1))) linkKinds.page++;
      else if (dynamicRoutes.some((base) => base !== '/' && path.startsWith(`${base}/`))) linkKinds.dynamic++;
      else fail(`${slug}: link "${href}" resolves to no route in ${APP} and no file in ${DIR}`);
    }
  }

  /* Brief fidelity. Pages written outside the plan have nothing to be measured against, and say so. */
  const brief = briefBySlug.get(slug);
  const words = [...new Intl.Segmenter(page.lang || 'th', { granularity: 'word' }).segment(body.join(' '))].filter(
    (part) => part.isWordLike,
  ).length;

  /* Length is a property of the tag, not of the brief — a page written outside the plan still loses its
     own title to truncation. Keyword and volume need the brief, so they live inside the branch. */
  if (title.length > TITLE_MAX) gap(`${slug}: title ${title.length} chars (max ${TITLE_MAX})`);
  if (description.length > DESCRIPTION_MAX) gap(`${slug}: description ${description.length} chars (max ${DESCRIPTION_MAX})`);
  if (description.length < DESCRIPTION_MIN) gap(`${slug}: description ${description.length} chars (min ${DESCRIPTION_MIN})`);

  if (brief) {
    matched++;

    const chunks = String(brief.primary_keyword).split(/\s+/).filter(Boolean);
    const missing = chunks.filter((chunk) => !firstH1.includes(chunk));
    if (missing.length) {
      gap(`${slug}: h1 misses ${missing.map((chunk) => `"${chunk}"`).join(', ')} of ${brief.page_id}'s keyword`);
    }

    const target = Number(String(brief.word_target).replace(/[^\d]/g, '')) || 0;
    if (target) {
      const ratio = words / target;
      if (ratio < VOLUME_FLOOR) {
        gap(`${slug}: ${words} words / ${target} target = ${ratio.toFixed(2)} (floor ${VOLUME_FLOOR.toFixed(2)})`);
      }
    }
    measured.push({ slug, id: brief.page_id, words, target });
  }
}

const orphans = files
  .map((file) => file.slice(0, -'.json'.length))
  .filter((slug) => !briefBySlug.has(slug) && !drafts.includes(slug));

/* ---------------------------------------------------------------- report */

console.log(
  `seo-qa · ${files.length - drafts.length} pages${drafts.length ? ` + ${drafts.length} draft (${drafts.join(', ')}, not measured)` : ''} · ${blocks} blocks · ${matched} matched a brief${orphans.length ? ` (${orphans.length} without: ${orphans.join(', ')})` : ''}`,
);
console.log(
  `  links: ${linkKinds.page} page · ${linkKinds.route} route · ${linkKinds.dynamic} dynamic · ${linkKinds.line} @line · ${linkKinds.external} external`,
);
console.log(
  `  copy: measured after {brand}/{city}/{phone} are filled; words by Intl.Segmenter in the page's language, not by spaces`,
);

if (gaps.length) {
  console.log(`\ngaps — page against its brief (fatal only with --strict)`);
  for (const item of gaps) console.log(`  · ${item}`);
}

if (problems.length) {
  console.log(`\nGATE - pages are well-formed: ${problems.length} problem(s)`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exit(1);
}

console.log('\nGATE - pages are well-formed: 0 (must be 0)');

if (strict && gaps.length) {
  console.log(`GATE - pages match their briefs (--strict): ${gaps.length} gap(s)`);
  process.exit(1);
}

if (gaps.length) {
  console.log(`  ${gaps.length} gap(s) against the briefs — run with --strict to make them fatal`);
}

process.exit(0);
