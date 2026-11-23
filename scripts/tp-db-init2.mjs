// tp-db-init2.mjs — второй проход плана «Б»:
//  1) создание в tawanpower недостающих таблиц структурой == public (leads и др. дажебез git-миграций),
//  2) повтор неудавшихся миграций, 3) сиды теперь в схему (public.->tawanpower.), 4) копия каталога,
//  5) RLS + политики + индексы из живой public в tawanpower.
// Секреты не печатаются. Запуск: node scripts/tp-db-init2.mjs
import { readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const log = (...a) => console.log(...a);
const SCHEMA = 'tawanpower';
const WAIVED = new Set(['20261005000002_security_hardening.sql']); // затрагивает общую public-функцию exec_sql; потому waive
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
const password = envRestore.SUPABASE_DB_PASSWORD;
const dsn = `postgres://postgres.${ref}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
const c = new pg.Client({ connectionString: dsn, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`SET search_path = ${SCHEMA}, public, extensions`);
log('CONNECTED');

function adapt(sql) {
  let s = sql;
  s = s.replace(/^BEGIN;|COMMIT;/g, '');
  s = s.replace(/\bpublic\.((?=[a-z_])[a-z0-9_."]+)/g, `${SCHEMA}.$1`);
  s = s.replace(/SET search_path\s*=\s*public\b/gi, `SET search_path = ${SCHEMA}`);
  return s;
}

// ---------- 1. Список таблиц public и недостающих в tawanpower ----------
const pubTables = (await c.query(`SELECT c.relname AS t FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p')`)).rows.map(r => r.t);
const tpExisting = new Set((await c.query(`SELECT c.relname AS t FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname='${SCHEMA}' AND c.relkind IN ('r','p')`)).rows.map(r => r.t));
const missing = pubTables.filter(t => !tpExisting.has(t));
log(`public tables: ${pubTables.length}; missing in ${SCHEMA}: ${missing.length} -> ${missing.join(', ')}`);

// ---------- 2. DDL-copy недостающих таблиц ----------
for (const t of missing) {
  const cols = (await c.query(`SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS typ, a.attnotnull, pg_get_expr(ad.adbin, ad.adrelid) AS def, a.attidentity
      FROM pg_attribute a
      JOIN pg_class cl ON cl.oid=a.attrelid JOIN pg_namespace ns ON ns.oid=cl.relnamespace
      LEFT JOIN pg_attrdef ad ON ad.adrelid=a.attrelid AND ad.adnum=a.attnum
      WHERE ns.nspname='public' AND cl.relname=$1 AND a.attnum>0 AND NOT a.attisdropped
      ORDER BY a.attnum`, [t])).rows;
  const pk = (await c.query(`SELECT string_agg(att.attname, ',' ORDER BY att.attnum) AS cols FROM pg_index idx
      JOIN pg_class pl ON pl.oid=idx.indrelid JOIN pg_namespace ns ON ns.oid=pl.relnamespace
      JOIN pg_attribute att ON att.attrelid=idx.indrelid AND att.attnum=ANY(idx.indkey::smallint[])
      WHERE ns.nspname='public' AND pl.relname=$1 AND idx.indisprimary`, [t])).rows[0]?.cols;
  const defs = [];
  for (const col of cols) {
    let d = `"${col.attname}" ${col.typ}`;
    if (col.attnotnull) d += ' NOT NULL';
    if (col.def) {
      let defExpr = col.def.replace(/nextval\('public\.([^']+)'::regclass\)/, `nextval('${SCHEMA}.$1')`);
      if (/nextval\(/.test(defExpr)) {
        const seqName = defExpr.match(/nextval\('([^']+)'\)/)?.[1];
        const seq = seqName.split('.').pop();
        defs.push(`CREATE SEQUENCE IF NOT EXISTS ${SCHEMA}.${seq} START 1 OWNED BY NONE`);
        defExpr = defExpr.replace(/'public\./, `'${SCHEMA}.`);
      }
      d += ` DEFAULT ${defExpr}`;
    }
    defs.push(d);
  }
  if (pk) defs.push(`PRIMARY KEY (${pk.split(',').map(x => '"' + x.trim() + '"').join(',')})`);
  const sql = `CREATE TABLE IF NOT EXISTS ${SCHEMA}.${t} (\n  ${defs.join(',\n  ')}\n)`;
  try { await c.query(sql); log(`table ${t}: created`); }
  catch (e) { log(`table ${t}: FAIL ${String(e?.message || e).slice(0, 200)}`); }
}

// индексы (не-PK): уникальность нужна для ON CONFLICT сидов
for (const t of missing) {
  const idxs = (await c.query(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1`, [t])).rows;
  for (const ix of idxs) {
    if (/\bUSING\s+hash\b/i.test(ix.indexdef)) continue;
    const def = ix.indexdef.replace(/ON\s+public\./, `ON ${SCHEMA}.`).replace(/USING\s+([a-z]+)\s+\("/i, 'USING $1 (').replace(/USING\s+btree\s+\(/, '(');
    try { await c.query(def); } catch (e) { log(`  idx ${ix.indexname}: note ${String(e?.message || e).slice(0, 100)}`); }
  }
}
// внешние ключи между уже созданными таблицами tawanpower (best-effort)
for (const t of missing) {
  const fks = (await c.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = 'public.${t}'::regclass AND contype='f'`)).rows;
  for (const fk of fks) {
    const def = fk.def.replace(/REFERENCES\s+public\./, `REFERENCES ${SCHEMA}.`);
    try { await c.query(`ALTER TABLE ${SCHEMA}.${t} ADD CONSTRAINT ${fk.conname} ${def}`); }
    catch (e) { log(`  fk ${t}.${fk.conname}: skipped (${String(e?.message || e).slice(0, 100)})`); }
  }
}

// ---------- 3. Повтор неудавшихся миграций (до 3 проходов) ----------
const migDir = join(ROOT, 'supabase', 'migrations');
const initialMis = ['20260316000000_add_leads_columns.sql', '20260316000001_fix_leads_final.sql', '20260517000000_fix_leads_rls.sql', '20260518000000_pwa_admin_evolution.sql', '20260530000000_proposal_snapshots.sql', '20260609_create_calendar_table.sql', '20260609_create_rag_schema.sql', '20260618000000_create_audit_log.sql', '20261006000002_partners_referrals.sql', '20261006000003_lead_submit_rpc.sql', '20261006000003_partner_paid.sql'];
for (let pass = 1; pass <= 3; pass++) {
  const still = [];
  for (const f of initialMis) {
    if (WAIVED.has(f)) continue;
    const r = await runFile(join(migDir, f));
    log(`pass${pass} ${r.ok ? 'ok  ' : 'FAIL'} ${f}` + (r.ok ? '' : `: ${r.error}`));
    if (!r.ok) still.push(f);
  }
  if (still.length === 0) break;
  initialMis.length = 0; initialMis.push(...still);
}

async function runFile(file) {
  let sql = adapt(readFileSync(file, 'utf8'));
  await c.query('BEGIN');
  try { await c.query(sql); await c.query('COMMIT'); return { ok: true }; }
  catch (e) { try { await c.query('ROLLBACK'); } catch { }; return { ok: false, error: String(e?.message || e).split('\n')[0].slice(0, 220) }; }
}

// ---------- 4. Сиды → в схему ----------
const seedDir = join(ROOT, 'supabase');
const seeds = readdirSync(seedDir).filter(f => /^seed_.*\.sql$/.test(f)).sort();
const seedMis = [];
for (const f of seeds) {
  const r = await runFile(join(seedDir, f));
  log(`seed ${r.ok ? 'ok  ' : 'FAIL'} ${f}` + (r.ok ? '' : `: ${r.error}`));
  if (!r.ok) seedMis.push(f);
}
// неудавшиеся 7/10/11: копируем их строки из живой public (контент там тот же TP)
if (seedMis.length) {
  for (const f of seedMis) {
    const txt = readFileSync(join(seedDir, f), 'utf8');
    const slugs = [...txt.matchAll(/slug\s*=\s*'([^']+)'/g)].map(m => m[1]);
    if (!slugs.length) continue;
    for (const s of slugs) {
      try {
        const cols = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='blog_posts'`)).rows.map(r => r.column_name);
        const collist = cols.map(x => `"${x}"`).join(',');
        await c.query(`INSERT INTO ${SCHEMA}.blog_posts (${collist}) SELECT ${collist} FROM public.blog_posts WHERE slug=$1 ON CONFLICT (slug) DO NOTHING`, [s]);
        log(`  seed-copy ${f} slug=${s}`);
      } catch (e) { log(`  seed-copy ${f}: ${String(e?.message || e).slice(0, 160)}`); }
    }
  }
}

// ---------- 5. Каталог товаров (пересечение колонок) ----------
try {
  const pc = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='solar_products' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
  const tc = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='${SCHEMA}' AND table_name='solar_products' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
  const common = pc.filter(x => tc.includes(x));
  const collist = common.map(x => `"${x}"`).join(',');
  await c.query(`INSERT INTO ${SCHEMA}.solar_products (${collist}) SELECT ${collist} FROM public.solar_products ON CONFLICT DO NOTHING`);
  log('copy solar_products done');
} catch (e) { log('copy solar_products: ' + String(e?.message || e).slice(0, 200)); }

// ---------- 6. RLS + политики из живой public ----------
const ply = (await c.query(`SELECT schemaname='public' AND 1=1 OR false`)).catch(() => null);
try {
  const enabled = (await c.query(`SELECT tablename FROM pg_tables WHERE schemaname='${SCHEMA}'`)).rows.map(r => r.tablename);
  for (const t of enabled) {
    try { await c.query(`ALTER TABLE ${SCHEMA}.${t} ENABLE ROW LEVEL SECURITY`); } catch { }
    const pub = (await c.query(`SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename=$1`, [t])).rows;
    const tp = (await c.query(`SELECT count(*)::int AS n FROM pg_policies WHERE schemaname='${SCHEMA}' AND tablename=$1`, [t])).rows[0].n;
    for (const p of pub) {
      if (tp > 0) break; // политики уже миграциями созданы — не дублируем под другие имена
      let sql = `CREATE POLICY "${p.policyname}" ON ${SCHEMA}.${t} FOR ${p.cmd}`;
      if (p.roles.length) sql += ` TO ${p.roles.join(', ')}`;
      if (p.qual && p.qual !== 'true') sql += ` USING (${p.qual})`;
      if (p.with_check && p.with_check !== 'true') sql += ` WITH CHECK (${p.with_check})`;
      try { await c.query(sql); } catch (e) { log(`  policy ${t}.${p.policyname}: ${String(e?.message || e).slice(0, 100)}`); }
    }
  }
  log('RLS + policies done');
} catch (e) { log('rls pass: ' + String(e?.message || e).slice(0, 200)); }

// ---------- 7. Итог ----------
const s = {};
for (const t of ['solar_products', 'blog_posts', 'solar_cases', 'knowledge', 'leads', 'partners', 'content_pipeline', 'audit_log']) {
  try { s[t] = (await c.query(`SELECT count(*)::int AS n FROM ${SCHEMA}.${t}`)).rows[0].n; } catch { s[t] = '—'; }
}
const tables = (await c.query(`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='${SCHEMA}' AND table_type='BASE TABLE'`)).rows[0].n;
log('--- SUMMARY ---');
log(`tables: ${tables}; counts: ` + JSON.stringify(s));
await c.end();
