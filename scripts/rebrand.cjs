const fs = require('fs');
const path = require('path');
const ROOTS = ['src', 'messages', 'public'];
const EXT = /\.(tsx?|json)$/;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) {
    if (['node_modules', '.next', '.git'].includes(e.name)) return [];
    return walk(p);
  }
  return EXT.test(e.name) ? [p] : [];
});
const RULES = [
  ['โซลาร์ 1 กระบี่', 'ทีมงาน Tawan Power กระบี่'],
  ['TAWAN POWER', 'Tawan Power'],
  ['@103nrwnu', '@750iqwoa'],
];
let files = 0;
const leftovers = [];
for (const root of ROOTS) {
  for (const f of walk(root)) {
    let s = fs.readFileSync(f, 'utf8');
    let changed = false;
    for (const [a, b] of RULES) {
      if (s.includes(a)) { s = s.split(a).join(b); changed = true; }
    }
    if (changed) { fs.writeFileSync(f, s); files++; }
  }
}
// verify
for (const root of ROOTS) {
  for (const f of walk(root)) {
    const s = fs.readFileSync(f, 'utf8');
    for (const [a] of RULES) {
      if (s.includes(a)) leftovers.push(f + ' :: ' + a);
    }
  }
}
console.log('files-changed: ' + files);
console.log(leftovers.length ? 'LEFTOVERS:\n' + leftovers.join('\n') : 'LEFTOVERS: none');
