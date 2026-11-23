// tp-db-init3.mjs — завершение инициализации схемы tawanpower (план «Б»).
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
const password = envRestore.SUPABASE_DB_PASSWORD;
const dsn = `postgres://postgres.${ref}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
const c = new pg.Client({ connectionString: dsn, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`SET search_path = ${SCHEMA}, public, extensions`);
log('CONNECTED');

// 1. Констрейнт solar_products: снести миграционный узкий, поставить как в живой public
try {
  const live = (await c.query(`SELECT pg_get_constraintdef(oid) AS def, conname FROM pg_constraint WHERE conrelid='public.solar_products'::regclass AND contype='c'`)).rows;
  for (const co of live) {
    try { await c.query(`ALTER TABLE ${SCHEMA}.solar_products DROP CONSTRAINT IF EXISTS solar_products_type_check`); } catch { }
    try {
      await c.query(`ALTER TABLE ${SCHEMA}.solar_products ADD CONSTRAINT ${co.conname} ${co.def.replace(/\bCHECK\b/i, 'CHECK')}`);
      log('constraint copied:', co.conname, co.def.slice(0, 120));
      break;
    } catch (e) { log('constraint note:', String(e?.message || e).slice(0, 140)); }
  }
} catch (e) { log('constraint step:', String(e?.message || e).slice(0, 140)); }

// 2. Каталог товаров (пересечение колонок, повторно — теперь констрейнт снят/правильный)
try {
  const pc = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='solar_products' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
  const tc = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='${SCHEMA}' AND table_name='solar_products' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
  const common = pc.filter(x => tc.includes(x));
  const collist = common.map(x => `"${x}"`).join(',');
  await c.query(`INSERT INTO ${SCHEMA}.solar_products (${collist}) SELECT ${collist} FROM public.solar_products ON CONFLICT DO NOTHING`);
  log('copy solar_products OK');
} catch (e) { log('copy solar_products FAIL:', String(e?.message || e).slice(0, 220)); }

// 3. Доставить сиды, которые упали парсером: скопировать строки по слагам из живой public.blog_posts
const seedDir = join(ROOT, 'supabase');
for (const f of ['seed_blog_article_7.sql', 'seed_blog_article_10.sql', 'seed_blog_article_11.sql']) {
  try {
    const txt = readFileSync(join(seedDir, f), 'utf8');
    const slugs = [...txt.matchAll(/slug\s*=\s*'([^']+)/g)].map(m => m[1]);
    for (const s of slugs) {
      const cols = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='blog_posts' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
      const tpCols = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='${SCHEMA}' AND table_name='blog_posts' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
      const collist = cols.filter(x => tpCols.includes(x)).map(x => `"${x}"`).join(',');
      await c.query(`INSERT INTO ${SCHEMA}.blog_posts (${collist}) SELECT ${collist} FROM public.blog_posts WHERE slug=$1 ON CONFLICT (slug) DO NOTHING`, [s]);
      log('seed-copy ok:', f, s);
    }
  } catch (e) { log('seed-copy FAIL:', f, String(e?.message || e).slice(0, 200)); }
}

// 4. RLS + политики: enable везде, отсутствующие — скопировать из public
try {
  const tables = (await c.query(`SELECT tablename FROM pg_tables WHERE schemaname='${SCHEMA}'`)).rows.map(r => r.tablename);
  let copied = 0, enabled = 0;
  for (const t of tables) {
    try { await c.query(`ALTER TABLE ${SCHEMA}.${t} ENABLE ROW LEVEL SECURITY`); enabled++; } catch { }
    const pub = (await c.query(`SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename=$1`, [t])).rows;
    const tp = (await c.query(`SELECT count(*)::int AS n FROM pg_policies WHERE schemaname='${SCHEMA}' AND tablename=$1`, [t])).rows[0].n;
    if (tp === 0) {
      for (const p of pub) {
        let sql = `CREATE POLICY "${p.policyname}" ON ${SCHEMA}.${t} FOR ${p.cmd}`;
        if (p.roles && p.roles.length) sql += ` TO ${p.roles.join(', ')}`;
        if (p.qual && p.qual !== 'true') sql += ` USING (${p.qual})`;
        if (p.with_check && p.with_check !== 'true') sql += ` WITH CHECK (${p.with_check})`;
        try { await c.query(sql); copied++; } catch (e) { log(`policy note ${t}: ${String(e?.message || e).slice(0, 90)}`); }
      }
    }
  }
  log(`RLS: enabled on ${enabled}/${tables.length}; policies copied: ${copied}`);
} catch (e) { log('rls pass FAIL:', String(e?.message || e).slice(0, 200)); }

// 5. Гранты из public (coarse): anon/authenticated/service_role как на живой таблице
try {
  const priv = (await c.query(`SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name='leads'`)).rows;
  for (const g of priv) {
    try { await c.query(`GRANT ${g.privilege_type} ON ${SCHEMA}.leads TO ${g.grantee}`); } catch { }
  }
  log('grants for leads mirrored');
} catch (e) { log('grants note:', String(e?.message || e).slice(0, 120)); }

// 6. Итог
const cnt = {};
for (const t of ['solar_products', 'blog_posts', 'solar_cases', 'knowledge', 'leads', 'partners', 'content_pipeline', 'audit_log', 'research_documents']) {
  try { cnt[t] = (await c.query(`SELECT count(*)::int AS n FROM ${SCHEMA}.${t}`)).rows[0].n; } catch { cnt[t] = '—'; }
}
const tables = (await c.query(`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='${SCHEMA}' AND table_type='BASE TABLE'`)).rows[0].n;
const funcs = (await c.query(`SELECT count(*)::int AS n FROM information_schema.routines WHERE routine_schema='${SCHEMA}'`)).rows[0].n;
log('--- FINAL SUMMARY ---');
log(`tables: ${tables}; functions: ${funcs}`);
log('counts:', JSON.stringify(cnt));
await c.end();
