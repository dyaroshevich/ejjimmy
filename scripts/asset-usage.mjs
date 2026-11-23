// Which catalog files prod rows actually reference, and what sits on disk unused.
// Read-only: selects solar_products + solar_cases, compares against public/content/products.
// usage: node scripts/asset-usage.mjs
import fs from 'fs';
import path from 'path';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function rows(table) {
  const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=500`, { headers });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status}`);
  return r.json();
}

const prods = await rows('solar_products');
const cases = await rows('solar_cases');

const refs = new Set();
const add = (v) => { if (typeof v === 'string' && v.startsWith('/')) refs.add(v); };
for (const p of prods) {
  add(p.image_url);
  for (const g of p.gallery ?? []) add(typeof g === 'string' ? g : g?.url ?? g?.src);
}
for (const c of cases) {
  const m = c.media_assets;
  const bag = Array.isArray(m) ? m : [m?.image, m?.images, m?.gallery, m?.video].flat();
  for (const g of bag ?? []) add(typeof g === 'string' ? g : g?.url ?? g?.src);
}

const onDisk = new Set();
(function walk(d, rel = '') {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${e.name}`, r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(p, r);
    else onDisk.add(`/content/products/${r}`);
  }
})(path.join('public', 'content', 'products'));

const missing = [...refs].filter((r) => r.startsWith('/content/products') && !onDisk.has(r));
const unreferenced = [...onDisk].filter((f) => !refs.has(f));
const wasted = unreferenced.reduce((a, f) => a + fs.statSync(path.join('public', f)).size, 0);

console.log(`rows: ${prods.length} products, ${cases.length} cases`);
console.log(`image paths referenced: ${refs.size}`);
console.log(`files on disk under /content/products: ${onDisk.size}`);
console.log(`\nreferenced but missing on disk: ${missing.length}`);
for (const m of missing) console.log(`  ${m}`);
console.log(`\bon disk but referenced by no row: ${unreferenced.length}  (${wasted} B)`);
const byExt = {};
for (const f of unreferenced) byExt[path.extname(f)] = (byExt[path.extname(f)] || 0) + 1;
console.log(`  by extension: ${Object.entries(byExt).map(([k, v]) => `${k}:${v}`).join('  ')}`);
for (const f of unreferenced.filter((x) => /\.(webp|jpe?g)$/i.test(x))) console.log(`  ${f}`);
