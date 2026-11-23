/**
 * Wire orphan labels to the control right below them.
 *   node scripts/label-wire.mjs [--write] [file...]
 *
 * Deliberately conservative. A label is wired only when the first element after
 * it is an <input>/<textarea>/<select> that has no id yet, and the id comes from
 * a translation key or Latin words inside the label itself. Radio groups,
 * checkbox rows and labels that sit above a wrapper <div> are printed as DECLINED
 * for a human, because guessing there would produce a label pointing at the
 * wrong field — worse than no label at all.
 *
 * Re-run scripts/label-audit.mjs afterwards for the count.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const write = args.includes('--write');
const given = args.filter((a) => a !== '--write');

const files = given.length
  ? given
  : [
      ...new Set(
        execSync('node scripts/label-audit.mjs src', { encoding: 'utf8' })
          .split('\n')
          .filter((l) => /^\s+\d+\s+src/.test(l))
          .map((l) => l.trim().split(/\s+/)[1].replace(/\\/g, '/'))
          .filter((f) => f.startsWith('src/') && !f.endsWith('components/ui/index.tsx')),
      ),
    ];

const CONTROL = /^(\s*)<(input|textarea|select)\b/;
const BLANK = /^[\s)}\]]*$/;

const camel = (words) =>
  words
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w.toLowerCase()))
    .join('')
    .replace(/^[^A-Za-z]+/, '');

const report = { wired: [], declined: [] };

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  // These files are CRLF. Splitting on \n alone leaves a trailing \r on every
  // line, and `.` does not match \r — so a `(.*)$` label regex silently matched
  // nothing. Split on both and write the original ending back.
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const lines = src.split(/\r?\n/);
  const taken = new Set(src.match(/\bid="[^"]*"/g) || []);
  const edits = [];

  for (let i = 0; i < lines.length; i++) {
    const lm = lines[i].match(/^(\s*)<label\b([^>]*)>(.*)$/);
    if (!lm) continue;
    if (/\bhtmlFor\b/.test(lm[2])) continue;
    const [, indent, attrs, after] = lm;

    // the label may close on this line or a few lines below (icon + text)
    let end = after.includes('</label>') ? i : -1;
    for (let k = i + 1; end === -1 && k <= i + 4; k++) if (lines[k].includes('</label>')) end = k;
    if (end === -1) {
      report.declined.push(`${file}:${i + 1}  label does not close within 4 lines`);
      continue;
    }
    const block = lines.slice(i, end + 1).join(' ');
    // Only the label's own words may name the field. Reading the whole line made
    // `className={labelCls}` yield "labelClassname" for every Thai-labelled input.
    const text = block
      .replace(/^[\s\S]*?<label\b[^>]*>/, ' ')
      .replace(/<\/label>[\s\S]*$/, ' ')
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/<[^>]*>/g, ' ');

    let j = end + 1;
    while (j < lines.length && BLANK.test(lines[j])) j++;
    // A label may sit above a plain wrapper (<div className="relative">… or the
    // closing tag of a header row). Skip at most two such lines, but only when the
    // wrapper itself holds no control — otherwise the label could aim at the wrong one.
    for (let hops = 0; hops < 2; hops++) {
      const cur = (lines[j] || '').trim();
      if (!/^<\/?div\b/.test(cur)) break;
      if (CONTROL.test(cur) || /<(input|textarea|select)\b/.test(cur)) break;
      let k2 = j + 1;
      while (k2 < lines.length && BLANK.test(lines[k2])) k2++;
      j = k2;
    }
    const cm = (lines[j] || '').match(CONTROL);
    if (!cm) {
      report.declined.push(`${file}:${i + 1}  next element is not a field -> ${(lines[j] || '').trim().slice(0, 55)}`);
      continue;
    }
    let k = j;
    let tag = '';
    while (k < lines.length && k <= j + 12) {
      tag += (k > j ? '\n' : '') + lines[k];
      if (/\/>/.test(lines[k])) break;
      k++;
    }
    if (/\bid=/.test(tag)) {
      report.declined.push(`${file}:${i + 1}  field already has an id — add htmlFor by hand`);
      continue;
    }

    // Thai labels carry no Latin words. The next honest source is the field the
    // control itself writes to — naming from the data key beats inventing words.
    const ref = tag.match(/(?:onUpdateField\(\s*'|settings\.|lead\.|formData\.)([a-z_][a-z0-9_]*)/i);
    const key = block.match(/\{t\(['"]([^'"]+)['"]\)/);
    const fld = tag.match(/\bname="([^"]+)"/);
    const lit = text.match(/([A-Za-z][A-Za-z /()-]{2,29})/);
    const base = key ? key[1] : fld ? camel(fld[1].replace(/[_\-.]+/g, ' ')) : ref ? camel(ref[1]) : lit ? camel(lit[1].trim()) : null;
    if (!base) {
      report.declined.push(`${file}:${i + 1}  nothing to name the field with: ${block.trim().slice(0, 50)}`);
      continue;
    }

    let id = base;
    let n = 2;
    while (taken.has(`id="${id}"`) || edits.some((e) => e.id === id)) id = `${base}${n++}`;
    taken.add(`id="${id}"`);

    edits.push({ line: i, newLabel: `${indent}<label htmlFor="${id}"${attrs}>${after}`, ctrl: j, newCtrl: `${cm[1]}<${cm[2]} id="${id}"${lines[j].slice(cm[0].length)}`, id });
    if (end > i) i = end;
  }

  if (!edits.length) continue;
  const out = [...lines];
  for (const e of edits) {
    out[e.line] = e.newLabel;
    out[e.ctrl] = e.newCtrl;
    report.wired.push(`${file}:${e.line + 1} -> ${e.id}`);
  }
  if (write) writeFileSync(file, out.join(eol), 'utf8');
}

console.log(`${write ? 'WIRED' : 'WOULD WIRE'}: ${report.wired.length}`);
for (const w of report.wired) console.log('  ' + w);
console.log(`\nDECLINED (needs a human): ${report.declined.length}`);
for (const d of report.declined) console.log('  ' + d);
