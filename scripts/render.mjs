/**
 * Render any URL at an exact viewport and save a full-page JPEG.
 *   node scripts/render.mjs --url <url> --out shots/x.jpeg [--width 390] [--height 844] [--lang en]
 *
 * Used to put the approved Open Design mock and the live page side by side at the same
 * width — a class list cannot tell you whether a landing looks right, a frame can.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9413;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1]; };
const url = arg('url', null);
const out = arg('out', 'shots/render.jpeg');
const width = Number(arg('width', 390));
const height = Number(arg('height', 844));
const lang = arg('lang', 'en');
const expr = arg('eval', null);
if (!url) { console.error('need --url'); process.exit(2); }
fs.mkdirSync(path.dirname(out), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForDebugger() {
  for (let i = 0; i < 60; i++) {
    try { return (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl; }
    catch { await sleep(500); }
  }
  throw new Error('chrome devtools never answered');
}
function connect(u) {
  const ws = new WebSocket(u);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); }
  });
  return new Promise((resolve) => ws.addEventListener('open', () => resolve({
    send(method, params = {}, sessionId) {
      return new Promise((res, rej) => { const n = ++id; pending.set(n, { resolve: res, reject: rej }); ws.send(JSON.stringify(sessionId ? { id: n, method, params, sessionId } : { id: n, method, params })); });
    },
  })));
}

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--disable-gpu', '--no-first-run',
  '--user-data-dir=' + path.join(process.env.LOCALAPPDATA || '.', 'od-render-profile'), 'about:blank'], { stdio: 'ignore' });

const cdp = await connect(await waitForDebugger());
const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page');
const sid = (await cdp.send('Target.attachToTarget', { targetId: page.id, flatten: true })).sessionId;
const send = (m, p = {}) => cdp.send(m, p, sid);

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
await send('Page.navigate', { url });
await sleep(3500);
await send('Runtime.evaluate', { expression: `document.documentElement.lang = ${JSON.stringify(lang)}` });
// Walk the page so lazy images load, then return to the top. `behavior:'instant'` is
// required: the page sets `scroll-behavior: smooth`, and an animated scrollTo lags a
// full step behind, so the walk outruns the real scroll position and every lazy image
// in the lower half never enters the viewport.
const walk = await send('Runtime.evaluate', {
  expression: `(async () => { const s = (ms) => new Promise(r => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { window.scrollTo({ top: y, behavior: 'instant' }); await s(160); }
    window.scrollTo({ top: 0, behavior: 'instant' }); await s(400);
    const pending = () => [...document.images].filter((i) => !i.complete);
    for (let t = 0; t < 40 && pending().length; t++) await s(250);
    return 'images still loading: ' + pending().length; })()`, awaitPromise: true });
console.log(walk.result.value);

if (expr) {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{ ${expr} })()`, awaitPromise: true, returnByValue: true });
  console.log('eval: ' + (r.result?.value ?? JSON.stringify(r.exceptionDetails || r.result)));
}
const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72, captureBeyondViewport: true });
fs.writeFileSync(out, Buffer.from(data, 'base64'));
const h = await send('Runtime.evaluate', { expression: 'JSON.stringify({doc: document.body.scrollHeight, secs: [...document.querySelectorAll("section[id]")].map(s=>s.id+"="+Math.round(s.getBoundingClientRect().height))})' });
console.log(`${out} ${fs.statSync(out).size} B at ${width}x${height} lang=${lang}`);
console.log(h.result.value);
chrome.kill();
process.exit(0);
