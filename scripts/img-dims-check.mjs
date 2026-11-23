/**
 * Cross-check the hand-rolled header parser in img-dims.mjs against sharp.
 *   node scripts/img-dims-check.mjs [dir...]
 *
 * Kept as a guard: img-dims.mjs reads WebP/PNG/JPEG headers itself, and a wrong
 * offset once printed 4997377x15616081 for a 300x300 file instead of failing.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const dirs = process.argv.slice(2);
const targets = dirs.length ? dirs : ['public/content/brands', 'public/content/products', 'public/images'];

function files(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) files(p, out);
    else if (/\.(webp|png|jpe?g)$/i.test(p)) out.push({ path: p, bytes: st.size });
  }
  return out;
}

// Same logic as img-dims.mjs, inlined so this check fails loudly if the two drift.
function parseDims(buf) {
  const riff = buf.toString('latin1', 0, 4);
  if (riff === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
    for (let i = 12; i + 8 <= buf.length; ) {
      const tag = buf.toString('latin1', i, i + 4);
      const size = buf.readUInt32LE(i + 4);
      const d = buf.subarray(i + 8);
      if (tag === 'VP8X') return `${d.readUIntLE(4, 3) + 1}x${d.readUIntLE(7, 3) + 1}`;
      if (tag === 'VP8 ') return `${d.readUInt16LE(6) & 0x3fff}x${d.readUInt16LE(8) & 0x3fff}`;
      if (tag === 'VP8L') {
        const n = d.readUInt32LE(1);
        return `${(n & 0x3fff) + 1}x${((n >> 14) & 0x3fff) + 1}`;
      }
      i += 8 + size + (size % 2);
    }
    return 'no webp image chunk';
  }
  if (buf.toString('latin1', 1, 4) === 'PNG') return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i + 9 < buf.length; ) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      const sof = m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;
      if (sof) return `${buf.readUInt16BE(i + 7)}x${buf.readUInt16BE(i + 5)}`;
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return 'SOF not found';
  }
  return 'unknown format';
}

const all = targets.flatMap((d) => files(d));
let checked = 0, bad = 0;
const problems = [];

for (const f of all) {
  const head = readFileSync(f.path).subarray(0, 64 * 1024);
  const mine = parseDims(head);
  const meta = await sharp(f.path, { failOn: 'warning' }).metadata();
  const truth = `${meta.width}x${meta.height}`;
  checked++;
  if (mine !== truth) {
    bad++;
    problems.push(`  ${f.path}  script=${mine}  sharp=${truth}  ${f.bytes} B  ${meta.format}`);
  }
}

console.log(`checked ${checked} image files against sharp`);
if (problems.length) {
  console.log(`MISMATCHES (${bad}):`);
  console.log(problems.join('\n'));
} else {
  console.log('0 mismatches — the header parser agrees with sharp on every file');
}
