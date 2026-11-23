// tp-rpc-diag.mjs — полная ошибка RPC, identity-колонки, копия VIEW enriched_solar_products.
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
const ref = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];
const c = new pg.Client({ connectionString: `postgres://postgres.${ref}:${encodeURIComponent(envRestore.SUPABASE_DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1. identity у leads (public vs tp)
for (const schema of ['public', SCHEMA]) {
  const r = await c.query(`SELECT column_name, is_identity, identity_generation, column_default FROM information_schema.columns WHERE table_schema=$1 AND table_name='leads' AND (is_identity='YES' OR column_default LIKE '%nextval%')`, [schema]);
  log(`identity/serial cols in ${schema}.leads:`, JSON.stringify(r.rows));
}

// 2. Полный текст ошибки RPC через REST (без огрезки)
const r = await fetch(`${url}/rest/v1/rpc/submit_lead`, {
  method: 'POST',
  headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json', 'Content-Profile': SCHEMA },
  body: JSON.stringify({ p_name: 'TEST TP diag', p_phone: '+660000000002', p_source: 'e2e-check' }),
});
const j = await r.json();
log('RPC full response:', r.status, JSON.stringify(j));

// 3. VIEW enriched_solar_products → копия в tawanpower (ссылку на solar_products переводим на схему)
try {
  const v = await c.query(`SELECT pg_get_viewdef('public.enriched_solar_products'::regclass, true) AS def`);
  const def = v.rows[0]?.def || '';
  if (def) {
    let sql = `CREATE OR REPLACE VIEW ${SCHEMA}.enriched_solar_products AS ` + def
      .replace(/\bpublic\.([a-z0-9_"]+)/g, `${SCHEMA}.$1`);
    try {
      await c.query(sql);
      await c.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${SCHEMA}.enriched_solar_products TO anon, authenticated, service_role`).catch ? await c.query(`GRANT SELECT ON ${SCHEMA}.enriched_solar_products TO anon, authenticated, service_role`) : null;
      log('view enriched_solar_products: copied');
    } catch (e) { log('view copy FAIL:', String(e?.message || e).slice(0, 200)); }
  } else log('view def empty?! exists in public?', await c.query(`SELECT to_regclass('public.enriched_solar_products')`));
} catch (e) { log('view note:', String(e?.message || e).slice(0, 120)); }

try {
  await c.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${SCHEMA}.enriched_solar_products TO anon, authenticated, service_role`);
  log('view grants ok');
} catch (e) { log('view grants note:', String(e?.message || e).slice(0, 120)); }

await c.end();
