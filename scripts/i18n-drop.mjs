// Remove i18n namespaces or single keys that no component asks for, without
// reformatting the rest of the file (each locale file has its own indent).
// usage: node scripts/i18n-drop.mjs ns1 ns2.sub.key3 ...
import fs from 'fs';

const drop = process.argv.slice(2);
if (!drop.length) {
  console.error('usage: node scripts/i18n-drop.mjs <namespace|ns.key> [...]');
  process.exit(2);
}

const locales = fs.readdirSync('messages').filter((f) => f.endsWith('.json'));
const report = [];

function blockRange(lines, headerRe, minIndent = 0) {
  const opens = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => headerRe.test(l))
    .sort((a, b) => a.l.match(/^(\s*)/)[1].length - b.l.match(/^(\s*)/)[1].length);
  for (const { i: open } of opens) {
    if (open < minIndent) continue;
    let depth = 0;
    for (let i = open; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
      }
      if (depth === 0 && i >= open) return { open, close: i };
    }
  }
  return null;
}

for (const loc of locales) {
  const file = `messages/${loc}`;
  const text = fs.readFileSync(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const before = JSON.parse(text);
  const removed = [];

  const has = (obj, path) =>
    path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj) !== undefined;

  for (const path of drop) {
    if (!has(before, path)) continue;
    const dotted = path.includes('.');
    const ns = dotted ? path.slice(0, path.lastIndexOf('.')) : path;
    const key = dotted ? path.slice(path.lastIndexOf('.') + 1) : null;
    const block = blockRange(lines, new RegExp(`^\\s*"${ns}":\\s*\\{\\s*$`));
    if (!block) {
      console.error(`!! ${loc}: block "${ns}" not found — skipping file`);
      continue;
    }
    let from = block.open;
    let to = block.close;
    if (key) {
      const i = lines.findIndex(
        (l, idx) => idx > block.open && idx < block.close && new RegExp(`^\\s*"${key}":`).test(l)
      );
      if (i === -1) {
        console.error(`!! ${loc}: key "${path}" not found — skipping file`);
        continue;
      }
      from = i;
      to = i;
    }
    removed.push(path);
    lines.splice(from, to - from + 1);
    // A removed block can leave the previous line without a separator or with a
    // dangling one; normalise against what actually follows.
    let prev = from - 1;
    while (prev > 0 && !lines[prev].trim()) prev--;
    const nextIsClose = /^\s*\}/.test(lines[from] || '');
    if (nextIsClose) lines[prev] = lines[prev].replace(/,\s*$/, '');
    else if (!/,\s*$/.test(lines[prev])) lines[prev] = lines[prev].replace(/\s*$/, '') + ',';
  }

  const out = lines.join(eol);
  const after = JSON.parse(out);
  const stillThere = removed.filter((p) => has(after, p));
  const gained = Object.keys(after).filter((k) => !(k in before));
  if (stillThere.length || gained.length) {
    console.error(`!! ${loc}: refused (still present: ${stillThere} / unexpected: ${gained})`);
    continue;
  }
  fs.writeFileSync(file, out);
  const count = (o) => Object.values(o).reduce((n, v) => n + (v && typeof v === 'object' ? count(v) : 1), 0);
  const lost = count(before) - count(after);
  report.push(`${loc.padEnd(8)} -${String(lost).padStart(4)} strings  (${removed.join(', ')})`);
}

console.log(report.join('\n'));
