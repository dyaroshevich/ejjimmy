// tp-e2e-check.mjs — e2e после тоггла Exposed schemas.
// 1) REST профиль Read каталога, 2) RPC submit_lead (создаёт тест-лид), 3) удаление тест-лида через pg.
// Секреты не печатаются. Запуск: node scripts/tp-e2e-check.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const log = (...a) => console.log(...a);
const SCHEMA = 'tawanpower';
function envOf(file) {
  try {
    const out = {};
    for (const line of readFileSync(join(ROOT, file), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
    return out;
  } catch { return {}; }
}
const envLocal = envOf('.env.local');
const envRestore = envOf('.env.restore');
const url = envLocal.NEXT_PUBLIC_SUPABASE_URL;
const anon = envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY || envLocal.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 1. Каталог через профиль схемы
{
  const r = await fetch(`${url}/rest/v1/solar_products?select=id,price_thb&limit=5`, { headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Accept-Profile': SCHEMA } });
  const j = await r.json();
  if (Array.isArray(j)) log(`1) catalog via profile: HTTP ${r.status}, rows=${j.length}, sample=${JSON.stringify(j[0])}`);
  else log(`1) catalog FAIL: HTTP ${r.status} ${JSON.stringify(j).slice(0, 160)}`);
}

// 2. RPC submit_lead (аним — как делает браузерная лид-форма)
const testPhone = '+660000000001';
{
  const r = await fetch(`${url}/rest/v1/rpc/submit_lead`, {
    method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json', 'Content-Profile': SCHEMA },
    body: JSON.stringify({ p_name: 'TEST TP e2e (delete me)', p_phone: testPhone, p_source: 'e2e-check' }),
  });
  const j = await r.json();
  log(`2) rpc submit_lead: HTTP ${r.status} -> ${JSON.stringify(j).slice(0, 260)}`);
  if (j?.phone === testPhone || j?.name?.includes('TEST TP')) {
    const ref = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];
    const c = new pg.Client({ connectionString: `postgres://postgres.${ref}:${encodeURIComponent(envRestore.SUPABASE_DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`, ssl: { rejectUnauthorized: false } });
    await c.connect();
    const d = await c.query(`DELETE FROM ${SCHEMA}.leads WHERE phone = $1 AND source = 'e2e-check' RETURNING id`, [testPhone]);
    log(`3) cleanup: deleted ${d.rowCount} test lead(s)`);
    await c.end();
  }
}
log('E2E done');
