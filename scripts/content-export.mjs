// Dump the current project's content into content/db/*.json.
// usage: npm run content:export
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('content:export · missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const site = process.env.CONTENT_SITE || 'tawan';
const tables = ['solar_products', 'solar_cases', 'blog_posts', 'knowledge'];
const pageSize = 1000;

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function fetchAll(table) {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('site_id', site)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < pageSize) break;
  }
  return rows;
}

mkdirSync('content/db', { recursive: true });

for (const table of tables) {
  let rows;
  try {
    rows = await fetchAll(table);
  } catch (err) {
    console.error(`content:export · ${table}: ${err.message}`);
    process.exit(1);
  }
  writeFileSync(`content/db/${table}.json`, JSON.stringify(rows, null, 2) + '\n');
  console.log(`content:export · ${table}: ${rows.length} row(s)`);
}

console.log('content:export: done');