// Before/after stills for the blanket :lang(th) rule, taken in the ONE locale where the rule can
// fire. scripts/landing-shots.mjs renders the default UI locale of the harness browser — headless
// Chrome sends Accept-Language: en-US,en, so its `/` is English and a Thai-only CSS rule cannot
// change a pixel there (proved: curl with and without the header flips <html lang> th -> en).
// This probe sets NEXT_LOCALE=th first, then puts the stills and the Thai census in the same render.
// usage: node scripts/thai-shots.mjs <outDir> [http://127.0.0.1:39236]
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.argv[3] || 'http://127.0.0.1:39236';
const outDir = process.argv[2];
if (!outDir) { console.error('usage: node scripts/thai-shots.mjs <outDir> [base]'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

const BANDS = [
  ['hero', '.ch-hero'], ['segments', '#segments'], ['systems', '#systems'],
  ['steps', '#steps'], ['contact', '#contact'],
];

const PROBE = `(() => {
  const Thai = /[\\u0E01-\\u0E3E\\u0E40-\\u0E5B]/;
  const seen = new Set(); const kinds = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const text = (n.nodeValue || '').trim();
    if (!text || !Thai.test(text)) continue;
    const el = n.parentElement;
    if (!el || el.closest('script,style,noscript')) continue;
    const cs = getComputedStyle(el);
    const cls = typeof el.className === 'string' ? el.className.trim().slice(0, 40) : '';
    const ls = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    const key = el.tagName + '|' + cls + '|' + ls + '|' + cs.lineHeight;
    if (seen.has(key)) continue; seen.add(key);
    kinds.push({ key, tag: el.tagName.toLowerCase(), cls, ls, lh: cs.lineHeight, fs: cs.fontSize, text: text.slice(0, 44) });
  }
  const spaced = kinds.filter((k) => k.ls !== '0px');
  const bands = ${JSON.stringify(BANDS.map(([n, s]) => [n, s]))}.map(([name, sel]) => {
    const el = document.querySelector(sel);
    return { name, h: el ? Math.round(el.getBoundingClientRect().height) : null };
  });
  return JSON.stringify({
    htmlLang: document.documentElement.lang,
    overflowX: document.scrollingElement.scrollWidth - innerWidth,
    kinds: kinds.length, spaced: spaced.length, spacedKinds: spaced, allKinds: kinds, bands,
  });
})()`;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

const shapes = [
  { name: 'phone', w: 390, h: 844, dsf: 2, mobile: true },
  { name: 'desktop', w: 1280, h: 900, dsf: 1, mobile: false },
];

const report = [];
for (const s of shapes) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: s.dsf, isMobile: s.mobile });
  await page.setCookie({ name: 'NEXT_LOCALE', value: 'th', domain: new URL(base).hostname, path: '/' });
  await page.goto(base, { waitUntil: 'networkidle2', timeout: 180000 });
  await page.reload({ waitUntil: 'networkidle2', timeout: 180000 });
  // Lazy images never decode outside the viewport and fullPage capture does not scroll: walk first.
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
      window.scrollTo({ top: y, behavior: 'instant' }); await sleep(160);
    }
    window.scrollTo({ top: 0, behavior: 'instant' }); await sleep(600);
    for (let t = 0; t < 40 && [...document.images].some((i) => !i.complete); t++) await sleep(250);
  });
  const r = JSON.parse(await page.evaluate(PROBE));
  report.push({ shape: s.name, ...r });
  const bandSel = Object.fromEntries(BANDS);
  await page.screenshot({ path: path.join(outDir, `${s.name}-full.jpeg`), fullPage: true, quality: 72, type: 'jpeg' });
  for (const [name] of BANDS) {
    const el = await page.$(bandSel[name]);
    if (el) await el.screenshot({ path: path.join(outDir, `${s.name}-${name}.jpeg`), quality: 72, type: 'jpeg' });
  }
  await page.close();
}
await browser.close();

const lines = [`base=${base}  locale=th`];
for (const r of report) {
  lines.push(`\n== ${r.shape}  html[lang]=${r.htmlLang}  overflowX=${r.overflowX}  Thai kinds=${r.kinds}  with letter-spacing=${r.spaced}`);
  for (const k of r.spacedKinds) lines.push(`   BROKEN ${k.ls.padEnd(9)} ${k.tag}.${k.cls.padEnd(24)} ${k.fs.padEnd(7)} lh=${k.lh.padEnd(8)} "${k.text}"`);
  lines.push('   bands: ' + r.bands.map((b) => `${b.name}=${b.h}`).join('  '));
  // Every kind, not only the offenders: the line-height half of the rule changes kinds that were
  // already untracked, so a diff of two census files is the before/after table.
  lines.push('   --- every Thai kind ---');
  for (const k of r.allKinds)
    lines.push(`   ${k.ls.padEnd(9)} ${k.lh.padEnd(9)} ${k.tag}.${k.cls.padEnd(28)} ${k.fs.padEnd(7)} "${k.text}"`);
}
fs.writeFileSync(path.join(outDir, 'thai-census.txt'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(outDir, 'thai-census.json'), JSON.stringify(report, null, 1));
console.log(lines.join('\n'));
