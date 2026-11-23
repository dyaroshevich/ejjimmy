// Are the two legal documents honest about what they know?
// usage: node scripts/legal-check.mjs
//
// `/privacy` and `/terms` name a data controller. Until the owner's entity, tax id, address and phone are
// real, they are drafts — and a draft must not claim to be published: it carries `noindex` and stays out
// of the sitemap. The rule is enforced in three places at once (the pages, the sitemap, and `legal.ts`
// which decides), so this script only proves the three agree; it does not decide anything itself.
//
// It reads source rather than a running server on purpose: the failure it guards against is a build
// configuration change (a metadata object losing its `robots` line, a sitemap entry added back), and that
// is visible statically, without a dev server in CI.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLACEHOLDERS = ['รอระบุ', 'xxx', 'to be completed', '0-0000-0000-0000-0000-0000-0', '0000000000000'];

const brand = JSON.parse(readFileSync(join(ROOT, 'brand.json'), 'utf8')).brand;
const legal = brand.legal ?? {};

const missing = [
  ['entityName', 'legal entity name'],
  ['taxId', 'tax identification number'],
  ['address', 'registered address'],
  ['phone', 'contact phone'],
]
  .filter(([key]) => {
    const v = String(legal[key] ?? '').trim().toLowerCase();
    return !v || PLACEHOLDERS.some((m) => v.includes(m.toLowerCase()));
  })
  .map(([, label]) => label);

const ready = missing.length === 0;

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const privacy = read('src/app/privacy/page.tsx');
const terms = read('src/app/terms/page.tsx');
const sitemap = read('src/app/sitemap.ts');

let failed = 0;
const check = (ok, message) => {
  if (!ok) {
    console.error(`FAIL  ${message}`);
    failed++;
  }
};

for (const [file, source] of [
  ['/privacy', privacy],
  ['/terms', terms],
]) {
  // `legal.ts` stays the one decider; what changed with multi-site is that each hostname passes its own
  // `brand.legal` into it, so both spellings of "ask the rule" are accepted.
  check(
    /missingLegalFields|isLegalReady/.test(source),
    `${file} does not consult legal.ts — the draft rule has one source`,
  );
  check(
    /robots:\s*\w+\s*\?\s*undefined/.test(source),
    `${file} lost its conditional \`robots\` — a draft would be indexable`,
  );
  check(
    !/รอระบุ/.test(source) || !ready,
    `${file} still renders a placeholder while brand.legal is complete — remove the fallback text`,
  );
}

// Both entries must sit inside one conditional spread. A positional check is not enough — the import
// line alone would satisfy "isLegalReady appears before /privacy" — so the shape itself is asserted: a
// `...(legalReady ? [ … ] : [])` block that contains both documents.
const guardMatch = /\.\.\.\((legalReady|isLegalReady)\b/.exec(sitemap);
check(Boolean(guardMatch), 'sitemap.ts must gate both documents with `...(legalReady ? [ … ] : [])`');
const guard = guardMatch ? guardMatch.index : -1;
const closes = guard >= 0 ? sitemap.indexOf(': [])', guard) : -1;
for (const path of ['/privacy', '/terms']) {
  const at = sitemap.indexOf(path);
  check(at > guard && at < closes, `sitemap.ts lists ${path} outside the legal-ready block`);
}

if (ready) {
  console.log('legal · brand.legal is complete — both documents are publishable (indexable, in sitemap)');
} else {
  console.log(`legal · draft · still needed: ${missing.join(', ')}`);
  console.log('legal · /privacy and /terms are noindex and absent from the sitemap');
}

console.log(
  failed === 0
    ? `GATE - legal drafts stay out of search: 0 problem(s)`
    : `GATE - legal drafts stay out of search: ${failed} problem(s)`,
);
process.exit(failed === 0 ? 0 : 1);
