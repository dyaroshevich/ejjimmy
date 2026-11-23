// tp-db-init4.mjs — RLS-политики (аккуратно), blog slug checkpoint, бакеты, тест PostgREST-профиля.
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
const url = envLocal.NEXT_PUBLIC_SUPABASE_URL;
const anon = envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY || envLocal.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const dsn = `postgres://postgres.${ref}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
const c = new pg.Client({ connectionString: dsn, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`SET search_path = ${SCHEMA}, public, extensions`);
log('CONNECTED');

// 1. RLS (аккуратно: roles может прийти как массив или строка)
const rolesOf = (r) => Array.isArray(r) ? r : (typeof r === 'string' ? r.replace(/[\{\}"\s]/g, '').split(',').filter(Boolean) : []);
const tables = (await c.query(`SELECT tablename FROM pg_tables WHERE schemaname='${SCHEMA}'`)).rows.map(r => r.tablename);
let enabled = 0, copied = 0;
for (const t of tables) {
  try { await c.query(`ALTER TABLE ${SCHEMA}.${t} ENABLE ROW LEVEL SECURITY`); enabled++; } catch { }
  const tp = (await c.query(`SELECT count(*)::int AS n FROM pg_policies WHERE schemaname='${SCHEMA}' AND tablename=$1`, [t])).rows[0].n;
  if (tp === 0) {
    const pub = (await c.query(`SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename=$1`, [t])).rows;
    for (const p of pub) {
      let sql = `CREATE POLICY "${p.policyname}" ON ${SCHEMA}.${t} FOR ${p.cmd}`;
      const roles = rolesOf(p.roles);
      if (roles.length) sql += ` TO ${roles.join(', ')}`;
      if (p.qual && p.qual !== 'true') sql += ` USING (${p.qual})`;
      if (p.with_check && p.with_check !== 'true') sql += ` WITH CHECK (${p.with_check})`;
      try { await c.query(sql); copied++; } catch (e) { log(`policy note ${t}.${p.policyname}: ${String(e?.message || e).slice(0, 90)}`); }
    }
  }
}
log(`RLS: enabled on ${enabled}/${tables.length}, policies copied: ${copied}`);

// 2. Слаги блога в схеме и весь набор догнать из живой public (TP-контент тот же)
const blogCols = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='blog_posts' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
const tpBlogCols = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='${SCHEMA}' AND table_name='blog_posts' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
const collist = blogCols.filter(x => tpBlogCols.includes(x)).map(x => `"${x}"`).join(',');
const liveSlugs = (await c.query(`SELECT slug FROM public.blog_posts ORDER BY created_at`)).rows.map(r => r.slug);
let added = 0;
for (const s of liveSlugs) {
  const r = await c.query(`SELECT 1 FROM ${SCHEMA}.blog_posts WHERE slug=$1`, [s]);
  if (!r.rows.length) {
    try { await c.query(`INSERT INTO ${SCHEMA}.blog_posts (${collist}) SELECT ${collist} FROM public.blog_posts WHERE slug=$1`, [s]); added++; }
    catch (e) { log('blog copy note:', s, String(e?.message || e).slice(0, 100)); }
  }
}
const bp = (await c.query(`SELECT count(*)::int AS n FROM ${SCHEMA}.blog_posts`)).rows[0].n;
log(`blog_posts in ${SCHEMA}: ${bp} (added from live: ${added})`);

for (const [tbl] of [['solar_cases']].map(x => x)) {
  const c1 = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${tbl}' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
  const c2 = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='${SCHEMA}' AND table_name='${tbl}' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
  const cl = c1.filter(x => c2.includes(x)).map(x => `"${x}"`).join(',');
  const live = (await c.query(`SELECT count(*)::int AS n FROM public.${tbl}`)).rows[0].n;
  const have = (await c.query(`SELECT count(*)::int AS n FROM ${SCHEMA}.${tbl}`)).rows[0].n;
  if (live > have) { await c.query(`INSERT INTO ${SCHEMA}.${tbl} (${cl}) SELECT ${cl} FROM public.${tbl} ON CONFLICT DO NOTHING`); log(`${tbl}: copied up to live count`); }
  log(`${tbl} count: ${(await c.query(`SELECT count(*)::int AS n FROM ${SCHEMA}.${tbl}`)).rows[0].n}`);
}

// 3. Бакеты
try {
  const b = (await c.query(`SELECT id FROM storage.buckets WHERE id IN ('tp-proposals','tp-products')`)).rows.map(r => r.id);
  log('buckets:', b.join(', ') || 'EMPTY');
} catch (e) { log('buckets check:', String(e?.message || e).slice(0, 120)); }

// 4. PostgREST проверка профиля (если схема не открыта — нужен один толькль в Dashboard)
try {
  const r = await fetch(`${url}/rest/v1/solar_products?select=id&limit=3`, { headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Accept-Profile': SCHEMA } });
  const j = await r.json();
  if (Array.isArray(j)) log(`PostgREST ${SCHEMA} profile: OK (${j.length} rows sample)`);
  else log(`PostgREST ${SCHEMA} profile: HTTP ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
} catch (e) { log('postgrest test FAIL:', String(e?.message || e).slice(0, 120)); }

// 5. Проверка RPC submit_lead через профиль
try {
  const r = await fetch(`${url}/rest/v1/rpc/submit_lead`, { method: 'POST', headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json', 'Content-Profile': SCHEMA }, body: JSON.stringify({ p_name: 'TEST TP lead (cache-check, to delete)', p_source: 'test' }) });
  const j = await r.json();
  log('RPC submit_lead profile test:', r.status, JSON.stringify(j).slice(0, 240));
} catch (e) { log('rpc test FAIL:', String(e?.message || e).slice(0, 120)); }

await c.end();
