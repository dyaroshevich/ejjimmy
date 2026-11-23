// "Make it like the reference" as a number: the left/right edge of every probed node, measured in
// the frozen mock and in the live page with one walk, then diffed. The mock wraps all nine bands in
// one page-level `.wrap`; the live tree gives each band its own inner `.wrap` (or, for the tinted
// bands, no wrap at all — their gutter comes from the bleed padding). Both shapes render the same
// box, and only one of them can break: a band that forgets its `.wrap` runs edge-to-edge on a phone
// while every CSS contract in the repo stays green, because no rule is missing — a node is.
//   node scripts/band-edges.mjs <live-url> [width]     # default 390
//   node scripts/band-edges.mjs --only <url> [width]   # one target, no diff
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// repo-relative so a fresh clone measures its own copy of the frozen mock
const MOCK = pathToFileURL(`${process.cwd()}/docs/design/opendesign/tawanpower-landing-unified.html`).href;
const args = process.argv.slice(2);
const only = args.includes('--only');
const live = args.find((a) => !a.startsWith('--') && /:\/\//.test(a));
const W = Number(args.find((a) => /^\d+$/.test(a)) || 390);
const targets = only || !live ? [live || MOCK] : [MOCK, live];
// Edges the live page is ordered to hold differently from the frozen mock. Declaring them here keeps
// the gate at 0 while leaving the deviation on the record with its reason — `od-style-sync` cannot see
// either one, because the mock's rule and ours are both present and only the media query differs.
const DEVIATIONS = {
  'footer link': "owner's order 2026-10-19: `.foot-col` becomes a 2x2 grid below 900px (globals.css:1306-1309)",
  'systems card': "owner's order 2026-10-19: below 760px the catalog is swiped, so a card holds 86% of the strip and leaves the next one peeking (globals.css:558-569)",
  'steps item': "owner's order 2026-11-07: below 760px the three steps are swiped, same 86% card as the catalog, so the strip's second card peeks and the card's right edge is wider than the mock's stacked column (globals.css:1789-1807)",
};

const PROBES = [
  ['hero strip', '#top .strip, .strip'],
  ['hero collage', '#top .collage, .collage'],
  ['services head', '#features .sec-head'],
  ['services card', '#features .grid4 > *'],
  ['systems head', '#systems .sec-head'],
  ['tier strip', '#systems .tier-strip'],
  ['tier item', '#systems .tier-strip > *'],
  ['cat pills', '#systems .pills'],
  ['systems card', '#systems .products > *'],
  ['footer col', 'footer .foot-col'],
  ['footer link', 'footer .foot-col a'],
  ['case card p', '#cases .card > p'],
  ['sigen box', '#sigen .sigen'],
  ['sigen image', '#sigen .sigen-img, #sigen .sigen-grid > *:last-child'],
  ['cases card', '#cases .grid2 > *'],
  ['steps item', '#steps .grid3 > *, #steps .grid2 > *'],
  ['knowledge panel', '#knowledge .tabpanel.is-active, #knowledge .qa'],
  ['contact grid', '#contact .lead-grid'],
  ['footer grid', 'footer .foot-grid, .foot-grid'],
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const results = new Map();
for (const base of targets) {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  // the harness sends Accept-Language: en, which next-intl puts above defaultLocale: 'th'; the
  // Thai leading is what moves these boxes, so pin the locale the owner actually ships in.
  if (/127\.0\.0\.1|localhost/.test(base)) {
    await page.setCookie({ name: 'NEXT_LOCALE', value: 'th', domain: new URL(base).hostname, path: '/' });
  }
  await page.goto(base, { waitUntil: 'networkidle2', timeout: 300000 });
  // reveal-on-scroll leaves below-fold nodes at opacity 0; geometry is unaffected, but a transition
  // mid-flight would be read as a measurement.
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  results.set(base, await page.evaluate((probes) => {
    const out = {};
    for (const [label, sel] of probes) {
      const el = document.querySelector(sel);
      if (!el) { out[label] = null; continue; }
      const r = el.getBoundingClientRect();
      const band = el.closest('section, footer') || el.parentElement;
      const br = band ? band.getBoundingClientRect() : null;
      out[label] = {
        left: Math.round(r.left), right: Math.round(innerWidth - r.right),
        w: Math.round(r.width), h: Math.round(r.height),
        band: band ? (band.id || band.tagName.toLowerCase()) : '-',
        bandLeft: br ? Math.round(br.left) : 0, bandRight: br ? Math.round(innerWidth - br.right) : 0,
      };
    }
    return out;
  }, PROBES));
  await page.close();
}
await browser.close();

const gutter = Math.round(Math.min(48, Math.max(20, W * 0.04)));
const lines = [`viewport ${W} · gutter should be clamp(20px,4vw,48px) = ${gutter} px here`];
for (const [base, rows] of results) {
  lines.push(`\n== ${base}`);
  for (const [label, r] of Object.entries(rows)) {
    if (!r) { lines.push(`  ${label.padEnd(16)} MISSING`); continue; }
    const bleed = r.left === 0 && r.right === 0 ? '  <-- edge to edge' : '';
    lines.push(`  ${label.padEnd(16)} L${String(r.left).padStart(3)} R${String(r.right).padStart(3)} w${String(r.w).padStart(4)}`
      + ` h${String(r.h).padStart(5)}  in ${r.band} (L${r.bandLeft} R${r.bandRight})${bleed}`);
  }
}

if (results.size === 2) {
  const [mock, liveRows] = [...results.values()];
  const diffs = [];
  const declared = [];
  for (const label of Object.keys(PROBES.reduce((a, [l]) => (a[l] = 1, a), {}))) {
    const m = mock[label], l = liveRows[label];
    if (!m || !l) { if (m || l) diffs.push(`${label.padEnd(16)} present in one target only (mock ${m ? 'y' : '-'}, live ${l ? 'y' : '-'})`); continue; }
    // width/height may legitimately differ (Thai leading, clamped copy, real catalogue rows);
    // the gutter is the thing this instrument exists for, so edges are the gate.
    if (m.left !== l.left || m.right !== l.right) {
      const row = `${label.padEnd(16)} mock L${m.left} R${m.right} -> live L${l.left} R${l.right}`;
      (DEVIATIONS[label] ? declared : diffs).push(`${row}${DEVIATIONS[label] ? `   declared: ${DEVIATIONS[label]}` : ''}`);
    }
  }
  lines.push(`\nGATE - probed nodes whose edge differs from the approved mock and is not declared: ${diffs.length} (must be 0)`);
  lines.push(...diffs.map((d) => `  ${d}`));
  lines.push(`declared deviations from the frozen mock (the owner's order, not a port miss): ${declared.length}`);
  lines.push(...declared.map((d) => `  ${d}`));
}
const out = lines.join('\n');
fs.mkdirSync('shots', { recursive: true });
fs.writeFileSync(`shots/band-edges-${W}.txt`, out + '\n');
console.log(out);
