// tp-db-init.mjs — инициализация изолированной схемы `tawanpower`
// внутри ОБЩЕГО проекта Supabase (план «Б»), без изменений кода запросов.
// Подключение — напрямую в Postgres (пароль берётся из .env.restore, не печатается).
// Запуск: node scripts/tp-db-init.mjs
import { readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const log = (...a) => console.log(...a);

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
const ref = (envLocal.NEXT_PUBLIC_SUPABASE_URL || envLocal.SUPABASE_URL || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
const password = envRestore.SUPABASE_DB_PASSWORD;
if (!ref || !password) { console.error('FATAL: no SUPABASE ref or DB password'); process.exit(1); }

const DSNS = [
  `postgres://postgres.${ref}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgres://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
];

async function connectPool() {
  for (const dsn of DSNS) {
    const c = new pg.Client({ connectionString: dsn, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
    try { await c.connect(); log('CONNECTED via', dsn.replace(/:[^:@/]+@/, ':<pw>@')); return c; }
    catch (e) { log('connect fail:', String(e?.message).slice(0, 120)); try { await c.end(); } catch { } }
  }
  return null;
}

// Превращение миграций «для public» в «для схемы tawanpower».
function adapt(sql) {
  let s = sql;
  s = s.replace(/BEGIN;|COMMIT;/g, '');            // транзакциями управляем сами
  s = s.replace(/\bpublic\.((?=[a-z_])[a-z0-9_."]+)/g, 'tawanpower.$1');
  s = s.replace(/SET search_path\s*=\s*public\b/gi, 'SET search_path = tawanpower');
  s = s.replace(/CREATE SCHEMA IF NOT EXISTS public\b/gi, "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='tawanpower') THEN CREATE SCHEMA tawanpower; END IF; END $$;");
  return s;
}

async function runFile(c, file, { transform } = {}) {
  let sql = readFileSync(file, 'utf8');
  if (transform !== false) sql = adapt(sql);
  await c.query('BEGIN');
  try {
    await c.query(sql);
    await c.query('COMMIT');
    return { ok: true };
  } catch (e) {
    try { await c.query('ROLLBACK'); } catch { }
    return { ok: false, error: String(e?.message || e).slice(0, 300).split('\n')[0] };
  }
}

(async () => {
  const c = await connectPool();
  if (!c) { console.error('FATAL: no DB connection'); process.exit(1); }

  // 0. Схема + права (PostgREST ходит от anon/authenticated/service_role)
  await c.query("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='tawanpower') THEN CREATE SCHEMA tawanpower; END IF; END $$;");
  await c.query("SET search_path = tawanpower, public, extensions;");
  for (const role of ['anon', 'authenticated', 'service_role', 'authenticated_admin', 'authenticated']) {
    // роли, устраивающие сум; неизвестные роли игнорируются
    try { await c.query(`GRANT USAGE ON SCHEMA tawanpower TO ${role}`); } catch { }
  }
  try { await c.query('GRANT ALL ON SCHEMA tawanpower TO postgres, service_role'); } catch { }

  // 1. Миграции (по имени файла)
  const migDir = join(ROOT, 'supabase', 'migrations');
  const files = readdirSync(migDir).filter(f => f.endsWith('.sql')).sort();
  const migFail = [];
  for (const f of files) {
    const r = await runFile(c, join(migDir, f));
    log(r.ok ? `ok    ${f}` : `FAIL  ${f}: ${r.error}`);
    if (!r.ok) migFail.push(f);
  }

  // 2. Сиды (TP-брендинг уже внутри seed_*.sql) + каталог товаров из живой таблицы
  const seedDir = join(ROOT, 'supabase');
  const seeds = readdirSync(seedDir).filter(f => /^seed_.*\.sql$/.test(f)).sort();
  const seedFail = [];
  for (const f of seeds) {
    const r = await runFile(c, join(seedDir, f), { transform: false });
    log(r.ok ? `seed  ${f}` : `SEEDFAIL ${f}: ${r.error}`);
    if (!r.ok) seedFail.push(f);
  }
  try {
    const src = await c.query('SELECT count(*)::int AS n FROM public.solar_products');
    if (src.rows[0]?.n > 0) {
      await c.query('INSERT INTO tawanpower.solar_products SELECT * FROM public.solar_products ON CONFLICT DO NOTHING');
      const dst = await c.query('SELECT count(*)::int AS n FROM tawanpower.solar_products');
      log(`copy solar_products ${src.rows[0].n} -> tawanpower: ${dst.rows[0].n}`);
    }
  } catch (e) { log('copy solar_products:', String(e?.message || e).slice(0, 200)); }

  // 3. Storage: изолированные бакеты tp-* + политики
  const bucketSql = `
    INSERT INTO storage.buckets (id, name, public) VALUES ('tp-proposals','tp-proposals', true) ON CONFLICT (id) DO NOTHING;
    INSERT INTO storage.buckets (id, name, public) VALUES ('tp-products','tp-products', true) ON CONFLICT (id) DO NOTHING;
    CREATE POLICY "TP public read proposals" ON storage.objects FOR SELECT USING ( bucket_id = 'tp-proposals' );
    CREATE POLICY "TP admins write proposals" ON storage.objects FOR ALL TO authenticated USING ( bucket_id = 'tp-proposals' ) WITH CHECK ( bucket_id = 'tp-proposals' );
    CREATE POLICY "TP public read products" ON storage.objects FOR SELECT USING ( bucket_id = 'tp-products' );
    CREATE POLICY "TP admins write products" ON storage.objects FOR ALL TO authenticated USING ( bucket_id = 'tp-products' ) WITH CHECK ( bucket_id = 'tp-products' );
  `;
  const bres = await runFile(c, 'storage-inline', { transform: false }).catch(() => null);
  // ↑ заглушка: runFile требует файл, исполяем явно
  try {
    for (const part of bucketSql.split(/;\s*\n/).filter(s => s.trim())) {
      try { await c.query(part.trim() + ';'); } catch (e) { log('bucket stmt note:', String(e?.message || '').slice(0, 120)); }
    }
    log('storage buckets ensured');
  } catch (e) { log('storage error:', String(e?.message || e).slice(0, 200)); }

  // 4. Итог
  const tables = await c.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='tawanpower' AND table_type='BASE TABLE'");
  const sp = await c.query("SELECT count(*)::int AS n FROM tawanpower.solar_products").catch(() => ({ rows: [{ n: -1 }] }));
  const bp = await c.query("SELECT count(*)::int AS n FROM tawanpower.blog_posts").catch(() => ({ rows: [{ n: -1 }] }));
  const kn = await c.query("SELECT count(*)::int AS n FROM tawanpower.knowledge").catch(() => ({ rows: [{ n: -1 }] }));
  const sc = await c.query("SELECT count(*)::int AS n FROM tawanpower.solar_cases").catch(() => ({ rows: [{ n: -1 }] }));
  log('--- SUMMARY ---');
  log(`tables in tawanpower schema: ${tables.rows[0].n}`);
  log(`solar_products: ${sp.rows[0].n} | blog_posts: ${bp.rows[0].n} | solar_cases: ${sc.rows[0].n} | knowledge: ${kn.rows[0].n}`);
  if (migFail.length) log(`MIGRATION FAILURES (${migFail.length}):`, migFail.join(', '));
  if (seedFail.length) log(`SEED FAILURES (${seedFail.length}):`, seedFail.join(', '));
  await c.end();
})();
