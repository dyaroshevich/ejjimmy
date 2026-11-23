// Every `globals.css:NNN` / `globals.css#LNNN` citation in the milestone docs is checked against the file:
// the class named near the citation must have its rule head on (or beside) that line. Line numbers drift
// by whatever gets inserted or deleted above them — so the report prints the delta it
// finds and buckets the citations by it: a whole bucket at -6 is drift, one row at -118 is a bad cite.
//   node scripts/css-cite-audit.mjs
// The context window is read around the citation, never consumed by the match: the first version used
// `(\d+)([^]{0,320})`, so every citation sitting within 320 chars of the previous one was swallowed by
// that tail and never checked — 28 of the 53 in the three docs, and it is how two links past end of
// file (:1500 and :1486 in a 1441-line sheet) survived a green "past end of file: 0".
import fs from 'node:fs';

const CSS = 'src/app/globals.css';
const DOCS = ['AGENTS.md', 'ROADMAP.md', 'docs/audit/LANDING_STATE_2026-10-18.md'];
const cssLines = fs.readFileSync(CSS, 'utf8').split(/\r?\n/);
if (cssLines.at(-1) === '') cssLines.pop(); // wc -l counts newlines; a trailing one is not a line
// Rule heads only: the selector part of a line that opens a block, minus at-rules and comments.
const heads = [];
cssLines.forEach((raw, i) => {
  const t = raw.trim();
  if (!t.includes('{') || /^[@}]|^\//.test(t)) return;
  const sel = t.slice(0, t.indexOf('{'));
  for (const m of sel.matchAll(/(?:section\.)?\.([a-z][\w-]*)/g)) heads.push({ cls: m[1], line: i + 1 });
});
const headsFor = (token) => heads.filter((h) => h.cls === token || h.cls.includes(token));

const rows = [];
for (const doc of DOCS) {
  const src = fs.readFileSync(doc, 'utf8');
  for (const m of src.matchAll(/globals\.css(?:#L|:)(\d+)/g)) {
    const at = Number(m[1]);
    const near = src.slice(Math.max(0, m.index - 320), m.index + 320).toLowerCase();
    const tokens = [...new Set([...near.matchAll(/[.`]([a-z][\w]*(?:-[\w-]+)*)/g)].map((t) => t[1]))]
      .filter((t) => (t.includes('-') || t.length > 4) && !/^(tsx|css|mjs|json|html|data|class|style|node|http|svg)$/.test(t));
    const cand = tokens.flatMap((t) => headsFor(t).map((h) => ({ ...h, token: t })));
    if (!cand.length) {
      if (at > cssLines.length)
        rows.push({ doc, at: src.slice(0, m.index).split('\n').length, cited: at, token: '(unresolved)', line: 0, delta: 0, range: 'PAST EOF', text: '' });
      continue;
    }
    cand.sort((a, b) => Math.abs(a.line - at) - Math.abs(b.line - at));
    rows.push({
      doc,
      at: src.slice(0, m.index).split('\n').length,
      cited: at,
      token: cand[0].token,
      line: cand[0].line,
      delta: cand[0].line - at,
      range: at > cssLines.length ? 'PAST EOF' : '',
      text: (cssLines[at - 1] || '').trim().slice(0, 44),
    });
  }
}

const ok = rows.filter((r) => Math.abs(r.delta) <= 1);
const off = rows.filter((r) => Math.abs(r.delta) > 1);
const eof = rows.filter((r) => r.range);
const buckets = {};
for (const r of off) buckets[r.delta] = (buckets[r.delta] || 0) + 1;
const out = [
  `globals.css is ${cssLines.length} lines (wc -l). ${rows.length} citations resolved by class name: ${ok.length} hit, ${off.length} whose nearest named class is elsewhere.`,
  `GATE - citations pointing past end of file: ${eof.length} (must be 0).`,
  `"off" is a review list, not a defect list: the token picked is whichever class name sits nearest the link, so a cite for`,
  `section.block and a mention of .section ten words earlier read as a miss. Deltas: ${Object.entries(buckets).sort((a, b) => a[0] - b[0]).map(([d, n]) => `${d}: ${n}`).join(', ') || 'none'}`,
  '',
  ...off.map((r) => `${r.range || 'off'}  ${r.doc}:${r.at} cites :${r.cited} ("${r.token}") -> ${r.line}   [${r.text}]`),
  '',
  ...ok.map((r) => `ok    ${r.doc}:${r.at} cites :${r.cited} ("${r.token}") -> ${r.line}`),
].join('\n');
fs.mkdirSync('shots', { recursive: true });
fs.writeFileSync('shots/css-cite-audit.txt', out + '\n');
console.log(out);
