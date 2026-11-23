// Insert or replace keys in messages/*.json without reformatting the file.
// Each locale file has its own indentation (en: 2 spaces, th: 1), so keys are
// spliced in as text rather than re-serialized.
//
// usage: node scripts/i18n-set.mjs patch.json
// patch: { "en": { "contact.otherArea": "Other area" }, "th": { ... } }

import fs from 'fs';

const patchPath = process.argv[2];
if (!patchPath) {
  console.error('usage: node scripts/i18n-set.mjs <patch.json>');
  process.exit(2);
}

const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

function findBlock(lines, ns) {
  const starts = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => new RegExp(`^\\s*"${ns}":\\s*\\{\\s*$`).test(l))
    .sort((a, b) => a.l.match(/^(\s*)/)[1].length - b.l.match(/^(\s*)/)[1].length);
  if (!starts.length) return null;

  for (const { i: open } of starts) {
    const indent = lines[open].match(/^(\s*)/)[1].length;
    let depth = 0;
    for (let i = open; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
      }
      if (depth === 0 && i > open) return { start: open, end: i, indent };
    }
  }
  return null;
}

function keyIndent(lines, block) {
  for (let i = block.start + 1; i < block.end; i++) {
    const m = lines[i].match(/^(\s*)"/);
    if (m) return m[1];
  }
  return ' '.repeat(block.indent + 2);
}

function escapeValue(v) {
  return JSON.stringify(v).slice(1, -1);
}

let changed = 0;
for (const [locale, entries] of Object.entries(patch)) {
  const file = `messages/${locale}.json`;
  if (!fs.existsSync(file)) {
    console.error(`!! missing ${file}`);
    process.exit(1);
  }
  const text = fs.readFileSync(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);

  for (const [dotted, value] of Object.entries(entries)) {
    const nsIdx = dotted.lastIndexOf('.');
    const ns = dotted.slice(0, nsIdx);
    const key = dotted.slice(nsIdx + 1);
    const block = findBlock(lines, ns);
    if (!block) {
      console.error(`!! namespace "${ns}" not found in ${locale}`);
      process.exit(1);
    }
    const pad = keyIndent(lines, block);
    const keyLine = lines.findIndex(
      (l, i) => i > block.start && i < block.end && new RegExp(`^\\s*"${key}":`).test(l)
    );

    if (keyLine !== -1) {
      const tail = /,\s*$/.test(lines[keyLine]) ? ',' : '';
      lines[keyLine] = `${pad}"${key}": "${escapeValue(value)}"${tail}`;
      console.log(`~ ${locale}  ${dotted}  (replaced)`);
    } else {
      let insertAt = block.end;
      while (insertAt - 1 > block.start && !lines[insertAt - 1].trim()) insertAt--;
      const prev = lines[insertAt - 1];
      if (!/,\s*$/.test(prev)) lines[insertAt - 1] = prev.replace(/\s*$/, '') + ',';
      lines.splice(insertAt, 0, `${pad}"${key}": "${escapeValue(value)}"`);
      console.log(`+ ${locale}  ${dotted}`);
    }
    changed++;
  }

  const out = lines.join(eol);
  JSON.parse(out);
  fs.writeFileSync(file, out);
}

console.log(`\n${changed} keys written across ${Object.keys(patch).length} locales`);
