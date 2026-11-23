// tp-id-fix.mjs — воспроизведение identity/serial-колонок в tawanpower по образцу public.
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
const ref = (envLocal.NEXT_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
const c = new pg.Client({ connectionString: `postgres://postgres.${ref}:${encodeURIComponent(envRestore.SUPABASE_DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
await c.connect();

const pub = (await c.query(`SELECT table_name t, column_name col, is_identity, identity_generation, column_default FROM information_schema.columns WHERE table_schema='public' AND (is_identity='YES' OR column_default LIKE '%nextval('||chr(39)||'%')`)).rows;
for (const p of pub) {
  // только таблицы, существующие в tawanpower
  const ex = await c.query(`SELECT 1 FROM information_schema.tables WHERE table_schema='${SCHEMA}' AND table_name=$1`, [p.t]);
  if (!ex.rows.length) { log(`skip ${p.t}.${p.col} (no table in ${SCHEMA})`); continue; }
  if (p.is_identity === 'YES') {
    try {
      await c.query(`ALTER TABLE ${SCHEMA}.${p.t} ALTER COLUMN "${p.col}" ADD GENERATED ${p.identity_generation} AS IDENTITY`);
      log(`identity added: ${p.t}.${p.col} (${p.identity_generation})`);
    } catch (e) { log(`${p.t}.${p.col}: ${String(e?.message || e).slice(0, 120)}`); }
  } else if (/nextval\([^)]*regclass\)/.test(p.column_default)) {
    // serial: sequence уже создана DDL-copy (default переписан). Проверим default в tp
    const t = await c.query(`SELECT column_default FROM information_schema.columns WHERE table_schema='${SCHEMA}' AND table_name=$1 AND column_name=$2`, [p.t, p.col]);
    if (!t.rows[0]?.column_default) {
      try {
        await c.query(`CREATE SEQUENCE IF NOT EXISTS ${SCHEMA}.${p.t}_${p.col}_seq OWNED BY ${SCHEMA}.${p.t}."${p.col}"`);
        await c.query(`ALTER TABLE ${SCHEMA}.${p.t} ALTER COLUMN "${p.col}" SET DEFAULT nextval('${SCHEMA}.${p.t}_${p.col}_seq')`);
        log(`serial default added: ${p.t}.${p.col}`);
      } catch (e) { log(`${p.t}.${p.col}: ${String(e?.message || e).slice(0, 120)}`); }
    }
  }
}
const leads = await c.query(`SELECT count(*)::int AS n FROM ${SCHEMA}.leads`);
log('leads rows:', leads.rows[0].n);
await c.end();
