/**
 * How close is the live landing to the design approved in Open Design?
 *   node scripts/od-fidelity.mjs [base-url] [locale=en,ru,th]
 *   node scripts/od-fidelity.mjs --html shots/landing/probe.html th
 *
 * The approved reference is docs/design/opendesign/tawanpower-landing-unified.html
 * (copied verbatim from the Open Design project
 * K:\designs\open design\tawanpower-design-system-bba8\, 2026-10-17 17:08).
 * Everything below is measured against that file, not against memory or .audit.html.
 *
 * --html reads the DOM from a captured page instead of fetching one: `next dev` needs
 * minutes to answer `/` after globals.css changes, and a captured DOM answers the copy
 * question just as well. Name the locale that capture was rendered in.
 */
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const htmlAt = argv.indexOf('--html');
const htmlFile = htmlAt === -1 ? null : argv[htmlAt + 1];
if (htmlAt !== -1) argv.splice(htmlAt, 2);
const base = argv[0] || 'http://127.0.0.1:39236';
const locales = (argv[1] || (htmlFile ? 'th' : 'en,ru,th')).split(',');
const REF = 'docs/design/opendesign/tawanpower-landing-unified.html';
const od = readFileSync(REF, 'utf8').replace(/\r\n/g, '\n');
const globals = readFileSync('src/app/globals.css', 'utf8').replace(/\r\n/g, '\n');

const norm = (s) => s.replace(/[’‘`]/g, "'").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

/* ---------- 1. section set + order ---------- */
const odSections = [...od.matchAll(/<section[^>]*class="[^"]*"[^>]*data-od-id="(uni-[a-z]+)"/g)]
  .map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);

/* ---------- 2. per-locale string fidelity ---------- */
const bounds = [...od.matchAll(/data-od-id="(uni-[a-z]+)"/g)].map((m) => ({ at: m.index, id: m[1] }));
const sectionAt = (pos) => [...bounds].reverse().find((b) => b.at <= pos)?.id || '(outside)';

const rows = [];
for (const loc of locales) {
  const html = htmlFile
    ? readFileSync(htmlFile, 'utf8')
    // The middleware pins an unprefixed path to Thai, so the header cannot choose the language:
    // only /<locale>/ does. (It rewrites to the same page and sets NEXT_LOCALE.)
    : await (await fetch(`${base}${loc === 'th' ? '' : `/${loc}`}/`, { headers: { 'Accept-Language': loc } })).text();
  if (!html.includes('<html')) { console.error(`FAILED to fetch ${base}/ as ${loc}`); process.exit(2); }
  // React splits any text built from more than one expression with an empty comment
  // ("Home<!-- --> · 5 kW"), which breaks a plain substring search for the approved string.
  const live = norm(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<!--[\s\S]*?-->/g, ''));
  const set = new Map();
  for (const m of od.matchAll(new RegExp(`data-${loc}="([^"]+)"`, 'g'))) {
    const t = norm(m[1]);
    if (t.length > 3 && !set.has(t)) set.set(t, sectionAt(m.index));
  }
  const missing = [...set].filter(([t]) => !live.includes(t));
  rows.push({ loc, total: set.size, hit: set.size - missing.length, missing });

  if (loc === 'en') {
    const ids = [...live.matchAll(/id="([a-z0-9-]+)"/g)].map((m) => m[1]);
    console.log(`live section ids: ${ids.join(' → ')}`);
    console.log(`live data-od-id refs: ${(html.match(/data-od-id/g) || []).length} (approved: ${odSections.length})`);
  }
}

/* ---------- 3. class coverage ---------- */
const odClasses = new Set();
for (const m of od.matchAll(/class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) odClasses.add(c);
const used = [...odClasses].filter((c) => new RegExp(`\\.${c.replace(/[-]/g, '\\-')}[\\s,{:.>\\]]`).test(od));
const unstyled = used.filter((c) => !new RegExp(`\\.${c.replace(/[-]/g, '\\-')}\\b`).test(globals));

/* ---------- 4. token parity (:root only) ---------- */
const rootVars = (s) => {
  const o = {};
  for (const m of s.matchAll(/:root[^{]*\{([\s\S]*?)\}/g))
    for (const v of m[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) o[v[1]] ||= v[2].trim();
  return o;
};
// approved-DESIGN.md: "File contract: tokens.css is the single source of truth."
const A = rootVars(readFileSync('docs/design/opendesign/approved-tokens.css', 'utf8').replace(/\r\n/g, '\n'));
const B = rootVars(globals);
const shared = Object.keys(A).filter((k) => k in B);
const tdiff = shared.filter((k) => A[k] !== B[k]);

/* ---------- report ---------- */
console.log(`\napproved sections (data-od-id): ${odSections.join(' → ')}`);
console.log(`approved CSS classes in markup: ${used.length} · not defined in globals.css: ${unstyled.length}`);
if (unstyled.length) console.log('  ' + unstyled.slice(0, 40).join(' '));
console.log(`\n:root tokens approved ${Object.keys(A).length} · live ${Object.keys(B).length} · in both ${shared.length} ` +
  `(identical ${shared.length - tdiff.length}, differing ${tdiff.length}, absent from live ${Object.keys(A).filter((k) => !(k in B)).length})`);
for (const k of tdiff) console.log(`  ${k}: approved ${A[k]}  ·  live ${B[k]}`);
console.log('\nstring fidelity vs approved:');
for (const r of rows) {
  console.log(`  ${r.loc}: ${r.hit}/${r.total} = ${Math.round((100 * r.hit) / r.total)}%  (missing ${r.missing.length})`);
}
const worst = rows[0];
const bySec = new Map();
for (const [t, sec] of worst.missing) bySec.set(sec, [...(bySec.get(sec) || []), t]);
console.log(`\nmissing ${worst.loc} strings (${worst.missing.length}), by approved band:`);
for (const [sec, list] of bySec) {
  console.log(`  ${sec} — ${list.length}`);
  for (const t of list) console.log('    - ' + t);
}
console.log(`\nverdict: ${rows.every((r) => r.hit === r.total) && !unstyled.length ? 'MATCHES approved design' : 'DIVERGES from approved design'}`);
