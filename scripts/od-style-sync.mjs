/**
 * Does globals.css carry every rule the approved mock's stylesheet has?
 *   node scripts/od-style-sync.mjs            # report
 *   node scripts/od-style-sync.mjs --emit     # print the patch instead of the report
 *   node scripts/od-style-sync.mjs --apply    # append that patch to globals.css, in place of
 *                                             # the block this script wrote last time
 *
 * Compares rule by rule (selector + declaration set), not class by class: a class name
 * appearing somewhere in the file proves nothing — `.line-browser .site-header` hides the
 * fact that `.site-header` itself was never ported.
 *
 * Source of truth: the inline <style> of docs/design/opendesign/tawanpower-landing-unified.html
 * (frozen copy of the Open Design project, 2026-10-17 17:08).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const MOCK = 'docs/design/opendesign/tawanpower-landing-unified.html';
const OUT = 'docs/design/opendesign/approved-style.css';
const CSS = 'src/app/globals.css';
const MARKER = '/* ---------- approved values globals.css does not resolve to ---------- */';
const emit = process.argv.includes('--emit');
const apply = process.argv.includes('--apply');

const html = readFileSync(MOCK, 'utf8').replace(/\r\n/g, '\n');
const style = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
writeFileSync(OUT, style);

// Only rules for classes the mock's own markup uses — the sheet also styles states
// (hover, .is-active) and elements the markup contains, all of which are wanted.
const markup = html.slice(0, html.indexOf('<style>')) + html.slice(html.indexOf('</style>'));
const used = new Set();
for (const m of markup.matchAll(/class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) if (c) used.add(c);
// Much of the mock's most motion-rich markup (hero collage, snap carousel, product grid)
// is built in JS, so its classes never appear in a class="" attribute. Without this second
// pass the sheet's `.frame`, `.slide` and `.swap` rules read as out of scope and a port that
// renders those elements ships unstyled.
for (const m of markup.matchAll(/(?:className\s*=|classList\.(?:add|remove|toggle)\(|setAttribute\(\s*"class",)\s*["'`]([^"'`]+)["'`]/g))
  for (const c of m[1].split(/\s+/)) if (c && /^[A-Za-z][A-Za-z0-9_-]*$/.test(c)) used.add(c);

// Comments may sit between rules or inside a declaration list; the old one-shot check
// compared a 4-character slice to "/*" and never matched, so every selector preceded by a
// comment carried the comment into its key and the diff compared nothing against nothing.
const skipNoise = (text, from) => {
  let i = from;
  for (;;) {
    while (i < text.length && (text[i] === ' ' || text[i] === '\n' || text[i] === '\t')) i++;
    if (!text.startsWith('/*', i)) return i;
    const e = text.indexOf('*/', i);
    i = e === -1 ? text.length : e + 2;
  }
};

// A brace-less statement (`@import url('…;…')`, `@tailwind base;`) has no block, so the
// next `{` belongs to a different rule. Without this cut, the statement glued itself onto
// the following selector and the whole rule — including the mock's `:root` token block —
// vanished from scope. Quotes are respected because font URLs are full of semicolons.
const stmtEnd = (text, from, stop) => {
  let q = null, depth = 0;
  for (let i = from; i < stop; i++) {
    const c = text[i];
    if (q) { if (c === q && text[i - 1] !== '\\') q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ';' && depth === 0) return i;
  }
  return -1;
};

function parse(text) {
  const nodes = [];
  let i = 0;
  while (true) {
    i = skipNoise(text, i);
    if (i >= text.length) break;
    // `@media { … }` nests, so brace counting must survive inner blocks.
    const brace = text.indexOf('{', i);
    if (brace === -1) break;
    const end = stmtEnd(text, i, brace);
    if (end !== -1 && text.slice(i, end).trim().startsWith('@')) { i = end + 1; continue; }
    const head = text.slice(i, brace).trim();
    let depth = 0, j = brace;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') { depth--; if (!depth) break; }
    }
    nodes.push({ head, body: text.slice(brace + 1, j) });
    i = j + 1;
  }
  return nodes;
}

const cls = (s) => [...s.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)].map((m) => m[1]);
const normSel = (s) => s.trim().replace(/\s*([>+~])\s*/g, '$1').replace(/\s+/g, ' ');
// Cascade merges declarations across rules, so the contract is per-property: the value
// that wins for `prop` under a given selector. Comments and !sugar are stripped.
const propsOf = (body) => {
  const out = new Map();
  for (const d of body.replace(/\/\*[\s\S]*?\*\//g, '').split(';')) {
    const t = d.trim().replace(/\s+/g, ' ');
    const c = t.indexOf(':');
    if (c === -1 || !t.slice(c + 1).trim()) continue;
    out.set(t.slice(0, c).trim(), t.slice(c + 1).trim().replace(/!important$/, ''));
  }
  return out;
};

// Flatten the approved sheet keeping each rule inside its at-rule context.
const flat = (nodes, at) => {
  const out = [];
  for (const n of nodes) {
    if (n.head.startsWith('@')) {
      if (n.head.startsWith('@keyframes')) { out.push({ at, kind: 'keyframes', head: n.head, body: n.body }); continue; }
      out.push(...flat(parse(n.body), [...at, n.head.split('{')[0].trim()]));
      continue;
    }
    // Scope = rules touching a class the mock's markup uses, plus `:root`, which carries
    // the design tokens every other rule in the sheet reads.
    const cs = cls(n.head);
    if (cs.length ? !cs.some((c) => used.has(c)) : n.head.trim() !== ':root') continue;
    out.push({ at, kind: 'rule', head: n.head, body: n.body });
  }
  return out;
};

const globalsRaw = readFileSync(CSS, 'utf8');
const globals = globalsRaw.replace(/\r\n/g, '\n');
// The block this script wrote in a previous run. --apply compares against the file with that
// block cut off, so re-running regenerates the patch instead of measuring its own output.
const cut = globals.indexOf(MARKER);
const base = cut === -1 ? globals : globals.slice(0, cut).replace(/\s+$/, '\n');
const forIndex = apply ? base : globals;
// Index what globals.css actually resolves to. A base-scope rule still applies inside a
// @media, and an ancestor query applies inside a nested one, so a value is looked up
// through every chain that encloses the tested context. @layer is not an enclosing
// condition — it only changes precedence, and unlayered author CSS beats any layer
// regardless of order, so layered rules are merged first.
const live = new Map();
const index = (nodes, at, layered) => {
  for (const n of nodes) {
    if (n.head.startsWith('@')) {
      if (n.head.startsWith('@keyframes')) continue;
      const head = n.head.split('{')[0].trim();
      const inLayer = head.startsWith('@layer');
      index(parse(n.body), inLayer ? at : [...at, head], layered || inLayer);
      continue;
    }
    const props = propsOf(n.body);
    for (const sel of n.head.split(',')) {
      const arr = live.get(normSel(sel)) || [];
      arr.push({ ctx: at.join(' '), props, layered });
      live.set(normSel(sel), arr);
    }
  }
};
index(parse(forIndex), [], false);

const encloses = (outer, inner) => outer === '' || outer === inner || inner.startsWith(outer + ' ');
function resolves(sel, ctx) {
  const entries = live.get(sel);
  if (!entries) return null;
  const out = new Map();
  for (const pass of [true, false]) {
    for (const e of entries) {
      if (e.layered !== pass || !encloses(e.ctx, ctx)) continue;
      for (const [p, v] of e.props) out.set(p, v);
    }
  }
  return out;
}

const missing = [];
for (const r of flat(parse(style), [])) {
  if (r.kind === 'keyframes' && !new RegExp(`@keyframes\\s+${r.head.replace(/@keyframes\s*/, '').trim()}\\b`).test(forIndex)) {
    missing.push({ ctx: r.at.join(' '), body: [`${r.head} {${r.body}}`], differs: false });
  }
}
// The mock overrides some of its own rules later in the same sheet (.pick-head h3,
// .stamp), so cascade its rules in order before comparing.
const want2 = new Map();
for (const r of flat(parse(style), [])) {
  if (r.kind === 'keyframes') continue;
  for (const sel of r.head.split(',')) {
    const k = `${r.at.join(' ')}|${normSel(sel)}`;
    const merged = want2.get(k) || { head: '', props: new Map() };
    for (const [p, v] of propsOf(r.body)) merged.props.set(p, v);
    want2.set(k, { ...merged, head: r.head });
  }
}
// Approved declarations the React tree must not copy verbatim, keyed `at-context|selector|
// property`. The mock keeps a static DOM and toggles classes; here React swaps the node, so
// porting the rule would hide content that is supposed to appear. Listed in the report.
const DEVIATIONS = {
  '|.success|display':
    'the mock hides a success panel that sits in the DOM next to the form (.success.is-show); ContactSection renders it in place of the form, so display:none would blank the confirmation',
};
const waived = new Set();

for (const [k, w] of want2) {
  const ctx = k.split('|')[0];
  const sel = k.slice(ctx.length + 1);
  const have = resolves(sel, ctx);
  const patch = new Map();
  for (const [p, v] of w.props) {
    if (DEVIATIONS[`${ctx}|${sel}|${p}`]) { waived.add(`${ctx}|${sel}|${p}`); continue; }
    if (have?.get(p) !== v) patch.set(p, v);
  }
  if (!patch.size) continue;
  const body = `${w.head} { ${[...patch].map(([p, v]) => `${p}: ${v}`).join('; ')}; }`;
  missing.push({ ctx, body: [body], differs: !!have });
}

// A comma head (`.dark h1, .dark h2`) becomes one want2 entry per selector, so the same
// body can be queued twice. Identical strings inside one context are the same declaration;
// differing ones are genuinely different patches and both are kept.
const unique = [];
const seen = new Set();
for (const m of missing) {
  const k = `${m.ctx}|${m.body.join(' ')}`;
  if (seen.has(k)) continue;
  seen.add(k);
  unique.push(m);
}

const groups = [];
for (const m of unique) {
  const last = groups[groups.length - 1];
  if (last && last.ctx === m.ctx && last.differs === m.differs) last.body.push(...m.body);
  else groups.push({ ctx: m.ctx, body: [...m.body], differs: m.differs });
}

const ruleCount = unique.length;
const inScope = flat(parse(style), []).length;
const absentCount = unique.filter((m) => !m.differs).length;
const diffCount = unique.filter((m) => m.differs).length;
console.log(`approved <style>: ${style.length} B → ${OUT}`);
console.log(`classes used by the mock's markup: ${used.size}`);
console.log(`rules in scope: ${inScope} · selector absent from globals.css: ${absentCount}` +
  ` · resolves to a different value: ${diffCount} · deliberately waived: ${waived.size}`);
for (const k of waived) console.log(`  WAIVED ${k.replace('|', '')} — ${DEVIATIONS[k]}`);
for (const m of unique) console.log(`  ${m.differs ? 'VALUE ' : 'ABSENT'} ${m.ctx ? m.ctx + ' { ' : ''}${m.body.join(' ')}${m.ctx ? ' }' : ''}`);
const patchText = [MARKER, ...groups.map((g) => {
  const body = g.body.map((b) => '  ' + b).join('\n');
  return g.ctx ? `${g.ctx} {\n${body}\n}` : body;
})].join('\n') + `\n\n/* ${ruleCount} rules, ${groups.length} groups */\n`;

if (emit) console.log('\n' + patchText);
if (apply) {
  const crlf = globalsRaw.includes('\r\n');
  const out = base.replace(/\s+$/, '\n') + '\n' + patchText;
  writeFileSync(CSS, crlf ? out.replace(/\n/g, '\r\n') : out);
  console.log(`\n${CSS}: ${absentCount + diffCount} rules written, ${base.split('\n').length - 1} + patch lines`);
}
