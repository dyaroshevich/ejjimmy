// tp-db-check-clean.mjs — проверка и очистка, мог ли сид, квалифицированный в public., попасть в ЖИВУЮ таблицу.
// Вставляемых строк быть не должно: TP-сид хочу в схему tawanpower, живую Solar трогать нельзя.
import { readFileSync } from 'node:fs';
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
const ref = (envLocal.NEXT_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
const password = envRestore.SUPABASE_DB_PASSWORD;
const dsn = `postgres://postgres.${ref}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;

const c = new pg.Client({ connectionString: dsn, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
await c.connect();
log('CONNECTED');

// 1. Что добавилось в живую public.blog_posts / public.solar_cases за последние часы?
for (const [tbl, pk] of [['blog_posts', 'id'], ['solar_cases', 'id']]) {
  try {
    const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${tbl}'`);
    const hasCreated = cols.rows.some(r => r.column_name === 'created_at');
    const hasSlug = cols.rows.some(r => r.column_name === 'slug');
    const order = hasCreated ? 'created_at DESC' : (hasSlug ? 'slug' : pk);
    const lim = hasCreated ? 'ORDER BY created_at DESC LIMIT 8' : `ORDER BY ${order} LIMIT 8`;
    const sel = [pk, ...(hasSlug ? ['slug'] : []), ...(hasCreated ? ['created_at'] : [])].join(', ');
    const q = `SELECT ${sel} FROM public.${tbl} ${lim}`;
    const r = await c.query(q);
    log(`\n== public.${tbl} (последние) ==`);
    for (const row of r.rows) log(JSON.stringify(row));
  } catch (e) { log('check fail', tbl, String(e?.message || e).slice(0, 150)); }
}

// 2. Есть ли во вставленных (created_at > 2026-11-04) строки среди бриPending TP-брендированных?
try {
  const r = await c.query(`SELECT count(*)::int AS n FROM public.blog_posts WHERE created_at > '2026-11-03'`);
  log(`\npublic.blog_posts created_at>2026-11-03: ${r.rows[0].n}`);
} catch {}
try {
  const r = await c.query(`SELECT count(*)::int AS n FROM public.solar_cases WHERE created_at > '2026-11-03'`);
  log(`public.solar_cases created_at>2026-11-03: ${r.rows[0].n}`);
} catch {}

// Точная сверка по slugs из сидов (TP-брендированный набор, который лежит в сидах)
const tpSlugs = [];
const seedDir = join(ROOT, 'supabase');
for (const f of ['seed_blog.sql', 'seed_blog_article_2.sql', 'seed_blog_article_3.sql', 'seed_blog_article_4.sql', 'seed_blog_article_5.sql', 'seed_blog_article_6.sql', 'seed_blog_article_7.sql', 'seed_blog_article_8.sql', 'seed_blog_article_9.sql', 'seed_blog_article_10.sql', 'seed_blog_article_11.sql']) {
  const txt = readFileSync(join(seedDir, f), 'utf8');
  for (const m of txt.matchAll(/slug\s*=\s*'([^']+)'/g)) tpSlugs.push(m[1]);
}
log(`\nTP-seed slugs: ${tpSlugs.length} found in seed files`);
if (tpSlugs.length) {
  const r = await c.query(`SELECT slug FROM public.blog_posts WHERE slug = ANY($1::text[])`, [tpSlugs]);
  log(`of them PRESENT in live public.blog_posts: ${r.rows.length}`);
  for (const row of r.rows.slice(0, 30)) log('  live row slug:', row.slug);
}

// 3. Удаление НЕ выполняем автоматически — только отчёт (решение и подтверждение — вручную).
await c.end();
log('\n== отчёт закончен, удаления не было ==');
