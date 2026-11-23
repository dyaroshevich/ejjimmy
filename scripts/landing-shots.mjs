// Measures the landing at phone + desktop widths: full-page screenshots,
// computed styles for the design-system classes, console errors, overflow.
// usage: node scripts/landing-shots.mjs [--base http://localhost:3001]

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

// The contrast walk lives in one file shared with scripts/contrast-audit.mjs. Read raw, not
// imported: its text is spliced into the expression handed to the page.
const CONTRAST_CORE = fs.readFileSync('scripts/lib/contrast-core.js', 'utf8');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9412;
const base = (() => {
  const i = process.argv.indexOf('--base');
  return i === -1 ? 'http://localhost:3001' : process.argv[i + 1];
})();
const outDir = 'shots/landing';
fs.mkdirSync(outDir, { recursive: true });

// One list drives the section-height report and the per-band crops, so a band cannot be
// measured in one place and missing from the other.
const CROPS = [
  ['header', 'header.site-header'], ['hero', '.ch-hero'], ['segments', '#segments'],
  ['systems', '#systems'], ['cases', '#cases'], ['sigen', '#sigen'], ['steps', '#steps'],
  ['knowledge', '#knowledge'], ['contact', '#contact'], ['footer', 'footer.site-footer'],
];

const PROBE = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(1200);
  // Lazy-loaded images never decode outside the viewport and captureBeyondViewport does
  // not scroll — walk the page first so broken-src detection is meaningful. The page sets
  // scroll-behavior: smooth, so every jump must use behavior:'instant' or the animated
  // scroll lags a step behind and the lower half of the page is never seen.
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
    window.scrollTo({ top: y, behavior: 'instant' });
    await sleep(160);
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  await sleep(600);
  for (let t = 0; t < 40 && [...document.images].some((i) => !i.complete); t++) await sleep(250);
  const pick = [
    ['.ch-hero', ['position']], ['.ch-grid', ['grid-template-columns']], ['.collage', ['display', 'grid-template-columns']],
    ['.ch-grid h1', ['font-size', 'line-height', 'margin']],
    ['.frame', ['aspect-ratio', 'border-radius']], ['.slide', ['flex-basis', 'aspect-ratio']], ['.strip', ['display', 'overflow-x']],
    ['.count', ['display']], ['.stamp', ['width']],
    ['.kicker', ['color', 'font-size']], ['.grad', ['background-image']], ['.hl', ['color']],
    ['.sec-head', ['max-width', 'margin-bottom']],
    ['.tier-strip', ['grid-template-columns']], ['.products', ['grid-template-columns']],
    ['.kit-photo', ['width']], ['.brand-mark', ['width']], ['.btn--sm', ['min-height']],
    ['#cases .grid2', ['grid-template-columns', 'gap']], ['.case-img', ['aspect-ratio']],
    ['.case-stats', ['grid-template-columns', 'background-color']], ['.badge--success', ['display']],
    ['.sigen', ['padding']], ['.sigen-grid', ['grid-template-columns']], ['.sigen-metrics', ['grid-template-columns']],
    ['.grid3', ['grid-template-columns']], ['.step-num', ['font-size']],
    ['.tabs', ['display', 'border-radius']], ['.tabs button[aria-selected="true"]', ['background-color', 'color']],
    ['.tabpanel.is-active', ['display', 'grid-template-columns']], ['.qa h3', ['font-size', 'line-height']],
    ['.lead-grid', ['grid-template-columns']], ['.input', ['min-height', 'border-color']],
    ['.field', ['display']], ['.trust-ic', ['width']],
    ['#contact', ['scroll-margin-top', 'background-color']], ['.privacy', ['font-size', 'line-height']],
    ['.foot-grid', ['grid-template-columns', 'gap']], ['.foot-brand', ['display', 'gap']],
    ['.foot-contact-card', ['padding']], ['.foot-qr-mini', ['width', 'height']],
    ['.foot-base', ['display', 'border-top-width']], ['.btn--line', ['background-color', 'min-height']],
    ['.ai-bar-inner', ['max-width', 'border-radius', 'padding-left']], ['.ai-bar-send', ['width', 'height']],
    ['.grid2', ['display', 'gap']], ['.pick', ['display', 'padding', 'background-color']],
    ['.pick-ic', ['width', 'height']], ['.pick--biz', ['background-image']],
    ['.pick-desc', ['font-size', 'line-height']], ['.pick-sub', ['font-size']],
    ['.pick ul li', ['display']], ['.sec-head--center', ['text-align']],
    ['.bar', ['min-height', 'gap']], ['.nav--inline', ['display']], ['nav.nav--strip', ['display', 'overflow-x']],
    ['.locale-btn', ['height', 'width', 'border-radius']], ['.logo-mark', ['width']], ['.header-cta', ['min-height']],
  ];
  const styles = {};
  for (const [sel, props] of pick) {
    const el = document.querySelector(sel);
    if (!el) { styles[sel] = 'MISSING'; continue; }
    const c = getComputedStyle(el);
    styles[sel] = Object.fromEntries(props.map((p) => [p, c[p]]));
  }
  const ids = ${JSON.stringify(CROPS)};
  const sections = ids.map(([id, sel]) => {
    const el = document.querySelector(sel);
    return { id, h: el ? Math.round(el.getBoundingClientRect().height) : null };
  });
  const tiny = [];
  for (const el of document.querySelectorAll('body *')) {
    const c = getComputedStyle(el);
    if (!el.textContent.trim() || el.offsetParent === null) continue;
    if ([...el.children].some((k) => k.textContent.trim().length > 0)) continue;
    const fs2 = parseFloat(c.fontSize);
    if (fs2 < 11.5) tiny.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 40), size: fs2, text: el.textContent.trim().slice(0, 28) });
  }
  // One shared implementation with scripts/contrast-audit.mjs, so the two cannot disagree.
  // The core measures every text leaf; the AA threshold is applied here.
  const low = (() => { ${CONTRAST_CORE} })().filter((x) => x.ratio < (x.large ? 3 : 4.5));
  return JSON.stringify({
    vw: innerWidth,
    overflowX: document.scrollingElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
    pendingImgs: [...document.images].filter((i) => !i.complete).length,
    pendingSrc: [...document.images].filter((i) => !i.complete).map((i) => i.getAttribute('src')).slice(0, 6),
    headers: document.querySelectorAll('header').length,
    footers: document.querySelectorAll('footer').length,
    styles, sections,
    // Uncapped: a slice here once made the console print "25" for a list that was really
    // longer, and two docs quoted that 25 as a measurement.
    tiny,
    tinyCount: tiny.length,
    lowContrast: low.sort((a, b) => a.ratio - b.ratio),
    lowCount: low.length,
  });
})()`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDebugger() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await res.json()).webSocketDebuggerUrl;
    } catch { await sleep(500); }
  }
  throw new Error('chrome devtools never answered');
}

function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  });
  return new Promise((resolve) =>
    ws.addEventListener('open', () =>
      resolve({
        events,
        send(method, params = {}, sessionId) {
          return new Promise((res, rej) => {
            const n = ++id;
            pending.set(n, { resolve: res, reject: rej });
            ws.send(JSON.stringify(sessionId ? { id: n, method, params, sessionId } : { id: n, method, params }));
          });
        },
      }),
    ),
  );
}

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--disable-gpu',
  '--no-first-run', '--user-data-dir=' + path.join(process.env.LOCALAPPDATA || '.', 'landing-shots-profile'),
  'about:blank',
], { stdio: 'ignore' });
console.log('chrome pid ' + chrome.pid);

const url = await waitForDebugger();
const cdp = await connect(url);
const target = (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const page = (await target).find((t) => t.type === 'page');
const session = await cdp.send('Target.attachToTarget', { targetId: page.id, flatten: true });
const sid = session.sessionId;
const send = (method, params = {}) => cdp.send(method, params, sid);

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');

const shapes = [
  { name: "phone", w: 390, h: 844, dsf: 2, mobile: true },
  { name: "desktop", w: 1280, h: 900, dsf: 1, mobile: false },
];

// Drives the catalog: pill filter, show-more, then reads back what the cards claim.
const CATALOG = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.getElementById('systems');
  if (!root) return JSON.stringify({ missing: true });
  const cards = () => root.querySelectorAll('.product--rich').length;
  const pills = [...root.querySelectorAll('.pills button')];
  const out = { pillLabels: pills.map((b) => b.textContent.trim()), initial: cards() };
  const hybrid = pills[3];
  if (hybrid) {
    hybrid.click();
    await sleep(400);
    out.afterHybridPill = cards();
    out.hybridBadge = [...root.querySelectorAll('.product--rich .badge')].map((b) => b.textContent.trim());
    out.hybridPrices = [...root.querySelectorAll('.product--rich .full-price')].map((b) => b.textContent.trim());
    pills[0].click();
    await sleep(400);
  }
  const more = root.querySelector('.more-row button');
  out.moreLabel = more ? more.textContent.trim() : null;
  if (more) {
    more.click();
    await sleep(400);
    out.afterShowMore = cards();
    root.scrollIntoView();
    await sleep(400);
    for (let y = root.offsetTop; y < root.offsetTop + root.offsetHeight; y += innerHeight) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await sleep(120);
    }
    await sleep(800);
  }
  out.emptyPrice = [...root.querySelectorAll('.full-price')].filter((e) => !e.textContent.trim()).length;
  out.unresolved = [...root.querySelectorAll('p,span,b,i,a')].map((e) => e.textContent).filter((t) => /\\{|\\}|undefined|NaN/.test(t)).slice(0, 5);
  const catImgs = [...root.querySelectorAll('img')];
  out.brokenImgs = catImgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
  out.pendingImgs = catImgs.filter((i) => !i.complete).length;
  out.tiers = [...root.querySelectorAll('.tier-strip__item')].map((a) => a.textContent.replace(/\\s+/g, ' ').trim());
  out.stateNote = root.querySelector('.state-note') ? root.querySelector('.state-note').textContent.trim() : null;
  out.skeletons = root.querySelectorAll('.skeleton').length;
  out.sections = ['cases', 'knowledge', 'contact'].map((id) => {
    const el = document.getElementById(id);
    if (!el) return { id, missing: true };
    const note = el.querySelector('.state-note');
    return {
      id,
      cards: el.querySelectorAll('.case-stats, .qa, .field').length,
      panels: el.querySelectorAll('.tabpanel').length,
      activePanel: (() => {
        const a = el.querySelector('.tabpanel.is-active');
        return a ? [a.dataset.panel, a.querySelectorAll('.qa').length].join(':') : null;
      })(),
      broken: [...el.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      unresolved: [...el.querySelectorAll('h3,p,b,span')].map((e) => e.textContent).filter((t) => /\\{|\\}|undefined|NaN/.test(t)).slice(0, 3),
      state: note ? note.textContent.trim() : null,
    };
  });
  return JSON.stringify(out);
})()`;

for (const s of shapes) {
  console.log(`${s.name} ${s.w}x${s.h} — navigating`);
  await send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: s.dsf, mobile: s.mobile });
  cdp.events.length = 0;
  await send('Page.navigate', { url: base + '/' });
  await sleep(6000);
  let probe = await send('Runtime.evaluate', { expression: PROBE, awaitPromise: true, returnByValue: true });
  if (probe.exceptionDetails) throw new Error('PROBE threw in page: ' + probe.exceptionDetails.exception.description);
  let data = JSON.parse(probe.result.value);
  // Next dev intermittently serves a stale React Client Manifest after an edit, which
  // renders the error boundary instead of the page. Touching a client entry rebuilds it.
  for (let attempt = 1; attempt <= 2 && data.headers !== 1; attempt++) {
    console.log(`  page did not render (attempt ${attempt}) — refreshing client manifest`);
    const entry = path.join('src', 'components', 'landing', 'system', 'SystemsGrid.tsx');
    const now = new Date();
    fs.utimesSync(entry, now, now);
    await sleep(7000);
    cdp.events.length = 0;
    await send('Page.navigate', { url: base + '/' });
    await sleep(6000);
    probe = await send('Runtime.evaluate', { expression: PROBE, awaitPromise: true, returnByValue: true });
    if (probe.exceptionDetails) throw new Error('PROBE threw in page: ' + probe.exceptionDetails.exception.description);
    data = JSON.parse(probe.result.value);
  }
  fs.writeFileSync(path.join(outDir, `${s.name}.json`), JSON.stringify(data, null, 2));
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72, captureBeyondViewport: true });
  fs.writeFileSync(path.join(outDir, `${s.name}-full.jpeg`), Buffer.from(shot.data, 'base64'));
  for (const [id, sel] of CROPS) {
    const box = await send('Runtime.evaluate', {
      expression: `(() => { const e = document.querySelector('${sel}'); if (!e) return ''; const r = e.getBoundingClientRect(); return JSON.stringify({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, scale: 1 }); })()`,
      returnByValue: true,
    });
    if (!box.result.value) continue;
    const clip = JSON.parse(box.result.value);
    const el = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: true, clip });
    fs.writeFileSync(path.join(outDir, `${s.name}-${id}.jpeg`), Buffer.from(el.data, 'base64'));
  }
  if (s.name === 'desktop') {
    const cat = await send('Runtime.evaluate', { expression: CATALOG, awaitPromise: true, returnByValue: true });
    if (cat.exceptionDetails) throw new Error('CATALOG threw in page: ' + cat.exceptionDetails.exception.description);
    const c = JSON.parse(cat.result.value);
    fs.writeFileSync(path.join(outDir, 'catalog.json'), JSON.stringify(c, null, 2));
    if (c.missing) {
      console.log('  catalog: #systems not present in the DOM');
    } else {
      console.log(`  catalog: initial ${c.initial} · pill "${c.pillLabels?.[3]}" -> ${c.afterHybridPill} · "${c.moreLabel}" -> ${c.afterShowMore}`);
      console.log(`  catalog: broken ${c.brokenImgs.length} · not yet decoded ${c.pendingImgs} · empty prices ${c.emptyPrice} · unresolved ${c.unresolved.length} · skeletons ${c.skeletons} · state ${c.stateNote}`);
      console.log(`  tiers: ${c.tiers.join(' | ')}`);
      console.log(`  hybrid prices: ${(c.hybridPrices || []).join(' ')}`);
      console.log(`  content: ${(c.sections || []).map((x) => `${x.id} ${x.cards} cards · panels ${x.panels ?? '-'} (active ${x.activePanel ?? '-'}) · broken ${(x.broken || []).length} · unresolved ${(x.unresolved || []).length} · state ${x.state ?? 'none'}`).join(' | ')}`);
    }
  }
  const errs = cdp.events
    .filter((e) => e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
    .map((e) => (e.params.args[0]?.value || e.params.args[0]?.description || '').toString().slice(0, 160));
  console.log(`  overflowX ${data.overflowX} · headers ${data.headers} · footers ${data.footers} · broken ${data.broken.length} · not yet decoded ${data.pendingImgs} · console errors ${new Set(errs).size}`);
  console.log(`  sections: ${data.sections.map((x) => `${x.id}=${x.h}`).join(' ')}`);
  console.log(`  low contrast: ${data.lowCount} nodes below AA · tiny(<11.5px): ${data.tinyCount}`);
  fs.writeFileSync(path.join(outDir, `${s.name}-console.txt`), [...new Set(errs)].join('\n'));
}

chrome.kill();
console.log('written to ' + outDir);
process.exit(0);
