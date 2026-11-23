// Verify that content/db/*.json matches a target Supabase project (read-only).
// usage: npm run content:verify -- --target <supabase-url> [--target-key <key>] [--site <site>]
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? null : null;
};

const targetUrl = getArg('--target') || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const targetKey = getArg('--target-key') || process.env.CONTENT_TARGET_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const site = getArg('--site') || process.env.CONTENT_SITE || 'tawan';

if (!targetUrl || !targetKey) {
  console.error('content:verify · --target <supabase-url> and a service role key are required');
  process.exit(1);
}

try { new URL(targetUrl.replace(/\/$/, '')); } catch {
  console.error(`content:verify · invalid target URL: ${targetUrl}`);
  process.exit(1);
}

const supabase = createClient(targetUrl.replace(/\/$/, ''), targetKey, { auth: { persistSession: false } });

const tables = ['solar_products', 'solar_cases', 'blog_posts', 'knowledge'];
const keyFields = {
  solar_products: ['id'],
  solar_cases: ['site_id', 'slug'],
  blog_posts: ['site_id', 'slug'],
  knowledge: ['id'],
};
const keyOf = (row, fields) => fields.map((f) => String(row?.[f] ?? '')).join('\u0000');

let failed = false;

for (const table of tables) {
  const filePath = `content/db/${table}.json`;
  let localRows;
  try {
    localRows = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`content:verify · ${table}: ${err.code === 'ENOENT' ? `file missing (${filePath})` : err.message}`);
    failed = true;
    continue;
  }
  if (!Array.isArray(localRows)) {
    console.error(`content:verify · ${table}: expected a JSON array`);
    failed = true;
    continue;
  }

  const foreign = localRows.filter((r) => r?.site_id !== site);
  if (foreign.length) {
    console.error(`content:verify · ${table}: ${foreign.length} exported row(s) with site_id != ${site}`);
    failed = true;
  }

  let targetRows;
  try {
    const { data, error } = await supabase.from(table).select('*').eq('site_id', site);
    if (error) throw error;
    targetRows = data ?? [];
  } catch (err) {
    console.error(`content:verify · ${table}: fetch failed: ${err.message}`);
    failed = true;
    continue;
  }

  if (localRows.length !== targetRows.length) {
    console.error(`content:verify · ${table}: count mismatch (exported ${localRows.length}, target ${targetRows.length})`);
    failed = true;
  } else {
    console.log(`content:verify · ${table}: counts match (${localRows.length})`);
  }

  const fields = keyFields[table];
  const localKeys = new Set(localRows.map((r) => keyOf(r, fields)));
  const targetKeys = new Set(targetRows.map((r) => keyOf(r, fields)));
  const missing = localKeys.size - [...localKeys].filter((k) => targetKeys.has(k)).length;
  const extra = targetKeys.size - [...targetKeys].filter((k) => localKeys.has(k)).length;
  if (missing || extra) {
    if (missing) console.error(`content:verify · ${table}: ${missing} exported row(s) missing in target`);
    if (extra) console.error(`content:verify · ${table}: ${extra} target row(s) not in export`);
    failed = true;
  } else if (localRows.length > 0) {
    console.log(`content:verify · ${table}: key sets match`);
  }
}

console.log(failed ? 'content:verify: FAILED' : 'content:verify: ok');
if (failed) process.exit(1);