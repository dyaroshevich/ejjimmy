// Splits the landing's AA failures into three verdicts, by comparing each failing class against
// the same class in the approved mock:
//   SHEET FAILS TOO — the reference paints it at the same ratio or worse: the owner approved it.
//   WE PAINT IT WORSE — the reference passes this class: this is our port's defect.
//   NOT IN THE SHEET — the reference has no such node: our markup, or a band the sheet lacks.
// Matches by class+weight+size, then falls back to class, and says so when the weight differs.
// Same contrast core as scripts/landing-shots.mjs. Both viewports, light theme.
//
// usage: node scripts/contrast-audit.mjs [http://127.0.0.1:<port>]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MOCK = 'file:///K:/code/tawanpower/docs/design/opendesign/tawanpower-landing-unified.html';
const base = process.argv[2] || 'http://127.0.0.1:39236';
const CORE = fs.readFileSync('scripts/lib/contrast-core.js', 'utf8');
const PROBE = `(() => { const f = () => { ${CORE} }; return JSON.stringify(f()); })()`;
const fails = (x) => x.ratio < (x.large ? 3 : 4.5);

const VIEWPORTS = [['phone', 390, 844], ['desktop', 1280, 900]];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

// A failing `.kicker` at 12px/600 is the same *kind* wherever it sits, so the comparison is
// class+weight+size — the backdrop is excluded because that is often the whole difference
// between the sheet's band and ours, and both sides of it still fail.
const kind = (x) => [x.cls || '(inherited)', x.weight, x.size].join('|');

const measure = async (url, w, h) => {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 420000 });
  await new Promise((r) => setTimeout(r, 1800));
  const r = await page.evaluate(PROBE);
  await page.close();
  return JSON.parse(r);
};

const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

for (const [name, w, h] of VIEWPORTS) {
  const mockAll = await measure(MOCK, w, h);
  const liveAll = await measure(`${base}/`, w, h);
  const mock = mockAll.filter(fails);
  const live = liveAll.filter(fails);

  const mockBest = new Map();  // kind -> the ratio the sheet resolves for it (best of its nodes)
  for (const x of mockAll) {
    const k = kind(x);
    if (!mockBest.has(k) || x.ratio < mockBest.get(k).ratio) mockBest.set(k, x);
  }
  // Class-only fallback: our headings compute weight 800 (globals.css:139) where the sheet leaves
  // the UA default 700, so an exact kind match calls the sheet's own `.grad` halves absent.
  const mockByCls = new Map();
  for (const x of mockAll) {
    const k = x.cls || '(inherited)';
    if (!mockByCls.has(k) || x.ratio < mockByCls.get(k).ratio) mockByCls.set(k, x);
  }

  const sheet = [], worse = [], absent = [];
  for (const x of live) {
    const m = mockBest.get(kind(x)) || mockByCls.get(x.cls || '(inherited)') || null;
    if (m) (fails(m) ? sheet : worse).push([x, m]);
    else absent.push([x, null]);
  }

  say(`\n===== ${name} ${w}x${h} — text nodes measured: mock ${mockAll.length} · live ${liveAll.length}`);
  say(`  AA failures: mock ${mock.length} · live ${live.length}`);
  say(`    SHEET FAILS TOO   ${sheet.length}  (the reference paints this class at <= the same ratio)`);
  say(`    WE PAINT IT WORSE ${worse.length}  (the reference has this class and passes it)`);
  say(`    NOT IN THE SHEET  ${absent.length}  (no such node in the reference at all)`);

  const dump = (title, rows) => {
    if (!rows.length) return;
    say(`  --- ${title}`);
    const g = {};
    for (const [x, m] of rows) (g[`${x.cls || '(inherited)'} @ ${x.size} @${x.sec || '-'}`] ||= []).push([x, m]);
    for (const [k, v] of Object.entries(g).sort((a, b) => Math.min(...a[1].map((r) => r[0].ratio)) - Math.min(...b[1].map((r) => r[0].ratio)))) {
      const worst = Math.min(...v.map((r) => r[0].ratio));
      const pairs = v.filter((r) => r[1]);
      const exact = pairs.length > 0 && pairs.every(([x, m]) => kind(x) === kind(m));
      const refTxt = !pairs.length
        ? 'sheet: no such node'
        : `sheet ${Math.min(...pairs.map((r) => r[1].ratio))}:1${exact ? '' : ` (sheet: w${pairs[0][1].weight}/${pairs[0][1].size})`}`;
      say(`    ${worst.toFixed(2).padStart(5)}:1 x${String(v.length).padStart(2)} ${k.padEnd(26)} ${refTxt.padEnd(16)} fg ${v[0][0].fg.slice(0, 26)} on ${v[0][0].on}  "${v[0][0].text}"`);
    }
  };
  dump('WE PAINT IT WORSE — ours to fix:', worse);
  dump('NOT IN THE SHEET:', absent);
  dump('SHEET FAILS TOO — the owner approved this look:', sheet);
}

fs.writeFileSync('shots/contrast-audit.txt', lines.join('\n') + '\n');
console.log('\nwitness: shots/contrast-audit.txt');
await browser.close();
