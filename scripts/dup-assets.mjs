// Byte-identical duplicates among catalog images + the heaviest landing assets.
// usage: node scripts/dup-assets.mjs
import fs from 'fs';
import crypto from 'crypto';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(webp|png|jpe?g)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk('public/content/products');
const map = {};
for (const p of files) {
  const h = crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex').slice(0, 10);
  (map[h] ||= []).push(p);
}
const dupes = Object.entries(map).filter(([, v]) => v.length > 1);
const total = files.reduce((a, p) => a + fs.statSync(p).size, 0);
console.log(`product images: ${files.length}, ${total} B on disk`);
console.log(`byte-identical duplicate groups: ${dupes.length}`);
for (const [h, v] of dupes) {
  console.log(`  ${h}  ${fs.statSync(v[0]).size} B`);
  for (const p of v) console.log(`      ${p}`);
}

const landing = walk('public/images').map((p) => [p, fs.statSync(p).size]).sort((a, b) => b[1] - a[1]);
console.log(`public/images: ${landing.length} files, ${landing.reduce((a, [, s]) => a + s, 0)} B total`);
console.log('heaviest:');
for (const [p, s] of landing.slice(0, 8)) console.log(`  ${String(s).padStart(9)} B  ${p}`);
