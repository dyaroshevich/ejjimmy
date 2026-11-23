// Gives a franchisee its own copy of the flagship's content, with its own name in it.
//
//   node scripts/tenant-clone.mjs --to solar1            dry run: what would be copied and reworded
//   node scripts/tenant-clone.mjs --to solar1 --apply    writes to the database
//
// The tenant migration assigns every existing row to the flagship, so a franchisee's storefront comes up
// with no articles and no knowledge for its assistant; copying by hand is how the founder's name ended up
// on Solar 1's landing (ROADMAP C2).
//
// It rewrites the brand *name* only — «Tawan Power» and the bare «Tawan». The domain, LINE handle, phone
// and e-mail are reported as `manual` instead: they sit inside asset URLs, and a blind replacement would
// point a working image at a host that does not serve it.
//
// Cases are copied only with `--with-cases`: they are the flagship's installations with real customers'
// names, which a franchisee presenting as its own work nobody has approved.
//
// Idempotent: a slug that already exists at the target is skipped, and knowledge only goes into a site
// that has none. Requires the three tenant migrations — without `site_id` there is nothing to copy from.

import { readFileSync } from 'node:fs';
import nextEnv from '@next/env';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : fallback;
};

const to = arg('--to');
const from = arg('--from', 'tawan');
const apply = argv.includes('--apply');
const withCases = argv.includes('--with-cases');

if (!to || to === from) {
  console.error('usage: node scripts/tenant-clone.mjs --to <site id> [--from tawan] [--apply] [--with-cases]');
  process.exit(2);
}

/** The target's brand name, from the config that owns it — a second list of names would drift. */
const brandNameOf = (siteId) => {
  const source = readFileSync('src/lib/site.config.ts', 'utf8');
  const at = source.indexOf(`const ${siteId}: Site = {`);
  const name = at > -1 ? /name:\s*'([^']+)'/.exec(source.slice(at))?.[1] : null;
  if (!name) throw new Error(`no brand name for "${siteId}" in src/lib/site.config.ts — pass --to-name`);
  return name;
};

const toName = arg('--to-name') ?? brandNameOf(to);

const TEXT_FIELDS = {
  blog_posts: ['title', 'excerpt', 'content', 'meta_title', 'meta_description', 'author'],
  solar_cases: ['case_description', 'customer_quote'],
  knowledge: ['content'],
};

/** Name first, then the bare word — otherwise «Tawan Power» would become «Solar 1 Krabi Power». */
const rename = (text) =>
  String(text).replace(/\btawan\s+power\b/gi, toName).replace(/\btawan\b/gi, toName);

/** Identity a human has to place: it may be a URL we must not rewrite. */
const MANUAL = [
  ['domain', /tawanpower/gi],
  ['LINE handle', /@750iqwoa/g],
  ['phone', /082-?828-?9844|086-?954-?9549/g],
  ['e-mail', /violstam23@/gi],
];

/** The same window of both versions, cut around the brand mention — it usually sits deep in an article. */
const snippets = (before, after, max = 150) => {
  const a = String(before ?? '').replace(/\s+/g, ' ');
  const start = Math.max(0, a.search(/\btawan/i) - 40);
  const cut = (value) =>
    `${start ? '…' : ''}${value.slice(start, start + max)}${start + max < value.length ? '…' : ''}`;
  return { was: cut(a), now: cut(String(after ?? '').replace(/\s+/g, ' ')) };
};

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('MISSING env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { createClient } = await import('@supabase/supabase-js');
const db = createClient(url, key, { auth: { persistSession: false } });

const tables = withCases ? ['blog_posts', 'solar_cases', 'knowledge'] : ['blog_posts', 'knowledge'];
const summary = { copied: 0, skipped: 0, manual: 0, failed: 0 };
let sampleShown = false;

console.log(`tenant-clone · ${from} → ${to} («${toName}») · ${apply ? 'APPLY' : 'dry run'}`);

/** One row: renamed, re-stamped, and reported; the insert is the only part that differs by mode. */
const copyRow = async (table, row, parentId) => {
  const next = { ...row, site_id: to };
  delete next.id;
  if (parentId) next.parent_id = parentId;
  for (const field of TEXT_FIELDS[table]) {
    if (typeof next[field] === 'string') next[field] = rename(next[field]);
  }

  const changed = TEXT_FIELDS[table].find((f) => typeof row[f] === 'string' && rename(row[f]) !== row[f]);
  if (!sampleShown && changed) {
    sampleShown = true;
    const { was, now } = snippets(row[changed], next[changed]);
    console.log(`  ${table}/${row.slug ?? row.id} · ${changed}\n    was: ${was}\n    now: ${now}`);
  }

  // Every string column, not only the reworded ones: the domain usually hides in an image path.
  for (const [field, value] of Object.entries(row)) {
    if (typeof value !== 'string' || field === 'site_id') continue;
    for (const [label, re] of MANUAL) {
      const hits = (value.match(re) || []).length;
      if (!hits) continue;
      summary.manual += hits;
      console.log(`  ${table}/${row.slug ?? row.id} · ${field}: ${hits} × ${label} left for a human`);
    }
  }

  if (!apply) return null;
  const { data, error } = await db.from(table).insert(next).select('id').single();
  if (error) {
    console.error(`  ${table}/${row.slug ?? row.id}: ${error.message}`);
    summary.failed += 1;
    return null;
  }
  return data.id;
};

for (const table of tables) {
  sampleShown = false;
  const { data: source, error } = await db.from(table).select('*').eq('site_id', from);
  if (error) {
    const hint = /site_id/.test(error.message)
      ? ' — run supabase/migrations/20261120000000_tenant_site_id.sql first'
      : '';
    console.error(`  ${table}: ${error.message}${hint}`);
    summary.failed += 1;
    continue;
  }
  if (!source?.length) {
    console.log(`  ${table}: nothing at ${from}`);
    continue;
  }

  const wantsSlug = table !== 'knowledge';
  const { data: existing, error: existingError } = await db
    .from(table)
    .select(wantsSlug ? 'slug' : 'id')
    .eq('site_id', to);
  if (existingError) {
    console.error(`  ${table}: ${existingError.message}`);
    summary.failed += 1;
    continue;
  }
  // Knowledge has no slug: it is one set per site, so it is copied only into an empty one.
  if (!wantsSlug && existing?.length) {
    console.log(`  knowledge: ${existing.length} row(s) already belong to ${to} — skipped`);
    summary.skipped += source.length;
    continue;
  }

  const taken = new Set((existing ?? []).map((row) => row.slug));
  const parents = source.filter((row) => !row.parent_id);
  const chunks = source.filter((row) => row.parent_id);
  const idMap = new Map();
  let copiedHere = 0;

  for (const row of parents) {
    if (row.slug && taken.has(row.slug)) {
      summary.skipped += 1;
      continue;
    }
    const newId = await copyRow(table, row, null);
    if (newId) idMap.set(row.id, newId);
    if (apply && !newId) continue;
    copiedHere += 1;
  }

  // Chunks point at their parent by id, so they can only follow once the parents exist.
  for (const chunk of chunks) {
    const parent = idMap.get(chunk.parent_id);
    if (apply && !parent) {
      summary.skipped += 1;
      continue;
    }
    const newId = await copyRow(table, chunk, parent ?? chunk.parent_id);
    if (newId) idMap.set(chunk.id, newId);
    if (apply && !newId) continue;
    copiedHere += 1;
  }

  const shape = table === 'knowledge' ? ` (${parents.length} parents + ${chunks.length} chunks)` : '';
  console.log(`  ${table}: ${copiedHere} to copy${shape}`);
  summary.copied += copiedHere;
}

if (!withCases) console.log("  solar_cases: not copied — they are the flagship's installations; pass --with-cases if approved");

console.log(
  `\n${apply ? 'copied' : 'would copy'} ${summary.copied} · skipped ${summary.skipped} · manual ${summary.manual} · failed ${summary.failed}`,
);
if (!apply) console.log('dry run: nothing was written. Add --apply when the numbers look right.');
process.exit(summary.failed ? 1 : 0);
