// Ties the three halves of tenant isolation together, so they cannot drift apart silently.
//
// One database serves three companies, and the isolation lives in two places that never import each
// other: the SQL migration (the column, the insert trigger, the RLS policies the browser client relies
// on) and `src/lib/tenant.ts` (the filter every server query goes through). A table added to one list and
// forgotten in the other is exactly the kind of gap that looks fine until a franchisee opens `/admin`.
//
//   node scripts/tenant-audit.mjs
//
// It also catches the two ways a query escapes the scope: a raw `@supabase/supabase-js` client in a
// page, and importing the service-role or one-off client from the module that does not wrap it.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const MIGRATIONS = [
  'supabase/migrations/20261120000000_tenant_site_id.sql',
  'supabase/migrations/20261120000001_tenant_partner_config.sql',
];
const TENANT = 'src/lib/tenant.ts';

const read = (path) => readFileSync(path, 'utf8');

/** The code's list: `new Set([ 'leads', ... ])` in src/lib/tenant.ts. */
const codeTables = (() => {
  const block = /TENANT_TABLES[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/.exec(read(TENANT))?.[1];
  if (!block) throw new Error(`could not find TENANT_TABLES in ${TENANT}`);
  return [...block.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
})();

/** The migrations' lists: `tenant_tables text[] := array[ 'leads', ... ]`, one per file. */
const sqlTables = [
  ...new Set(
    MIGRATIONS.flatMap((path) => {
      const blocks = [...read(path).matchAll(/tenant_tables\s+text\[\]\s*:=\s*array\[([\s\S]*?)\]/g)];
      if (!blocks.length) throw new Error(`could not find tenant_tables in ${path}`);
      return blocks.flatMap((block) => [...block[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]));
    })
  ),
].sort();

const failures = [];
const fail = (message) => failures.push(message);

const onlyCode = codeTables.filter((t) => !sqlTables.includes(t));
const onlySql = sqlTables.filter((t) => !codeTables.includes(t));
if (onlyCode.length) fail(`${TENANT} scopes tables the migration never adds a column to: ${onlyCode.join(', ')}`);
if (onlySql.length) fail(`the migrations add site_id to tables the code never filters: ${onlySql.join(', ')}`);

// A raw client in a page has no site, and the service-role client bypasses RLS — both are escapes.
const ALLOWED_RAW = new Set([
  // Build-time param generation: runs before any request exists, reads published rows only.
  'src/app/blog/[slug]/page.tsx',
  'src/app/cases/[slug]/page.tsx',
]);
const WRAPPERS = new Set(['src/lib/supabase.ts', 'src/lib/supabase-admin.ts', 'src/lib/supabase-server.ts', 'src/lib/tenant.ts']);

const grep = (pattern) => {
  try {
    return execFileSync('git', ['grep', '-n', '-E', pattern, '--', 'src'], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
};

// A `require()` inside a function is the same escape as a static import, and easier to miss.
for (const line of grep("require\\('@supabase/supabase-js'\\)")) {
  const file = line.split(':')[0];
  if (WRAPPERS.has(file)) continue;
  fail(`${file}: builds a raw supabase client with require() — use createScopedClient`);
}

for (const line of grep("from '@supabase/supabase-js'")) {
  const file = line.split(':')[0];
  if (ALLOWED_RAW.has(file) || WRAPPERS.has(file)) continue;
  fail(`${file}: builds a raw supabase client — import createScopedClient from '@/lib/supabase-server'`);
}

for (const line of grep("(createScopedClient|supabaseAdmin).*from '(\\./|@/lib/)supabase'")) {
  const file = line.split(':')[0];
  if (WRAPPERS.has(file)) continue;
  fail(`${file}: gets an unscoped client — use '@/lib/supabase-server' or '@/lib/supabase-admin'`);
}

// Visibility, not a verdict: which tables the app touches, so a new one is a deliberate omission.
const calls = grep(`from\\('(${codeTables.join('|')})'\\)`);
const counts = new Map();
for (const line of calls) {
  const table = /from\('([a-z_]+)'\)/.exec(line)?.[1];
  if (table) counts.set(table, (counts.get(table) ?? 0) + 1);
}

console.log(`tenant tables · code ${codeTables.length} · migration ${sqlTables.length}`);
console.log(
  [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([table, n]) => `  ${table.padEnd(26)} ${n} call site(s)`)
    .join('\n')
);
const untouched = codeTables.filter((t) => !counts.has(t));
if (untouched.length) console.log(`  (no call sites yet: ${untouched.join(', ')})`);

if (failures.length) {
  console.error(`\nFAIL ${failures.length} tenant gap(s):`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}
console.log('\nPASS table lists agree, and no query escapes the scope');
