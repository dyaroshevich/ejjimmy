#!/usr/bin/env node
/**
 * Reads the briefs and says what can be built next — and what cannot, because the plan contradicts itself.
 *
 * `docs/SEO_PIPELINE.md` puts a brief in front of every page: one `primary_keyword`, one `url_slug`, one
 * `page_type`, a `word_target`, and `internal_links` named by page id. The brief format is not invented
 * here — it is the 25 columns of the research CSV, moved into `content/seo/briefs.csv` so it is a contract
 * the repository can enforce rather than a document nobody reads again.
 *
 * A brief is cheap to write and expensive to get wrong: two briefs sharing a keyword compete for the same
 * SERP, two sharing a slug fight over one file, and a `internal_links` entry naming a page id that does not
 * exist is a link the writer will either invent or drop. None of those are caught by `tsc`, `lint` or
 * `seo:check` (which sees only pages that already exist), so this is the instrument for the stage before
 * the page:
 *
 *   1. every row is the width of the header, and the header carries the twelve fields a page cannot be built
 *      without;
 *   2. `page_id` is unique and looks like `SEO-01`;
 *   3. no two briefs plan the same slug, and no two of the same `lang` claim the same `primary_keyword`;
 *   4. `built_slug` — where the brief ended up on disk — points at a real `content/pages` file that the
 *      registry imports and the sitemap lists; a page sitting under its planned slug without that link is
 *      drift, not a coincidence;
 *   5. every `SEO-xx` in `internal_links` exists (ranges like `SEO-16…19` are expanded); `LM-xx` refs are
 *      lead magnets, counted and named, not page ids.
 *
 * What it deliberately does not decide: when the brief and the file disagree about the spelling of a slug,
 * the tool cannot know which one is right — so it prints the conflict and leaves the gate green, because a
 * red gate the tool cannot fix is a gate people learn to ignore.
 *
 *   node scripts/seo-plan.mjs            # report, exit 1 on a broken brief
 *   node scripts/seo-plan.mjs --check    # the same; kept for symmetry with seo:check
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';

import { BRIEFS, LOCALES, inLanguage, readBriefs, refs, scriptOf, slugOf } from './lib/briefs.mjs';

const DIR = 'content/pages';
const REGISTRY = 'src/lib/seo-pages.ts';
const SITEMAP = 'src/app/sitemap.ts';
const REQUIRED = [
  'page_id',
  'lang',
  'url_slug',
  'page_type',
  'primary_keyword',
  'title_seo',
  'meta_description',
  'h1',
  'word_target',
  'priority',
  'internal_links',
  'built_slug',
];

const problems = [];
const fail = (message) => problems.push(message);

const magnets = (cell) => [...new Set(String(cell).match(/LM-\d{2}/g) ?? [])];

if (!existsSync(BRIEFS)) {
  console.log(`GATE - briefs are consistent: 1 problem(s)\n  · ${BRIEFS} does not exist`);
  process.exit(1);
}

const { header: head, table, briefs: rows } = readBriefs(BRIEFS);

for (const key of REQUIRED) if (!head.includes(key)) fail(`${BRIEFS} has no "${key}" column`);
for (let i = 0; i < table.length; i++) {
  if (table[i].length !== head.length) fail(`row ${i + 1} has ${table[i].length} cells, header has ${head.length}`);
}

const pagesOnDisk = new Set(
  existsSync(DIR)
    ? readdirSync(DIR)
        .filter((name) => name.endsWith('.json'))
        .map((name) => name.slice(0, -'.json'.length))
    : [],
);

/** A file with `"draft": true` is work in progress: on disk, but not registered, not served, not "built". */
const drafts = new Set(
  [...pagesOnDisk].filter((slug) => JSON.parse(readFileSync(`${DIR}/${slug}.json`, 'utf8')).draft === true),
);
const livePages = new Set([...pagesOnDisk].filter((slug) => !drafts.has(slug)));
const registry = existsSync(REGISTRY) ? readFileSync(REGISTRY, 'utf8') : '';
const registered = new Set([...registry.matchAll(/content\/pages\/([a-z0-9-]+)\.json/g)].map((m) => m[1]));
const sitemap = existsSync(SITEMAP) ? readFileSync(SITEMAP, 'utf8') : '';

const ids = new Set();
const slugs = new Map();
const keywords = new Map();
const builtBy = new Map();
const queue = [];
const conflicts = [];
const magnetRefs = new Set();

for (const brief of rows) {
  const id = brief.page_id || '(no page_id)';

  if (!/^SEO-\d{2}$/.test(brief.page_id)) fail(`${id}: page_id must look like SEO-01`);
  if (ids.has(brief.page_id)) fail(`${id}: page_id is used twice`);
  ids.add(brief.page_id);

  if (!LOCALES.includes(brief.lang)) fail(`${id}: lang "${brief.lang}" is not one of ${LOCALES.join('/')}`);
  if (!brief.url_slug.startsWith('/')) fail(`${id}: url_slug "${brief.url_slug}" must start with /`);
  for (const key of ['primary_keyword', 'title_seo', 'h1']) {
    if (!brief[key]) fail(`${id}: ${key} is empty`);
  }
  if (!/^[1-5]$/.test(brief.priority)) fail(`${id}: priority "${brief.priority}" must be 1–5`);

  const slug = slugOf(brief.url_slug);
  const home = slug === '';

  if (!home) {
    if (slugs.has(slug)) fail(`${id}: plans /${slug}, which ${slugs.get(slug)} already plans`);
    slugs.set(slug, brief.page_id);
  }

  const keyword = brief.primary_keyword.trim().replace(/\s+/g, ' ').toLowerCase();
  if (keyword) {
    const key = `${brief.lang}\u0000${keyword}`;
    if (keywords.has(key)) {
      fail(`${id}: primary_keyword "${brief.primary_keyword}" is already claimed by ${keywords.get(key)} (same lang)`);
    }
    keywords.set(key, brief.page_id);
  }

  if (brief.built_slug) {
    if (!pagesOnDisk.has(brief.built_slug)) {
      fail(`${id}: built_slug "${brief.built_slug}" is not a file in ${DIR}`);
    } else if (!registered.has(brief.built_slug)) {
      fail(`${id}: built_slug "${brief.built_slug}" exists but ${REGISTRY} does not import it`);
    } else if (!sitemap.includes(`/${brief.built_slug}\``)) {
      fail(`${id}: built_slug "${brief.built_slug}" is missing from ${SITEMAP}`);
    }
    if (builtBy.has(brief.built_slug)) fail(`${id}: built_slug "${brief.built_slug}" is also claimed by ${builtBy.get(brief.built_slug)}`);
    builtBy.set(brief.built_slug, brief.page_id);
    if (!home && slug !== brief.built_slug) {
      conflicts.push(`${id}: plans /${slug}, built as ${brief.built_slug}`);
    }
  } else if (!home && livePages.has(slug)) {
    fail(`${id}: ${DIR}/${slug}.json exists but the brief does not link it with built_slug`);
  }

  for (const ref of refs(brief.internal_links)) {
    if (!rows.some((other) => other.page_id === ref)) {
      fail(`${id}: internal_links names ${ref}, which is not a brief`);
    }
  }
  for (const magnet of magnets(brief.internal_links)) magnetRefs.add(magnet);

  if (brief.built_slug) continue;
  if (home) continue;
  queue.push({ id: brief.page_id, lang: brief.lang, slug, priority: Number(brief.priority), word: brief.word_target, keyword: brief.primary_keyword });
}

const orphans = [...livePages].filter((slug) => !builtBy.has(slug)).sort();
const homes = rows.filter((brief) => slugOf(brief.url_slug) === '');
const byLocale = LOCALES.map((locale) => `${locale} ${rows.filter((b) => b.lang === locale).length}`).join(' · ');

console.log(`seo-plan · ${rows.length} briefs · ${head.length} columns · ${byLocale}`);
console.log(
  `  built ${builtBy.size} · queued ${queue.length} · home ${homes.length} (the landing renders these, not ${DIR})`,
);

if (queue.length) {
  console.log('\nqueue — unbuilt briefs, ordered by priority then page_id');
  queue.sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  for (const item of queue) {
    // `word_target` is normally "1,200"; one brief adds prose ("600 + инструмент"), which reads
    // wrong with " words" glued on.
    const words = /^[\d,]+$/.test(item.word.trim()) ? `${item.word.trim()} words` : item.word.trim();
    console.log(`  P${item.priority}  ${item.id}  ${item.lang}  /${item.slug}  ${item.keyword}  ·  ${words}`);
  }
}

if (builtBy.size) {
  console.log('\nbuilt');
  const built = rows.filter((brief) => brief.built_slug);
  built.sort((a, b) => Number(a.priority) - Number(b.priority) || a.page_id.localeCompare(b.page_id));
  for (const brief of built) console.log(`  P${brief.priority}  ${brief.page_id}  ${brief.built_slug}`);
}

const notes = [];
if (drafts.size) {
  notes.push(`${drafts.size} draft(s) on disk, measured by no gate yet: ${[...drafts].sort().join(', ')}`);
}
// The `h1` column is written in the research's own language for most Thai briefs — Russian, not Thai.
const foreignH1 = rows.filter((brief) => brief.h1 && !inLanguage(brief.h1, brief.lang));
if (foreignH1.length) {
  notes.push(
    `${foreignH1.length} brief(s) carry an h1 in another script (${foreignH1
      .slice(0, 3)
      .map((brief) => `${brief.page_id}:${scriptOf(brief.h1)}`)
      .join(', ')}${foreignH1.length > 3 ? ', …' : ''}) — seo:new writes a TODO instead of copying it`,
  );
}
if (homes.length) {
  notes.push(
    `${homes.length} briefs describe a landing (${homes.map((b) => b.page_id).join(', ')}) — / renders them, their copy is not verified against the brief`,
  );
}
if (orphans.length) {
  notes.push(`${orphans.length} live page(s) have no brief: ${orphans.join(', ')} — written outside the plan`);
}
if (conflicts.length) {
  notes.push(`${conflicts.length} slug conflict(s) the tool will not resolve: ${conflicts.join('; ')}`);
}
if (magnetRefs.size) {
  notes.push(`${magnetRefs.size} lead magnets referenced (${[...magnetRefs].sort().join(', ')}) — LM ids, not page ids`);
}
if (notes.length) {
  console.log('\nnotes');
  for (const note of notes) console.log(`  · ${note}`);
}

if (problems.length) {
  console.log(`\nGATE - briefs are consistent: ${problems.length} problem(s)`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exit(1);
}

console.log('\nGATE - briefs are consistent: 0 (must be 0)');
process.exit(0);
