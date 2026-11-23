#!/usr/bin/env node
/**
 * Turns one brief into the smallest honest skeleton of a page.
 *
 * `seo:plan` says which briefs are ready; writing the file from one by hand means retyping 26 columns and
 * getting the slug, the language and the title subtly wrong. This is the stage between them:
 *
 *   npm run seo:new -- --brief SEO-09            # writes content/pages/solar-tax-deduction-2569.json
 *   npm run seo:new -- --brief SEO-09 --force    # overwrites an existing file
 *
 * What it copies is what the brief actually has. `title_seo` and `meta_description` are Thai for a Thai
 * brief, so they go in verbatim; the `h1` column is written in the research's own language for 21 of the 24
 * Thai briefs (Russian), so it does **not** go into the page — a TODO marker does, and the tool prints the
 * brief's text for whoever rewrites it. That rule is `inLanguage()` in `scripts/lib/briefs.mjs`, the same
 * one `seo:plan` reports on. Nothing else is invented: the body is a TODO naming the word target, and the
 * `internal_links` become real `[label](/slug)` entries only where the target brief is already built.
 *
 * The file lands as `"draft": true`: not imported by `src/lib/seo-pages.ts`, not in `src/app/sitemap.ts`,
 * so `dynamicParams = false` makes it unreachable. `seo:check` reads that flag and fails the moment a draft
 * *is* registered or sitemapped — a TODO page must not be publishable by accident. Publishing stays a
 * human edit, in this order: write the TODOs, add the import, add the sitemap line, drop `draft`, then set
 * `built_slug` in `content/seo/briefs.csv` (which is what turns the brief from "queued" to "built").
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { inLanguage, readBriefs, scriptOf, slugOf } from './lib/briefs.mjs';

const DIR = 'content/pages';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const force = args.includes('--force');
const id = flag('--brief');

const problems = [];
const fail = (message) => {
  problems.push(message);
};
const done = () => {
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exit(1);
};

if (!id) {
  console.log('seo-new · usage: npm run seo:new -- --brief SEO-09 [--force]');
  process.exit(1);
}

const { briefs } = readBriefs();
const brief = briefs.find((item) => item.page_id === id);
if (!brief) {
  console.log(`GATE - nothing was written: ${id} is not a brief`);
  fail(`${id} is not in content/seo/briefs.csv — ids are SEO-01…SEO-${String(briefs.length).padStart(2, '0')}`);
  done();
}

const slug = slugOf(brief.url_slug);
const lang = brief.lang;

if (!slug) {
  console.log(`GATE - nothing was written: ${id} has no page file to create`);
  fail(`${id} plans "${brief.url_slug}" — the landing renders it, so there is no content/pages file to write`);
  done();
}
if (brief.built_slug) {
  console.log(`GATE - nothing was written: ${id} is already built`);
  fail(`${id} is built as ${DIR}/${brief.built_slug}.json — edit that page, not a new one`);
  done();
}

const path = `${DIR}/${slug}.json`;
if (existsSync(path) && !force) {
  console.log(`GATE - nothing was written: ${path} exists`);
  fail(`${path} already exists — pass --force to overwrite it (the draft flag and TODOs are yours to keep)`);
  done();
}

/* ---------------------------------------------------------------- what the brief can actually supply */

const copied = [];
const refused = [];

const usable = (field, value) => {
  if (!value) return false;
  if (inLanguage(value, lang)) return true;
  refused.push({ field, value, script: scriptOf(value) });
  return false;
};

const title = usable('title_seo', brief.title_seo) ? brief.title_seo : `TODO ${id}: title`;
const description = usable('meta_description', brief.meta_description)
  ? brief.meta_description
  : `TODO ${id}: meta description`;
if (title !== `TODO ${id}: title`) copied.push('title');
if (description !== `TODO ${id}: meta description`) copied.push('description');

const h1 = usable('h1', brief.h1) ? brief.h1 : `TODO ${id}: h1`;
if (!h1.startsWith('TODO')) copied.push('h1');

/* Internal links, only to pages that exist: a link to `/solar-20kw` today would be a 404, and `seo:qa`
   fails exactly that. Lead magnets (LM-xx) are downloads, not routes — they are named, never linked. */
const linkRefs = String(brief.internal_links).match(/SEO-\d{2}/g) ?? [];
const links = [];
const skipped = [];
for (const ref of [...new Set(linkRefs)]) {
  const target = briefs.find((item) => item.page_id === ref);
  if (!target?.built_slug) {
    skipped.push(ref);
    continue;
  }
  const targetPath = `${DIR}/${target.built_slug}.json`;
  let label = target.built_slug;
  if (existsSync(targetPath)) {
    const targetPage = JSON.parse(readFileSync(targetPath, 'utf8'));
    const heading = (targetPage.blocks ?? []).find((block) => block.t === 'h1');
    label = heading?.v ?? (inLanguage(targetPage.title, lang) ? targetPage.title : target.built_slug);
  }
  links.push(`[${label}](/${target.built_slug})`);
}
const magnets = [...new Set(String(brief.internal_links).match(/LM-\d{2}/g) ?? [])];

const words = /^[\d,]+$/.test(String(brief.word_target).trim())
  ? `${brief.word_target.trim()} words`
  : String(brief.word_target).trim();

const blocks = [
  { t: 'kicker', v: `TODO ${id}: kicker` },
  { t: 'h1', v: h1 },
  { t: 'p', v: `TODO ${id}: first paragraph — ${words}, lang ${lang}` },
];
if (links.length) {
  blocks.push({ t: 'h2', v: `TODO ${id}: internal links` }, { t: 'ul', v: links });
}

const page = { slug, lang, frame: 'wrapped', draft: true, title, description, blocks };

writeFileSync(path, `${JSON.stringify(page, null, 2)}\n`, 'utf8');

/* ---------------------------------------------------------------- what the writer needs to know */

console.log(`seo-new · ${id} → ${path} (draft)`);
console.log(
  `  copied from the brief: ${copied.length ? copied.join(', ') : 'nothing'}${
    refused.length ? ` · not copied, another script: ${refused.map((item) => `${item.field} (${item.script})`).join(', ')}` : ''
  }`,
);
for (const item of refused) {
  console.log(`  ${item.field} in the brief: ${JSON.stringify(item.value)}`);
}
console.log(
  `  links: ${links.length} built target(s)${links.length ? ` — ${links.join(' ')}` : ''}${
    skipped.length ? ` · skipped ${skipped.length} unbuilt (${skipped.join(', ')})` : ''
  }${magnets.length ? ` · lead magnet(s) ${magnets.join(', ')} — not a route` : ''}`,
);
if (brief.cta) console.log(`  cta in the brief: ${JSON.stringify(brief.cta)}${inLanguage(brief.cta, lang) ? '' : ' (not usable as copy — another script)'}`);
if (brief.notes) console.log(`  notes: ${brief.notes}`);
const todos = blocks.reduce(
  (count, block) =>
    count +
    (Array.isArray(block.v)
      ? block.v.filter((line) => line.startsWith('TODO')).length
      : String(block.v).startsWith('TODO')
        ? 1
        : 0),
  0,
);
console.log(
  `  next: fill ${todos} TODO(s), then add the import to src/lib/seo-pages.ts, the URL to src/app/sitemap.ts, drop "draft", and set built_slug in content/seo/briefs.csv`,
);
console.log(`  the file is unreachable: no registry import, no sitemap entry, dynamicParams = false`);
process.exit(0);
