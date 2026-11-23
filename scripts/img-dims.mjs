// Header-only dimensions for the landing's image assets. Reads the first 64 KB,
// never the whole file. usage: node scripts/img-dims.mjs <file...>
import fs from 'fs';

function webp(buf) {
  if (buf.toString('latin1', 0, 4) !== 'RIFF') return 'not RIFF';
  const kind = buf.toString('latin1', 8, 12);
  if (kind !== 'WEBP') return `not WEBP (${kind})`;
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
  return 'no image chunk in first 64 KB';
}

function png(buf) {
  if (buf.toString('latin1', 1, 4) !== 'PNG') return 'not PNG';
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
}

function jpeg(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return 'not JPEG';
  for (let i = 2; i + 9 < buf.length; ) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    const sof = (m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;
    if (sof) return `${buf.readUInt16BE(i + 7)}x${buf.readUInt16BE(i + 5)}`;
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return 'SOF not in first 64 KB';
}

for (const p of process.argv.slice(2)) {
  const fd = fs.openSync(p, 'r');
  const head = Buffer.alloc(65536);
  const got = fs.readSync(fd, head, 0, 65536, 0);
  fs.closeSync(fd);
  const b = head.subarray(0, got);
  const kind = b.subarray(0, 4).toString('latin1').includes('PNG') ? 'png'
    : b.toString('latin1', 0, 4) === 'RIFF' ? 'webp'
    : b[0] === 0xff && b[1] === 0xd8 ? 'jpeg' : 'other';
  const dims = kind === 'webp' ? webp(b) : kind === 'png' ? png(b) : kind === 'jpeg' ? jpeg(b) : 'unparsed';
  console.log(`${String(fs.statSync(p).size).padStart(9)} B  ${kind.padEnd(5)} ${dims.padEnd(14)} ${p}`);
}
