// The seven things about the mobile unit that a screenshot cannot show, with verdicts.
//   A. hero off-screen: the 5 s advance must move neither the page nor the slide.
//   B. hero on-screen: the advance must still run — and still move the page 0 px.
//   C. component anchors keep text-decoration:none under a real :hover.
//   D. replay of the deleted `scrollIntoView` line on the same DOM: this is the defect, on purpose,
//      measured rather than asserted (the owner saw the page jump to the top and could not name it).
//   E. the category pills filter the list under a real thumb, and the three categories partition it.
//   F. the catalog strip swipes under a real finger without widening the page.
//   G. the two bottom notices: readable at the top, no longer covering a band once the page scrolls.
//   node scripts/mobile-behaviour.mjs [port]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const PORT = process.argv[2] || 3476;
const URL = `http://127.0.0.1:${PORT}/`;
const lines = [];
const print = console.log.bind(console);
console.log = (...a) => { const s = a.join(' '); lines.push(s); print(s); };
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setCookie({ name: 'NEXT_LOCALE', value: 'th', domain: '127.0.0.1', path: '/' });
// The PWA install banner and the cookie notice are fixed to the bottom of the phone viewport. Pinned,
// they ate real taps: with `#systems` scrolled to the top, the category pill at y=690 answered
// `elementFromPoint` with the notice's own <p>, so E reported a filter that works as broken.
// They are NOT seeded dismissed any more — G proves the fix itself: readable at the top, gone the
// moment the page scrolls, so every band below the fold is hittable. Seeding them would hide
// exactly what this unit changed.
// Headless Chrome answers `prefers-reduced-motion: reduce`, and useReducedMotion() then stops every
// timer in the component — B would otherwise measure a slideshow that was never running, not a fix.
// `mq` is printed in each read so the pin is visible in the witness, not just in this comment.
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 300000 });

const read = () => page.evaluate(() => ({
  mq: matchMedia('(prefers-reduced-motion: reduce)').matches,
  y: Math.round(window.scrollY),
  stripLeft: Math.round(document.querySelector('.strip')?.scrollLeft ?? -1),
  dot: [...document.querySelectorAll('.dots i')].findIndex((d) => d.classList.contains('on')),
  onScreen: (document.querySelector('.strip')?.getBoundingClientRect().bottom ?? 0) > 0
    && (document.querySelector('.strip')?.getBoundingClientRect().top ?? 0) < innerHeight,
}));
const settle = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); return cond ? 'ok' : `FAIL ${msg}`; };

console.log(`\n${URL} · reduced-motion pin: matches=${(await read()).mq} (false = timers run)`);

// G · the bottom notices. Visible at the top (that is where they are read), transparent to a thumb
// once the page moves (that is where they were stealing taps). `display:none` keeps them mounted.
console.log('G · bottom notices — readable at the top, gone once the page scrolls');
// The notice arms a 1200 ms timer after hydration, and dev hydration of this page is not instant:
// poll for it rather than guess a delay (a fixed wait measured "not shown" on a slow compile).
const cookieSeen = await page
  .waitForSelector('[data-notices] [aria-label="Cookie consent"]', { timeout: 15000 })
  .then(() => true)
  .catch(() => false);
const g0 = await page.evaluate(() => {
  const box = document.querySelector('[data-notices]');
  return {
    y: Math.round(window.scrollY),
    shown: !!box && getComputedStyle(box).display !== 'none',
  };
});
g0.cookie = cookieSeen;
await page.evaluate(() => document.querySelector('.pills').scrollIntoView({ block: 'center' }));
await settle(600);
const g1 = await page.evaluate(() => {
  const box = document.querySelector('[data-notices]');
  const el = document.querySelectorAll('.pills button')[1];
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return {
    y: Math.round(window.scrollY),
    shown: !!box && getComputedStyle(box).display !== 'none',
    hit: hit === el ? 'the pill itself' : hit ? `${hit.tagName.toLowerCase()}.${String(hit.className).slice(0, 22)}` : 'nothing',
  };
});
console.log(`   at top   ${JSON.stringify(g0)}`);
console.log(`   scrolled ${JSON.stringify(g1)}`);
console.log(`   ${check(g0.y <= 8 && g0.shown && g0.cookie && g1.y > 8 && !g1.shown && g1.hit === 'the pill itself',
  'G: the notices must be readable at the top and must not cover a band after a scroll')}`);

console.log('A · strip off-screen (page at #contact) — nothing may move over 2 ticks');
await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
await settle(1200);
const a0 = await read();
await settle(11000);
const a1 = await read();
console.log(`   before ${JSON.stringify(a0)}`);
console.log(`   after  ${JSON.stringify(a1)}`);
console.log(`   page moved ${a1.y - a0.y}px · strip moved ${a1.stripLeft - a0.stripLeft}px · slide advanced ${a1.dot - a0.dot}`);
console.log(`   ${check(!a0.onScreen && a1.y === a0.y && a1.stripLeft === a0.stripLeft && a1.dot === a0.dot,
  'A: an off-screen strip must not move the page, the strip or the slide')}`);

console.log('B · strip on-screen — the advance must still run');
await page.evaluate(() => window.scrollTo(0, 0));
await settle(1200);
const b0 = await read();
await settle(11000);
const b1 = await read();
console.log(`   before ${JSON.stringify(b0)}`);
console.log(`   after  ${JSON.stringify(b1)}`);
console.log(`   page moved ${b1.y - b0.y}px · strip moved ${b1.stripLeft - b0.stripLeft}px · slide advanced ${b1.dot - b0.dot}`);
console.log(`   ${check(b0.onScreen && b1.dot > b0.dot && b1.stripLeft !== b0.stripLeft && b1.y === b0.y,
  'B: on-screen the slide must advance and the strip must scroll, page still 0 px')}`);

console.log('C · hover decoration on component anchors');
for (const [label, sel] of [['.ai-bar-inner', '.ai-bar-inner'], ['a.btn', '#top a.btn'], ['.tier-strip__item', '.tier-strip__item']]) {
  const r = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, sel);
  if (!r) { console.log(`   ${label.padEnd(18)} MISSING`); fails.push(`C: ${label} not rendered`); continue; }
  await page.mouse.move(r.x, r.y);
  const hov = await page.evaluate((s) => {
    const el = document.querySelector(s);
    return { hover: el.matches(':hover'), deco: getComputedStyle(el).textDecorationLine };
  }, sel);
  console.log(`   ${label.padEnd(18)} :hover=${hov.hover} text-decoration-line=${hov.deco}`);
  console.log(`   ${check(hov.hover && hov.deco === 'none', `C: ${label} must hold decoration:none while :hover is applied`)}`);
  await page.mouse.move(2, 2);
}

console.log('D · replay of the removed line on the same DOM — this is what caused it');
await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
await settle(1200);
const d0 = await read();
await page.evaluate(() => {
  const box = document.querySelector('.strip');
  box.children[3].scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
});
await settle(600);
const d1 = await read();
console.log(`   before ${JSON.stringify(d0)}`);
console.log(`   after  ${JSON.stringify(d1)}`);
console.log(`   scrollIntoView({inline:'center',block:'nearest'}) moved the PAGE ${d0.y - d1.y}px`);
console.log(`   ${check(d0.y - d1.y > 1000, 'D: the replay must still jump the page, or this unit proved nothing')}`);

// E · the category pills. The owner asked whether the filters work; a screenshot cannot answer that
// and a `el.click()` fired straight after `networkidle2` answers it wrongly, because a click that
// lands before React has hydrated is swallowed. So: wait for one tap to actually move state, then
// tap each pill with a real touch and check what is left in the DOM.
console.log('E · catalog filters — a real thumb must change the list');
await page.evaluate(() => document.querySelector('.pills').scrollIntoView({ block: 'center' }));
await settle(600);
const geom = (i) => page.evaluate((idx) => {
  const el = document.querySelectorAll('.pills button')[idx];
  const r = el.getBoundingClientRect();
  const x = r.x + r.width / 2, y = r.y + r.height / 2;
  const hit = document.elementFromPoint(x, y);
  return { x, y, label: el.textContent.trim(), hit: hit === el ? 'the pill itself' : hit ? `${hit.tagName.toLowerCase()}.${String(hit.className).slice(0, 22)}` : 'nothing' };
}, i);
const state = () => page.evaluate(() => ({
  pressed: [...document.querySelectorAll('.pills button')].map((b) => b.getAttribute('aria-pressed') === 'true').map((p) => (p ? 1 : 0)).join(''),
  n: document.querySelectorAll('.products > .card').length,
  cats: [...document.querySelectorAll('.products > .card')].map((c) => c.dataset.cat),
  badges: [...document.querySelectorAll('.products > .card .badge')].map((b) => b.textContent.trim()),
}));
const tapPill = async (i) => { const g = await geom(i); await page.touchscreen.tap(g.x, g.y); await settle(450); return g; };
let live = false;
for (let t = 0; t < 24 && !live; t++) {
  await tapPill(2);
  live = (await state()).pressed[2] === '1';
  if (!live) await settle(500);
}
console.log(`   the buttons answer taps: ${live}`);
const totals = [];
const pillCount = await page.evaluate(() => document.querySelectorAll('.pills button').length);
const PILL_CATS = ['all', 'home', 'business', 'hybrid', 'parts'];
for (let i = 0; i < pillCount; i++) {
  const g = await tapPill(i);
  const s = await state();
  const more = await page.$('.more-row button');
  if (more) { await more.evaluate((el) => el.click()); await settle(450); }
  const full = await state();
  const own = i === 0 || full.cats.every((c) => c === PILL_CATS[i]);
  totals.push(full.n);
  console.log(`   "${g.label}" hit=${g.hit} -> pressed[${s.pressed}] ${s.n} shown, ${full.n} all, badges of this category only: ${own}`);
  const want = PILL_CATS.map((_, k) => (k === i ? '1' : '0')).join('');
  console.log(`   ${check(g.hit === 'the pill itself' && s.pressed === want && full.n > 0 && own,
    `E: pill ${i} must be the only pressed one and must leave only its own cards`)}`);
}
const all = totals[0];
const sum = totals.slice(1).reduce((a, b) => a + b, 0);
console.log(`   ${check(sum === all, `E: all ${pillCount} categories must partition the catalog, not overlap or drop rows (${sum} vs ${all})`)}`);

// F · the swipe the owner ordered. `scrollWidth > clientWidth` only proves the box is wider; the
// CDP touch sequence proves a finger moves it, and the page-width read proves the strip did not
// turn into horizontal overflow.
console.log('F · the catalog swipes under a real finger');
await page.evaluate(() => document.querySelector('.products').scrollIntoView({ block: 'center' }));
await settle(600);
const box = await page.evaluate(() => {
  const g = document.querySelector('.products'), r = g.getBoundingClientRect();
  const y = Math.max(60, Math.min(r.top + 220, innerHeight - 60));
  return { x: Math.round(r.x + r.width - 40), y: Math.round(y),
    scrollW: Math.round(g.scrollWidth), clientW: Math.round(g.clientWidth), left: Math.round(g.scrollLeft),
    cardW: Math.round(g.querySelector('.card').getBoundingClientRect().width),
    pageOverflowX: document.documentElement.scrollWidth - window.innerWidth };
});
console.log(`   strip ${box.clientW}px wide holding ${box.scrollW}px of cards, card ${box.cardW}px, page overflow-x ${box.pageOverflowX}px`);
console.log(`   ${check(box.scrollW > box.clientW && box.cardW < box.clientW, 'F: the strip must be wider than its box and a card narrower, or there is nothing to swipe')}`);
const cdp = await page.createCDPSession();
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
await touch('touchStart', box.x, box.y);
for (let s = 1; s <= 6; s++) { await touch('touchMove', box.x - s * 30, box.y); await settle(60); }
await touch('touchEnd');
await settle(900);
const moved = await page.evaluate(() => {
  const g = document.querySelector('.products');
  return { left: Math.round(g.scrollLeft), pageOverflowX: document.documentElement.scrollWidth - window.innerWidth };
});
console.log(`   drag of 180px moved scrollLeft ${box.left} -> ${moved.left} · page overflow-x now ${moved.pageOverflowX}px`);
console.log(`   ${check(moved.left > box.left, 'F: a thumb drag must move the strip')}`);
console.log(`   ${check(moved.pageOverflowX <= 0 && box.pageOverflowX <= 0, 'F: the strip must not widen the page')}`);

await browser.close();
const verdict = `\nGATE - failed checks: ${fails.length} (must be 0)\n${fails.map((f) => `  ${f}`).join('\n')}`;
console.log(verdict);
fs.mkdirSync('shots', { recursive: true });
fs.writeFileSync('shots/mobile-behaviour.txt', lines.join('\n') + '\n');
process.exit(fails.length ? 1 : 0);
