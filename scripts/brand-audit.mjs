// Does the brand live in the config only?
// usage: node scripts/brand-audit.mjs [--write] [--json]
//
// Stage 0+1 of docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md. Two jobs:
//   · fail when a brand literal shows up in a file that did not have it (or grows in one that did),
//   · keep the measurement honest while stages 2–5 move the rest (name in copy, colours, assets).
//
// The tolerated debt lives in docs/audit/brand-baseline.json and only ever shrinks: `--write`
// refuses to record MORE than the previous baseline unless `--force` is passed.
// Allowed by design: `src/lib/site.config.ts` (the config), `messages/**` (the copy pack) and
// `docs/**` (this plan and the audits).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';

const ROOT = process.cwd();
const BASELINE = 'docs/audit/brand-baseline.json';
const ALLOWED = new Set(['src/lib/site.config.ts']);
const ROOTS = ['src', 'public'];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.html', '.txt', '.xml', '.webmanifest']);
const SKIP = [
  /^public\/(sw\.js|workbox-|fallback-|swe-worker-)/,
  // Generated from brand.json by `npm run brand:assets`: a name here is the config speaking, and the
  // gate that matters is that the file still matches the config (`brand:assets --check`).
  /^public\/(admin-)?manifest\.json$/,
  /\.map$/,
  /^public\/(images|icons|video|media|fonts)\//,
];

// A file may be right to hold a literal for one rule only: the admin lead page builds
// `line.me/ti/p/~<the lead's own id>`, which is the customer's channel, not the brand's.
const RULE_ALLOW = {
  'src/app/admin/leads/[id]/page.tsx': ['line-url'],
  // These read the config by site id (`sites.tawan`) to test it, which is not the brand name spelled out
  // in prose: the id is the key, and there is no other way to name that entry.
  'src/lib/__tests__/tenant.test.ts': ['brand'],
  'src/lib/__tests__/admin-nav.test.ts': ['brand'],
};

const RULES = [
  { id: 'brand', label: 'brand name', re: /\btawan\b/gi },
  { id: 'domain', label: 'domain / handle', re: /tawanpower/gi },
  { id: 'line-id', label: 'LINE handle', re: /@750iqwoa/g },
  { id: 'line-url', label: 'line.me link', re: /line\.me\/ti/gi },
  { id: 'phone', label: 'phone', re: /082-?828-?9844|086-?954-?9549|080-XXX-XXXX/g },
  { id: 'email', label: 'e-mail', re: /violstam23@/gi },
];

const walk = (dir, out = []) => {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const rel = full.slice(ROOT.length + 1).split('\\').join('/');
    if (SKIP.some((re) => re.test(rel))) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXT.has(extname(name))) out.push(rel);
  }
  return out;
};

// Stage 3 put the name in the copy pack as `{brand}`. A literal here is a sentence that will not
// follow a rename, so this one is a hard failure rather than baseline debt (the baseline covers
// `src` only, and `messages/**` is deliberately outside it).
const copyHits = [];
for (const name of readdirSync(join(ROOT, 'messages')).filter((f) => f.endsWith('.json')).sort()) {
  const hits = readFileSync(join(ROOT, 'messages', name), 'utf8').match(/\btawan\b/gi);
  if (hits?.length) copyHits.push({ file: `messages/${name}`, hits: hits.length });
}

const files = ROOTS.flatMap((r) => walk(join(ROOT, r))).sort();
const current = {};
let total = 0;
for (const rel of files) {
  if (ALLOWED.has(rel)) continue;
  const source = readFileSync(join(ROOT, rel), 'utf8');
  const rules = {};
  let sum = 0;
  for (const rule of RULES) {
    if (RULE_ALLOW[rel]?.includes(rule.id)) continue;
    const hits = source.match(rule.re);
    if (hits && hits.length) {
      rules[rule.id] = hits.length;
      sum += hits.length;
    }
  }
  if (sum) {
    current[rel] = { total: sum, rules };
    total += sum;
  }
}

const previous = existsSync(join(ROOT, BASELINE))
  ? JSON.parse(readFileSync(join(ROOT, BASELINE), 'utf8'))
  : { files: {} };
const previousFiles = previous.files || {};

// Debt is "new" when a file has more hits than the baseline recorded — per rule, so moving a
// literal from one rule to another (e.g. swapping the handle for the link) still shows up.
const regressions = [];
for (const [file, { total: now, rules }] of Object.entries(current)) {
  const was = previousFiles[file];
  if (!was) {
    regressions.push({ file, rule: 'file', now, was: 0 });
    continue;
  }
  for (const [rule, hits] of Object.entries(rules)) {
    const before = was.rules?.[rule] || 0;
    if (hits > before) regressions.push({ file, rule, now: hits, was: before });
  }
}

const paid = Object.keys(previousFiles).filter(
  (f) => !current[f] && !ALLOWED.has(f) && previousFiles[f].total > 0,
);

const json = process.argv.includes('--json');
if (json) {
  console.log(JSON.stringify({ files, debt: current, total, regressions, paid }, null, 2));
} else {
  const top = Object.entries(current)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 12);
  for (const [file, { total: n, rules }] of top) {
    const parts = Object.entries(rules).map(([id, hits]) => `${RULES.find((r) => r.id === id)?.label || id} ${hits}`);
    console.log(`  ${file.padEnd(52)} ${String(n).padStart(3)}  ${parts.join(' · ')}`);
  }
  if (Object.keys(current).length > top.length) {
    console.log(`  … and ${Object.keys(current).length - top.length} more files (--json for the list)`);
  }
  console.log(
    `brand-audit · ${files.length} files scanned · config ${ALLOWED.size} · debt ${Object.keys(current).length} files / ${total} hits` +
      (paid.length ? ` · paid off ${paid.length}` : ''),
  );
  for (const r of regressions) {
    console.log(`  NEW  ${r.file} — ${r.rule} ${r.was} -> ${r.now}`);
  }
  for (const c of copyHits) console.log(`  NAME  ${c.file} — ${c.hits} literal(s), use {brand}`);
  console.log(`GATE - brand literals outside site.config.ts that the baseline did not have: ${regressions.length} (must be 0)`);
  console.log(`GATE - brand name spelled out inside messages/*.json: ${copyHits.length} file(s) (must be 0)`);
}

if (process.argv.includes('--write')) {
  const allowGrowth = process.argv.includes('--force');
  if (regressions.length && !allowGrowth) {
    console.error('refusing to grow the baseline without --force');
    process.exit(1);
  }
  const payload = {
    note: 'Brand literals the config has not absorbed yet. Shrinks with every stage; --write updates it.',
    generated: new Date().toISOString().slice(0, 10),
    config: [...ALLOWED],
    total,
    files: Object.fromEntries(Object.entries(current).sort((a, b) => b[1].total - a[1].total)),
  };
  mkdirSync(dirname(join(ROOT, BASELINE)), { recursive: true });
  writeFileSync(join(ROOT, BASELINE), JSON.stringify(payload, null, 2) + '\n');
  console.log(`baseline written: ${BASELINE} (${Object.keys(current).length} files / ${total} hits)`);
}

// ---- The content half: the same literals, read from the database ----------------------------------
// A file walk cannot see a case description. C2 shipped «ทีมงาน Tawan Power» on Solar 1's landing from
// `solar_cases`, with every gate green. This scans every storefront except the flagship and reports the
// founder's identity inside its rows; the flagship's own rows are its own name, so they are not hits.
// Opt-in (`--db`) because it needs the service key — without it the gate says so and skips.
let dbRows = 0;
let dbBroken = false;
if (process.argv.includes('--db')) {
  const { default: nextEnv } = await import('@next/env');
  nextEnv.loadEnvConfig(ROOT);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log('DB - skipped: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
  } else {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    // Columns worth reading, per table. The rest of a row is ids and dates.
    const COLUMNS = {
      blog_posts: ['title', 'excerpt', 'content', 'meta_title', 'meta_description', 'author'],
      solar_cases: ['case_description', 'customer_quote', 'location_name', 'customer_name'],
      knowledge: ['content'],
      solar_products: ['name', 'model', 'description'],
    };
    const FLAGSHIP = 'tawan';

    for (const [table, columns] of Object.entries(COLUMNS)) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.log(`DB - ${table}: ${error.message}`);
        dbBroken = true;
        continue;
      }
      // Before the tenant migration rows have no `site_id` at all, and `undefined !== 'tawan'` would
      // blame the flagship's own posts. Report the missing column rather than guess.
      if (data?.length && !('site_id' in data[0])) {
        console.log(`DB - ${table}: no site_id column yet — run supabase/migrations/20261120000000_tenant_site_id.sql`);
        dbBroken = true;
        continue;
      }

      for (const row of (data ?? []).filter((r) => r.site_id !== FLAGSHIP)) {
        const found = columns.flatMap((column) =>
          RULES.map((rule) => [column, rule.label, (String(row[column] ?? '').match(rule.re) || []).length])
            .filter(([, , hits]) => hits)
            .map(([name, label, hits]) => `${name} ${label} ${hits}`),
        );
        if (!found.length) continue;
        dbRows += 1;
        console.log(`  ROW  ${table}/${row.slug ?? String(row.id).slice(0, 8)} · ${row.site_id} — ${found.join(' · ')}`);
      }
    }

    console.log(`GATE - database rows of another storefront naming the flagship: ${dbRows} (must be 0)`);
  }
}

process.exit(regressions.length || copyHits.length || dbRows || dbBroken ? 1 : 0);
