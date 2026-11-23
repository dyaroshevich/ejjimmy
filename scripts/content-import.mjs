// Import content/db/*.json into a target Supabase project.
// usage: npm run content:import -- --target <supabase-url> [--target-key <key>] [--site <site>] [--dry-run]
// Refuses to write to the current (prod) project URL. --dry-run validates without writing.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? null : null;
};

const targetUrl = getArg('--target');
const targetKey = getArg('--target-key') || process.env.CONTENT_TARGET_SERVICE_ROLE_KEY;
const site = getArg('--site') || process.env.CONTENT_SITE || 'tawan';
const dryRun = args.includes('--dry-run');

if (!targetUrl || !targetKey) {
  console.error('content:import · --target <supabase-url> and a service role key are required');
  process.exit(1);
}

const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gfdbmxhtvhivoztgckit.supabase.co';
let targetOrigin, currentOrigin;
try {
  targetOrigin = new URL(targetUrl.replace(/\/$/, '')).origin;
  currentOrigin = new URL(currentUrl.replace(/\/$/, '')).origin;
} catch {
  console.error('content:import · invalid URL');
  process.exit(1);
}
if (targetOrigin === currentOrigin) {
  console.error('content:import · refusing to write to the current (prod) project URL');
  process.exit(1);
}

const supabase = createClient(targetUrl.replace(/\/$/, ''), targetKey, { auth: { persistSession: false } });

const tables = ['solar_products', 'solar_cases', 'blog_posts', 'knowledge'];
const conflictMap = {
  solar_products: 'id',
  solar_cases: 'site_id,slug',
  blog_posts: 'site_id,slug',
  knowledge: 'id',
};

for (const table of tables) {
  const filePath = `content/db/${table}.json`;
  let rows;
  try {
    rows = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`content:import · ${table}: file missing, skipped`);
      continue;
    }
    console.error(`content:import · ${table}: ${err.message}`);
    process.exit(1);
  }
  if (!Array.isArray(rows)) {
    console.error(`content:import · ${table}: expected a JSON array`);
    process.exit(1);
  }
  if (rows.length === 0) {
    console.log(`content:import · ${table}: 0 row(s), skipped`);
    continue;
  }

  const foreign = rows.filter((r) => r?.site_id !== site);
  if (foreign.length) {
    console.error(`content:import · ${table}: ${foreign.length} row(s) with site_id != ${site}`);
    process.exit(1);
  }

  if (dryRun) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('site_id', site);
    if (error) {
      console.error(`content:import · ${table}: target count failed: ${error.message}`);
      process.exit(1);
    }
    console.log(`content:import · ${table}: dry-run would upsert ${rows.length} row(s) (target currently ${count ?? 0})`);
    continue;
  }

  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflictMap[table] });
  if (error) {
    console.error(`content:import · ${table}: ${error.message}`);
    process.exit(1);
  }
  console.log(`content:import · ${table}: ${rows.length} row(s) imported`);
}

console.log(dryRun ? 'content:import: dry-run done' : 'content:import: done');