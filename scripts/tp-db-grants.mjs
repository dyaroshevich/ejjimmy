// tp-db-grants.mjs — GRANT-зеркало public → tawanpower + диагноз RPC submit_lead.
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
await c.query(`SET search_path = ${SCHEMA}, public`);
log('CONNECTED');

// 1. Зеркалирование грантов (только известные роли приложения)
const grants = (await c.query(`
  SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants
  WHERE table_schema='public' AND grantee IN ('anon','authenticated','service_role')
`)).rows;
let applied = 0;
for (const g of grants) {
  try { await c.query(`GRANT ${g.privilege_type} ON ${SCHEMA}."${g.table_name}" TO ${g.grantee}`); applied++; }
  catch (e) { log(`grant note ${g.table_name}.${g.grantee}.${g.privilege_type}: ${String(e?.message || e).slice(0, 80)}`); }
}
log(`grants mirrored: ${applied}`);

// схемные GRANTы функций anon/authenticated тоже повторим (RPC-функции в схеме)
try {
  const funcs = await c.query(`SELECT routine_name FROM information_schema.routines WHERE routine_schema='${SCHEMA}'`);
  for (const f of funcs.rows) {
    for (const role of ['anon', 'authenticated', 'service_role']) {
      try { await c.query(`GRANT EXECUTE ON FUNCTION ${SCHEMA}."${f.routine_name}"(${''}) TO ${role}`); } catch { }
    }
  }
  log('function grants attempted');
} catch (e) { log('function grants note:', String(e?.message || e).slice(0, 120)); }

// 2. Диагноз leads: сравнение колонок NOT NULL публичной схемы со схемой копии
const pubCols = (await c.query(`SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' ORDER BY ordinal_position`)).rows;
const tpCols = (await c.query(`SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema='${SCHEMA}' AND table_name='leads' ORDER BY ordinal_position`)).rows;
log('--- leads columns diff (public vs tawanpower) ---');
const mapTp = new Map(tpCols.map(r => [r.column_name, r]));
for (const p of pubCols) {
  const t = mapTp.get(p.column_name);
  if (!t) log(`MISSING in ${SCHEMA}: ${p.column_name}`);
  else if (p.is_nullable !== t.is_nullable || (p.column_default || '') !== (t.column_default || ''))
    log(`DIFF ${p.column_name}: public(${p.is_nullable}, ${p.column_default}) tp(${t.is_nullable}, ${t.column_default})`);
}
await c.end();
