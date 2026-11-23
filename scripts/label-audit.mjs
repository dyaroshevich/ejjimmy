/**
 * Are the form labels actually associated?
 *   node scripts/label-audit.mjs [dir]
 *
 * A <label> is fine if it has htmlFor OR it wraps the control. Counting bare
 * "<label" without "htmlFor" (grep) overstates the damage, so this walks each
 * label element and reports the two real cases separately.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || 'src';
const CONTROLS = ['input', 'select', 'textarea', 'button'];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|jsx)$/.test(p)) out.push(p);
  }
  return out;
}

/** Find the index where `tag` closes, honouring self-closing elements. */
function endOfLabel(src, from) {
  let depth = 0;
  const re = /<(\/?)label\b|<label\b[^>]*\/>/g;
  for (let i = from; i < src.length; ) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) return src.length;
    if (m[0].endsWith('/>')) { i = re.lastIndex; continue; }
    depth += m[1] === '/' ? -1 : 1;
    i = re.lastIndex;
    if (depth === 0) return i;
  }
  return src.length;
}

const rows = [];
for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8');
  const ids = new Set([...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  let forAttr = 0, wrapped = 0, orphan = 0, found = 0, both = 0;
  const dangling = [];
  const details = [];
  const re = /<label\b/g;
  let m;
  while ((m = re.exec(src))) {
    found++;
    const line = src.slice(0, m.index).split('\n').length;
    const openEnd = src.indexOf('>', m.index);
    const open = src.slice(m.index, openEnd + 1);
    const close = endOfLabel(src, m.index);
    const body = src.slice(openEnd + 1, close);
    const forLit = (open.match(/\bhtmlFor="([^"]+)"/) || [])[1];
    const forDyn = /\bhtmlFor=\{/.test(open);
    const hasFor = !!forLit || forDyn;
    const wraps = CONTROLS.some((t) => new RegExp(`<${t}\\b`).test(body));
    if (hasFor && wraps) both++;
    if (hasFor) forAttr++;
    else if (wraps) wrapped++;
    else orphan++;
    if (forLit && !ids.has(forLit)) dangling.push(`${line}:${forLit}`);
    if (!hasFor && !wraps) details.push(line);
  }
  rows.push({ file, found, forAttr, wrapped, orphan, both, details, dangling });
}

const orphanRows = rows.filter((r) => r.orphan > 0).sort((a, b) => b.orphan - a.orphan);
const sum = (k) => rows.reduce((n, r) => n + r[k], 0);

const total = sum('found');
// The three buckets are exclusive by construction, so they must add up. If they
// do not, the classifier changed and every number below is suspect.
const reconciles = total === sum('forAttr') + sum('wrapped') + sum('orphan');

console.log(`files with <label>: ${rows.filter((r) => r.found > 0).length} · scanned ${rows.length}`);
console.log(`labels: ${total} total · htmlFor ${sum('forAttr')} (of which ${sum('both')} also wrap)` +
  ` · wrapping only ${sum('wrapped')} · NEITHER ${sum('orphan')}`);
console.log(`buckets add up: ${reconciles ? 'yes' : 'NO — ' + (sum('forAttr') + sum('wrapped') + sum('orphan')) + ' != ' + total}`);
console.log('');
console.log('Labels that point at nothing (no htmlFor, does not wrap a control):');
for (const r of orphanRows) console.log(`  ${String(r.orphan).padStart(3)}  ${r.file}  lines ${r.details.join(',')}`);
if (!orphanRows.length) console.log('  none');
console.log('');
console.log('Labels already OK (implicit association by wrapping):');
for (const r of rows.filter((x) => x.wrapped > 0).sort((a, b) => b.wrapped - a.wrapped)) {
  console.log(`  ${String(r.wrapped).padStart(3)}  ${r.file}`);
}

const dang = rows.filter((r) => r.dangling.length);
console.log('');
if (dang.length) {
  console.log(`BROKEN htmlFor — points at an id that is not in the same file (${dang.reduce((n, r) => n + r.dangling.length, 0)}):`);
  for (const r of dang) console.log(`  ${r.file}  line:id -> ${r.dangling.join(', ')}`);
} else {
  console.log('every htmlFor points at an id that exists in the same file (dynamic htmlFor={...} not checkable here)');
}
