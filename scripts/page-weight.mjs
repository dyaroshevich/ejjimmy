// What one form factor actually downloads for the landing page: every <img>
// resolved to the srcset entry its viewport would pick, plus CSS url() refs.
// usage: node scripts/page-weight.mjs <base> [width] [dpr] [path]
const base = process.argv[2] || 'http://127.0.0.1:3001';
const vw = Number(process.argv[3] || 390);
const dpr = Number(process.argv[4] || 2);
const route = process.argv[5] || '/';
const need = vw * dpr;
const html = await (await fetch(base + route, { headers: { 'Accept-Language': 'th' } })).text();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

const picks = [];
// first sizes clause for a viewport at or below this width, else the fallback
function needFor(sizes) {
  if (!sizes) return need;
  let fallback = null;
  for (const m of sizes.matchAll(/\(\s*(max-width):\s*(\d+)px\s*\)\s*(\d+)vw/g)) {
    if (vw <= Number(m[2])) return (vw * Number(m[3]) / 100) * dpr;
  }
  const vwFallback = sizes.match(/(\d+)vw\s*$/);
  if (vwFallback) return (vw * Number(vwFallback[1]) / 100) * dpr;
  const px = sizes.match(/(\d+)px\s*$/);
  if (px) return Number(px[1]) * dpr;
  return need;
}
// The hero ships the same 12 photos twice: `.collage` (desktop) and `.strip-wrap` (phone),
// each `display:none` on the other form factor. A static scan cannot see that, so without
// this it charges every device for both galleries. Breakpoint and both containers come from
// globals.css (`.collage` base display:none, `@media (min-width:900px){ .strip-wrap { display:none } }`);
// cross-checked against a real browser's resource timing, which fetches 12 frames at 1280 and
// the strip only at 390.
const heroStart = html.indexOf('class="ch-hero"');
const heroEnd = html.indexOf('data-od-id="uni-trust"');
const collageAt = heroStart > -1 ? html.indexOf('class="collage"', heroStart) : -1;
const stripAt = heroStart > -1 ? html.indexOf('class="strip-wrap"', heroStart) : -1;
const hiddenAt = (at) => {
  if (collageAt < 0 || stripAt < 0 || at < collageAt || at > heroEnd) return false;
  return at < stripAt ? vw >= 900 : vw < 900;
};

for (const m of html.matchAll(/<img[^>]*>/g)) {
  const tag = m[0];
  if (hiddenAt(m.index)) continue;
  const src = decode(tag.match(/\bsrc="([^"]+)"/)?.[1] || '');
  if (!src || src.startsWith('data:')) continue;
  const want = needFor(decode(tag.match(/\bsizes="([^"]+)"/i)?.[1] || ''));
  const intrinsic = Number(tag.match(/\swidth="(\d+)"/)?.[1] || 0);
  const set = decode(tag.match(/\bsrcset="([^"]+)"/i)?.[1] || '');
  const cands = set.split(',').map((e) => e.trim().split(/\s+/)).filter(([u]) => u)
    // `1x/2x` descriptors (what next/image emits without `sizes`) mean "this many device
    // pixels per CSS pixel" — turn them into real widths so the dpr pick below works.
    .map(([u, d]) => ({ u, w: /x$/.test(d) ? Math.round(intrinsic * parseFloat(d)) : parseInt(d) || 0 }))
    .filter((c) => c.w > 0)
    .sort((a, b) => a.w - b.w);
  picks.push({
    src,
    used: cands.find((c) => c.w >= want)?.u || cands.at(-1)?.u || src,
    w: cands.find((c) => c.w >= want)?.w || (cands.length ? cands.at(-1).w : 'attr'),
    lazy: /loading="lazy"/.test(tag) || /fetchpriority="low"/.test(tag),
  });
}
for (const m of html.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
  const u = decode(m[1]);
  if (/^[/.\w]/.test(u) && !u.startsWith('data:')) picks.push({ src: u, used: u, w: 'css', lazy: false });
}

const rows = [];
for (const p of picks) {
  const abs = p.used.startsWith('http') ? p.used : base + (p.used.startsWith('/') ? p.used : `/${p.used}`);
  const t0 = Date.now();
  let rec;
  try {
    const res = await fetch(abs, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8' },
      signal: AbortSignal.timeout(20000),
    });
    rec = { ...p, status: res.status, bytes: Number(res.headers.get('content-length') || 0), type: res.headers.get('content-type') || '' };
  } catch (e) {
    rec = { ...p, status: e.name === 'TimeoutError' ? 'TIMEOUT' : 'ERR', bytes: 0, type: '' };
  }
  rec.ms = Date.now() - t0;
  rows.push(rec);
  console.log(`  ${String(rec.bytes).padStart(8)} B  ${String(rec.ms).padStart(5)} ms  ${rec.status}  ${rec.src}`);
}
rows.sort((a, b) => b.bytes - a.bytes);
const total = rows.reduce((a, x) => a + x.bytes, 0);
const optimized = rows.filter((x) => x.used.includes('/_next/image')).length;
const byFormat = {};
for (const x of rows) byFormat[x.type] = (byFormat[x.type] || 0) + x.bytes;

console.log(`${base}${route} as seen by ${vw}px @ ${dpr}x (needs ${need}px wide)`);
console.log(`${rows.length} image refs · ${total.toLocaleString('en-US')} B (${(total / 1048576).toFixed(2)} MB) · optimizer: ${optimized}, raw /public: ${rows.length - optimized}`);
console.log(`eager: ${rows.filter((x) => !x.lazy).length}, lazy: ${rows.filter((x) => x.lazy).length}`);
console.log(`by format: ${Object.entries(byFormat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / 1024).toFixed(0)} KB`).join('  ·  ')}`);
console.log('\nheaviest:');
for (const x of rows.slice(0, 10)) {
  console.log(`  ${String(x.bytes).padStart(8)} B  ${(x.type || '-').padEnd(10)} ${x.lazy ? 'lazy ' : 'eager'} ${String(x.w).padStart(4)}px  ${x.src}`);
}
const raw = rows.filter((x) => !x.used.includes('/_next/image') && x.bytes > 150_000);
console.log(`\nnot optimized and over 150 KB: ${raw.length} (${raw.reduce((a, x) => a + x.bytes, 0)} B)`);
for (const x of raw) console.log(`  ${String(x.bytes).padStart(8)} B  ${x.src}`);
const bad = rows.filter((x) => x.status !== 200);
console.log(`non-200: ${bad.length}`);
for (const x of bad) console.log(`  ${x.status}  ${x.used}`);
