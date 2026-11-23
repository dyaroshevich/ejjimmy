// Does every messages/*.json carry the same set of keys?
// usage: node scripts/i18n-parity.mjs [dir]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] || 'messages';
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const parse = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));

const keys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

const sets = files.map((f) => ({ f, set: new Set(keys(parse(f))) }));
const universe = new Set(sets.flatMap((s) => [...s.set]));
let divergent = 0;
for (const s of sets) {
  const missing = [...universe].filter((k) => !s.set.has(k));
  if (missing.length) {
    divergent++;
    console.log(`${s.f}: missing ${missing.length} -> ${missing.slice(0, 8).join(', ')}`);
  }
}
console.log(`${files.length} locales keys ${universe.size} divergent ${divergent}`);
