#!/usr/bin/env node
/**
 * Keeps `content/pages` and the one route that renders it in agreement.
 *
 * The twelve long-form Thai landings became data: `src/lib/seo-pages.ts` imports each JSON and
 * `src/app/[slug]/page.tsx` renders whatever that registry holds, with `dynamicParams = false` so an
 * unregistered slug is a 404 rather than a blank article. That trade is only safe if the registry is
 * complete — a JSON file nobody imports is a page that silently disappeared, and a route folder left
 * behind shadows the generator with its own copy.
 *
 * This is the instrument for it. Five checks, each one an actual way to break the set:
 *
 *   1. every `content/pages/*.json` is imported by `src/lib/seo-pages.ts`, and nothing imported is
 *      missing from disk — except a file with `"draft": true`, which is a skeleton rather than a page;
 *      a draft that somehow *is* imported (or listed in the sitemap) is the error that matters, because
 *      it would publish text that is still a TODO;
 *   2. a file's `slug` field matches its name (the field is what the registry keys on);
 *   3. no `src/app/<slug>/page.tsx` exists — that would win over `[slug]` and fork the page again;
 *   4. every block uses a tag the renderer knows, so a typo is a build error and not a blank gap;
 *   5. every slug still appears in `src/app/sitemap.ts` — the sitemap is hand-written with per-page
 *      priorities, so a new page has to be added there too, and this is where you find out.
 *
 *   node scripts/seo-pages.mjs          # report, exit 1 on any finding
 *   node scripts/seo-pages.mjs --check  # the same; kept for symmetry with brand:check
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';

const DIR = 'content/pages';
const REGISTRY = 'src/lib/seo-pages.ts';
const SITEMAP = 'src/app/sitemap.ts';

const BLOCK_TAGS = new Set(['kicker', 'h1', 'h2', 'h3', 'h4', 'p', 'callout', 'ul', 'ol', 'table', 'section', 'hr']);
const TABLE_SKINS = new Set(['card', 'prose']);
const FRAMES = new Set(['wrapped', 'padded']);
const EDGES = new Set(['none', 'soft', 'strong']);

const problems = [];
const fail = (message) => problems.push(message);

const onDisk = readdirSync(DIR)
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.slice(0, -'.json'.length))
  .sort();

const registry = readFileSync(REGISTRY, 'utf8');
const imported = [...registry.matchAll(/content\/pages\/([a-z0-9-]+)\.json/g)].map((m) => m[1]);
const importedSet = new Set(imported);

const draftOf = new Map(
  onDisk.map((slug) => [slug, JSON.parse(readFileSync(`${DIR}/${slug}.json`, 'utf8')).draft === true]),
);
const drafts = onDisk.filter((slug) => draftOf.get(slug));

for (const slug of onDisk) {
  if (draftOf.get(slug)) continue;
  if (!importedSet.has(slug)) fail(`${DIR}/${slug}.json is on disk but not imported by ${REGISTRY}`);
}
for (const slug of imported) {
  if (!onDisk.includes(slug)) fail(`${REGISTRY} imports ${slug}.json, which does not exist`);
}
if (imported.length !== importedSet.size) fail(`${REGISTRY} imports the same file twice`);

const sitemap = readFileSync(SITEMAP, 'utf8');
let blocks = 0;

for (const slug of onDisk) {
  const page = JSON.parse(readFileSync(`${DIR}/${slug}.json`, 'utf8'));

  if (page.slug !== slug) fail(`${slug}.json has slug "${page.slug}" instead of its own name`);
  if (page.frame !== undefined && !FRAMES.has(page.frame)) fail(`${slug}: unknown frame "${page.frame}"`);
  if (typeof page.title !== 'string' || !page.title) fail(`${slug}: title is empty`);
  if (typeof page.description !== 'string' || !page.description) fail(`${slug}: description is empty`);

  /* A draft is the one file shape `seo:new` writes: unregistered and out of the sitemap by design, but a
     closed vocabulary still has to hold, or the build fails later instead of now. */
  if (draftOf.get(slug)) {
    if (importedSet.has(slug)) fail(`${slug}: marked draft but imported by ${REGISTRY} — drop "draft" to publish it`);
    if (sitemap.includes(`/${slug}\``)) fail(`${slug}: marked draft but listed in ${SITEMAP}`);
  } else if (!sitemap.includes(`/${slug}\``)) {
    fail(`${slug} is missing from ${SITEMAP}`);
  }

  const shadow = `src/app/${slug}/page.tsx`;
  if (existsSync(shadow)) fail(`${shadow} still exists — it would render instead of the [slug] route`);

  const walk = (list, where) => {
    if (!Array.isArray(list)) {
      fail(`${slug}: ${where} is not an array`);
      return;
    }
    for (const block of list) {
      blocks++;
      if (!BLOCK_TAGS.has(block.t)) fail(`${slug}: ${where} has unknown block "${block.t}"`);
      if (block.t === 'table' && !TABLE_SKINS.has(block.v)) fail(`${slug}: table skin "${block.v}" is unknown`);
      if (block.t === 'table' && Array.isArray(block.edge)) {
        for (const edge of block.edge) if (!EDGES.has(edge)) fail(`${slug}: row rule "${edge}" is unknown`);
      }
      if (block.t === 'section') walk(block.blocks, `${where} > section`);
    }
  };
  walk(page.blocks, 'blocks');
}

// The placeholders are filled by the resolver, but a page that spells the brand out is a page a new
// client has to find by hand — the same rule `scripts/brand-copy.mjs` applies to messages/*.json.
const spelled = onDisk.filter((slug) =>
  /\bTawan Power\b/.test(readFileSync(`${DIR}/${slug}.json`, 'utf8')),
);

console.log(
  `seo-pages · ${onDisk.length} files${drafts.length ? ` (${drafts.length} draft)` : ''} · registered ${imported.length} · ${blocks} blocks · sitemap ${
    onDisk.length - drafts.length - problems.filter((p) => p.includes('missing from')).length
  }`,
);
if (drafts.length) console.log(`  draft, not served: ${drafts.join(', ')}`);

if (spelled.length) console.log(`  note: brand spelled out in ${spelled.join(', ')} (use {brand})`);

if (problems.length) {
  console.log(`GATE - content/pages and the one route disagree: ${problems.length} problem(s)`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exit(1);
}

console.log('GATE - content/pages and the one route disagree: 0 (must be 0)');
process.exit(0);
