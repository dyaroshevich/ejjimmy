// The :lang(th) hard rule, measured inside ONE page render instead of two file states.
// Why: a blanket rule with no class selector is invisible to scripts/od-style-sync.mjs (it walks the
// mock's classes) and it fires only when <html lang="th"> — which scripts/landing-shots.mjs never
// gets, because headless Chrome sends Accept-Language: en and src/i18n.ts resolves that to 'en'.
// Method: strip the rule from the live stylesheet over CDP, read every Thai-bearing element, put the
// rule back and read again. Same DOM, same fonts, same scroll position — so each delta names the rule.
// usage: node scripts/thai-unit.mjs [http://127.0.0.1:39236]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.argv[2] || 'http://127.0.0.1:39236';
const BANDS = [['hero', '.ch-hero'], ['segments', '#segments'], ['systems', '#systems'],
  ['steps', '#steps'], ['contact', '#contact'], ['footer', 'footer.site-footer']];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = `(() => {
  const Thai = /[\\u0E01-\\u0E3E\\u0E40-\\u0E5B]/;   // excludes U+0E3F, the baht sign on Latin price strings
  const seen = new Map();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const text = (n.nodeValue || '').trim();
    if (!text || !Thai.test(text)) continue;
    const el = n.parentElement;
    if (!el || el.closest('script,style,noscript')) continue;
    const cs = getComputedStyle(el);
    const cls = typeof el.className === 'string' ? el.className.trim().slice(0, 34) : '';
    const key = el.tagName.toLowerCase() + '|' + cls + '|' + cs.fontSize + '|' + text.slice(0, 24);
    if (seen.has(key)) continue;
    seen.set(key, { key, tag: el.tagName.toLowerCase(), cls,
      ls: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
      ws: cs.wordSpacing === 'normal' ? '0px' : cs.wordSpacing,
      lh: cs.lineHeight, fs: cs.fontSize, h: Math.round(el.getBoundingClientRect().height),
      langOwner: el.closest('[lang]') ? el.closest('[lang]').getAttribute('lang') : '(inherit)',
      text: text.slice(0, 40) });
  }
  const bands = {};
  for (const [name, sel] of ${JSON.stringify(BANDS)}) { const el = document.querySelector(sel); bands[name] = el ? Math.round(el.getBoundingClientRect().height) : null; }
  return JSON.stringify({ htmlLang: document.documentElement.lang,
    overflowX: document.scrollingElement.scrollWidth - innerWidth,
    pageH: Math.round(document.scrollingElement.scrollHeight), kinds: [...seen.values()], bands });
})()`;

// The blanket hard rule is the ONLY :lang(th) block that carries `letter-spacing: 0 !important`
// plus `word-spacing`; the sheet also has narrower ones (`.sec-head h2:lang(th)`), so match on the
// signature, not on the selector. Dev serves it un-minified, a build minified — accept either.
const HARD_RE = /:lang\(th\)\s*\{[^{}]*letter-spacing:\s*0\s*!important[^{}]*word-spacing[^{}]*\}/g;
const stripHard = (text) => {
  const removed = [];
  const cut = text.replace(HARD_RE, (m) => { removed.push(m); return ''; });
  return removed.length ? { removed, text: cut } : null;
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'] });
const page = await browser.newPage();
const client = await page.createCDPSession();
const sheets = new Map();
await client.send('DOM.enable');
await client.send('CSS.enable');
client.on('CSS.styleSheetAdded', (e) => sheets.set(e.header.styleSheetId, { header: e.header }));

await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
// The hero rotates its photos on setInterval (HeroSection.tsx:60 and :99), so two stills of the SAME
// CSS differ by ~82% of the fold — measured, see the noise-floor line in the report. Blocking the
// timer before any script runs is what makes a pixel pair mean "the rule moved this ink".
await page.evaluateOnNewDocument(() => {
  window.setInterval = () => 0;
  // Chrome fires `beforeinstallprompt` on its own heuristics, so the PWA banner mounts in some
  // sessions and not others: that is ±3 Thai kinds in the census and a `transition-all` button
  // caught mid-flight in the diff. PWAInstallBanner.tsx:12 bails out on this key, so seed it.
  try { localStorage.setItem('s1-pwa-install-dismissed', String(Date.now())); } catch { }
});
await page.goto(base, { waitUntil: 'networkidle2', timeout: 180000 });
await page.setCookie({ name: 'NEXT_LOCALE', value: 'th', domain: new URL(base).hostname, path: '/' });
await page.reload({ waitUntil: 'networkidle2', timeout: 180000 });
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { window.scrollTo({ top: y, behavior: 'instant' }); await sleep(150); }
  window.scrollTo({ top: 0, behavior: 'instant' }); await sleep(500);
});

// The compiled sheet Next serves is the one carrying the rule; read every sheet's text over CDP.
let target = null;
const seenText = [];
for (const [id, s] of sheets) {
  let text = '';
  try { text = (await client.send('CSS.getStyleSheetText', { styleSheetId: id })).text || ''; } catch { }
  const cut = stripHard(text);
  seenText.push(`${s.header.url ? s.header.url.replace(/^https?:/, '').slice(0, 60) : '(inline)'} ${text.length}B${cut ? '  <- ' + cut.removed.length + ' hard rule(s)' : ''}`);
  if (!target && cut) target = { id, sheet: text, stripped: cut.text, removed: cut.removed };
}
if (!target) { console.log('NO Thai hard rule FOUND in any stylesheet\n   ' + seenText.join('\n   ')); await browser.close(); process.exit(1); }
console.log(`sheets seen: ${sheets.size}; rule found in sheet ${target.id} (${target.sheet.length} B), removed block:\n   ${target.removed.join('\n   ')}`);

// Two captures of the same page can differ for reasons that have nothing to do with a CSS rule: this
// sheet carries three infinite keyframes (.animate-sun-glow, .od-pulse, .hotpulse) and the sheet stops
// them under prefers-reduced-motion. Freeze them, or the pixel pair measures the clock, not the rule.
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await sleep(400);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
// Every state below is produced by rewriting the whole stylesheet over CDP, and the browser then
// ANIMATES the difference: `transition-all` sits on the header bar's buttons and letter-spacing is
// one of the properties it transitions. A capture taken straight after a swap therefore reads a
// value mid-flight — that is what put 0.34 px of tracking on the Thai «ติดตั้ง» button inside the
// restore control, and 238 px of ink inside the noise floor. Kill transitions and keyframes for the
// whole run: the two states stay symmetric, so what is left in a pixel diff is a rule.
await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
const setSheet = async (text) => {
  await client.send('CSS.setStyleSheetText', { styleSheetId: target.id, text });
  await sleep(250);
};

// Equal-size canvases only: an element crop of a band changes height when the rule changes leading,
// so two crops cannot be compared pixel-wise. Scroll the band to the top of a fixed viewport instead.
const scrollTo = async (sel) => {
  await page.evaluate((s) => {
    const el = s ? document.querySelector(s) : null;
    const y = el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : 0;
    window.scrollTo({ top: y, behavior: 'instant' });
  }, sel);
  await sleep(350);
};
const shot = async (tag, sel) => { await scrollTo(sel); await page.screenshot({ path: `shots/thai-rule/${tag}.png` }); };

const dismissBanners = async () => {
  // The cookie/PWA bars animate (`transition-all` also transitions letter-spacing), so a capture taken
  // mid-flight reads a tracking value that is on its way to 0 — which would look like the rule failing.
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter((x) => /ตกลง|OK|ОК|Accept/.test(x.textContent || ''));
    b.forEach((x) => { try { x.click(); } catch { } });
    return b.length;
  });
  await sleep(700);
  return clicked;
};

const banners = await dismissBanners();
// Where the hero's own stack lands, so the pin's effect can be stated as positions and not as an
// impression. `.ai-bar` is fixed, so its top is the line content must stay above.
const LAND = `(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top + window.scrollY), h: Math.round(b.height) }; };
  return { h1: r('.ch-grid h1'), sub: r('.ch-grid .sub'), cta: r('.ch-grid .cta-row'), cta2: r('.ch-grid .cta-row .btn--secondary'), aibar: r('.ai-bar') };
})()`;
const capture = async (tag) => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(200);
  const probe = JSON.parse(await page.evaluate(PROBE));
  probe.land = await page.evaluate(LAND);
  await shot(`${tag}-fold`, null);
  for (const [name, sel] of BANDS.filter(([n]) => ['systems', 'steps', 'contact'].includes(n)))
    await shot(`${tag}-${name}`, sel);
  return probe;
};

const withRule = await capture('rule-on');
await setSheet(target.stripped);
const withoutRule = await capture('rule-off');
// Remove every rule whose prelude says `.ch-grid h1` AND whose body is the Thai pin; the two plain
// `.ch-grid h1` rules (size, margins) must survive, so scan with a cursor instead of one regex.
const stripPin = (text) => {
  const removed = [];
  let out = text, from = 0, at;
  while ((at = out.indexOf('.ch-grid h1', from)) >= 0) {
    const end = out.indexOf('}', at);
    const block = out.slice(at, end + 1);
    if (/line-height:\s*1\.3/.test(block) && /:lang\(th\)/.test(block)) {
      removed.push(block);
      out = out.slice(0, at) + out.slice(end + 1);
    } else from = at + 1;
  }
  return { removed, text: out };
};
// Two more states, so each rule's own contribution is measured instead of folded into the other's:
// blanket rule with NO pin is the state the pin defends against, and it is where the 144 px hero
// line came from — dropping only the pin has to be reachable, not inferred from an earlier edit.
const hardRuleOnly = stripPin(target.sheet);
const neither = stripPin(target.stripped);
await setSheet(hardRuleOnly.text);
const hardRule = await capture('blanket-only');
await setSheet(neither.text);
const neitherState = await capture('neither');
await setSheet(target.sheet);
const restored = await capture('restored');
// Same CSS again, nothing touched in between: whatever differs here is the harness, not the rule.
await setSheet(target.sheet);
const refloor = await capture('noise-floor');
// One long still for the record, taken with the rule on. The rule-off page is 307 px shorter, so a
// full-page pair would be two different canvases and cannot be compared pixel-wise.
await page.screenshot({ path: 'shots/thai-rule/rule-on-full.png', fullPage: true });
await browser.close();
console.log(`banners dismissed: ${banners}`);

// sharp 0.34 has no .diff(), so compare the decoded RGBA directly. Two stills of the SAME page with
// only this rule between them: any pixel that differs is ink the rule moved.
const sharp = (await import('sharp')).default;
const raw = async (p) => { const img = sharp(p); const m = await img.metadata(); return { m, buf: await img.raw().toBuffer() }; };
const diff = async (pa, pb, threshold = 12) => {
  try {
    const [A, B] = [await raw(pa), await raw(pb)];
    if (A.m.width !== B.m.width || A.m.height !== B.m.height)
      return `${A.m.width}x${A.m.height} vs ${B.m.width}x${B.m.height} — different canvas, no pixel compare`;
    let n = 0, top = -1, bottom = -1;
    const W = A.m.width, H = A.m.height, ch = A.m.channels;
    for (let i = 0; i < A.buf.length; i += ch) {
      let d = false;
      for (let c = 0; c < 3; c++) if (Math.abs(A.buf[i + c] - B.buf[i + c]) > threshold) { d = true; break; }
      if (!d) continue;
      n++; const y = Math.floor(i / ch / W);
      if (top < 0) top = y; bottom = y;
    }
    return `${W}x${H}  ink moved on ${n.toLocaleString()} px = ${(100 * n / (W * H)).toFixed(2)}%  rows ${top}..${bottom}`;
  } catch (e) { return `${pa} vs ${pb}: ${e.message.split('\n')[0]}`; }
};
const diffs = [];
for (const f of ['fold', 'systems', 'steps', 'contact'])
  diffs.push([f, await diff(`shots/thai-rule/rule-off-${f}.png`, `shots/thai-rule/rule-on-${f}.png`)]);
diffs.push(['restored vs rule-on', await diff('shots/thai-rule/restored-fold.png', 'shots/thai-rule/rule-on-fold.png')]);
diffs.push(['pin: blanket-only vs both', await diff('shots/thai-rule/blanket-only-fold.png', 'shots/thai-rule/rule-on-fold.png')]);
diffs.push(['NOISE FLOOR (same CSS twice)', await diff('shots/thai-rule/noise-floor-fold.png', 'shots/thai-rule/rule-on-fold.png')]);

const key = (k) => k.key;
const bMap = new Map(withoutRule.kinds.map((k) => [key(k), k]));
const aMap = new Map(withRule.kinds.map((k) => [key(k), k]));
const rows = [];
for (const [kk, a] of aMap) { const b = bMap.get(kk); if (b && (b.ls !== a.ls || b.lh !== a.lh || b.ws !== a.ws)) rows.push({ a, b }); }

const lines = [];
const say = (s) => { lines.push(s); console.log(s); };
say(`html[lang]=${withRule.htmlLang}  overflowX without rule=${withoutRule.overflowX} with=${withRule.overflowX}  restored=${restored.overflowX}`);
say(`page height: no rule ${withoutRule.pageH}  with rule ${withRule.pageH}  restored ${restored.pageH}`);
say(`Thai-bearing kinds: ${withoutRule.kinds.length} without rule / ${withRule.kinds.length} with rule`);
say(`letter-spaced kinds: ${withoutRule.kinds.filter((k) => k.ls !== '0px').length} -> ${withRule.kinds.filter((k) => k.ls !== '0px').length}   (restored ${restored.kinds.filter((k) => k.ls !== '0px').length})`);
say(`word-spaced kinds:   ${withoutRule.kinds.filter((k) => k.ws !== '0px').length} -> ${withRule.kinds.filter((k) => k.ws !== '0px').length}`);
const heroOf = (r) => r.kinds.find((k) => k.fs === '80px') || {};
say(`hero H1 (80px) leading: ${heroOf(neitherState).lh || '?'} with neither rule -> ${heroOf(hardRule).lh || '?'} with the blanket rule alone -> ${heroOf(withoutRule).lh || '?'} with the pin alone -> ${heroOf(withRule).lh || '?'} with both   (pin blocks stripped: ${hardRuleOnly.removed.length})`);
say(`page height: neither ${neitherState.pageH}  blanket alone ${hardRule.pageH}  pin alone ${withoutRule.pageH}  both ${withRule.pageH}`);
say(`hero band: neither ${neitherState.bands.hero}  blanket alone ${hardRule.bands.hero}  pin alone ${withoutRule.bands.hero}  both ${withRule.bands.hero}`);
say('hero stack (top px from the top of the document, .ai-bar is fixed so its top is the line to stay above):');
for (const [n, s] of [['neither', neitherState], ['blanket alone', hardRule], ['pin alone', withoutRule], ['both (as filed)', withRule]]) {
  const l = s.land;
  say(`   ${n.padEnd(16)} h1 ${l.h1.top}+${l.h1.h}  sub ${l.sub.top}  cta-row ${l.cta.top}+${l.cta.h}  2nd CTA ${l.cta2.top}..${l.cta2.top + l.cta2.h}  ai-bar top ${l.aibar ? l.aibar.top : '?'}`);
}
// The instrument's own control: after putting the sheet text back, the render must equal the first
// one node for node. Anything else means the CDP round-trip, not the rule, is what moved.
const rMap = new Map(restored.kinds.map((k) => [key(k), k]));
const drift = withRule.kinds.filter((k) => { const r = rMap.get(k.key); return !r || r.ls !== k.ls || r.lh !== k.lh || r.h !== k.h; });
say(`restored vs rule-on: ${drift.length} kinds differ` + (drift.length ? ' -> ' + drift.map((k) => `${k.tag}.${k.cls || '-'} "${k.text}" ls ${k.ls} vs ${rMap.get(k.key)?.ls}`).join('; ') : ''));
say(`kinds whose tracking or leading the rule changes: ${rows.length}`);
say('');
say('   letter-spacing        line-height          element                       font-size  height px   text');
for (const { a, b } of rows.sort((x, y) => Math.abs(y.b.h - y.a.h) - Math.abs(x.b.h - x.a.h)))
  say(`   ${b.ls.padEnd(9)}->${a.ls.padEnd(9)} ${b.lh.padEnd(10)}->${a.lh.padEnd(10)} ${(a.tag + '.' + (a.cls || '-')).padEnd(30)} ${a.fs.padEnd(9)} ${String(b.h).padStart(5)}->${String(a.h).padEnd(5)}  "${a.text}"`);
say('');
say('bands (height px, no rule -> with rule):');
for (const name of Object.keys(withRule.bands))
  say(`   ${name.padEnd(9)} ${String(withoutRule.bands[name]).padStart(5)} -> ${String(withRule.bands[name]).padEnd(5)} (+${withRule.bands[name] - withoutRule.bands[name]})`);

say('');
say('stills: pixels that differ when only the rule differs');
for (const [name, d] of diffs) say(`   ${name.padEnd(20)} ${d}`);

fs.writeFileSync('shots/thai-rule/unit.txt', lines.join('\n') + '\n');
fs.writeFileSync('shots/thai-rule/unit.json', JSON.stringify({ withRule, withoutRule, hardRule, neitherState, restored, changed: rows.map((r) => r.a.key) }, null, 1));
