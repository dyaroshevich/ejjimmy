#!/usr/bin/env node
/**
 * Archive the public appearance of a running site.
 *
 *   node scripts/archive-site.mjs --base https://tawanpower.vercel.app \
 *     --out K:/code/tawanpower-archive/2026-10-23-legacy --label pre-redesign
 *
 * Writes full-page JPEGs at 1440x900 and 390x844, a first-fold image for each
 * viewport, and manifest.json. Public pages only: /cases/<slug> and
 * /blog/<slug> are discovered from the list pages. Nothing is uploaded.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, all) => {
    if (arg.startsWith('--')) acc.push([arg.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]);
    return acc;
  }, [])
);

const BASE = String(args.base || '').replace(/\/$/, '');
const OUT = path.resolve(String(args.out || ''));
const LABEL = String(args.label || 'archive');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MAX_CASES = Number(args['max-cases'] || 12);
const MAX_ARTICLES = Number(args['max-articles'] || 6);

if (!BASE || !args.out) {
  console.error('usage: node scripts/archive-site.mjs --base <url> --out <dir> [--label name]');
  process.exit(1);
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log('[archive]', ...a);

async function dismiss(page) {
  await page.evaluate(() => {
    const hit = [...document.querySelectorAll('button,a')].find((el) => {
      const text = (el.textContent || '').trim();
      return el.offsetParent !== null && /^(ยอมรับ|ยินยอม|Accept|ปิด|Close|ไว้ทีหลัง|Later|×)$/i.test(text);
    });
    if (hit) hit.click();
  }).catch(() => {});
  await page.addStyleTag({
    content: `
      *, *::before, *::after { animation: none !important; transition: none !important; }
      [data-notices], [class*="cookie"], [class*="consent"],
      [class*="pwa-install"], [class*="install-prompt"], [class*="install-banner"] {
        display: none !important;
      }
    `,
  }).catch(() => {});
}

async function expand(page) {
  for (let i = 0; i < 10; i++) {
    const clicked = await page.evaluate(() => {
      const hit = [...document.querySelectorAll('button,a')].find((el) => {
        const text = (el.textContent || '').trim();
        return el.offsetParent !== null && /แสดงเพิ่มเติม|โหลดเพิ่ม|Load more|View more/i.test(text);
      });
      if (!hit) return null;
      hit.click();
      return hit.textContent.trim();
    });
    if (!clicked) return;
    log('  expand:', clicked.slice(0, 60));
    await sleep(1200);
  }
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready;
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.evaluate(() => Promise.race([
    Promise.all([...document.images].map((img) => (img.complete ? 0 : new Promise((r) => {
      img.addEventListener('load', r, { once: true });
      img.addEventListener('error', r, { once: true });
    })))),
    new Promise((r) => setTimeout(r, 10000)),
  ])).catch(() => {});
  await sleep(400);
}

async function discover(browser, listPath, pattern) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'th-TH,th;q=0.9' });
  await page.goto(`${BASE}${listPath}`, { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  const hrefs = await page.evaluate((re) => {
    const rx = new RegExp(re);
    return [...new Set([...document.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href'))
      .filter((href) => href && rx.test(href) && !href.includes('#'))
      .map((href) => new URL(href, location.origin).pathname))];
  }, pattern.source).catch(() => []);
  await page.close();
  return hrefs;
}

async function capture(browser, pageInfo, viewport, results) {
  const page = await browser.newPage();
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'th-TH,th;q=0.9' });
    await page.setViewport(viewport);
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('s1-pwa-install-dismissed', '1');
        localStorage.setItem('cookie-consent', 'accepted');
      } catch {}
    });
    const url = `${BASE}${pageInfo.path}`;
    log(viewport.name, pageInfo.path);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 150000 });
    await dismiss(page);
    if (pageInfo.path === '/' || pageInfo.path === '/cases') await expand(page);
    await settle(page);
    await dismiss(page);

    const size = await page.evaluate(() => ({
      width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    }));

    const stem = `${viewport.name}/${pageInfo.name}`;
    const full = path.join(OUT, `${stem}.jpg`);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await page.screenshot({ path: full, type: 'jpeg', quality: 80, fullPage: true, captureBeyondViewport: true });
    const fold = path.join(OUT, `${stem}-fold.jpg`);
    await page.screenshot({ path: fold, type: 'jpeg', quality: 82, fullPage: false });
    const bytes = (await fs.stat(full)).size;
    results.push({ ...pageInfo, viewport: viewport.name, width: size.width, height: size.height, full: path.relative(OUT, full), bytes });
    log('  ->', `${size.width}x${size.height}`, `${(bytes / 1024).toFixed(0)} KB`);
  } catch (error) {
    results.push({ ...pageInfo, viewport: viewport.name, error: String(error).slice(0, 300) });
    log('  FAIL', pageInfo.path, String(error).slice(0, 200));
  } finally {
    await page.close();
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

try {
  await fs.mkdir(OUT, { recursive: true });

  const casePaths = (await discover(browser, '/cases', /^\/cases\/[^/]+$/)).slice(0, MAX_CASES);
  const articlePaths = (await discover(browser, '/blog', /^\/blog\/[^/]+$/)).slice(0, MAX_ARTICLES);
  log('discovered cases:', casePaths.join(', ') || 'none');
  log('discovered articles:', articlePaths.join(', ') || 'none');

  const pages = [
    { name: 'home', path: '/' },
    { name: 'cases', path: '/cases' },
    ...casePaths.map((p) => ({ name: `case${p.replace('/cases/', '-')}`, path: p })),
    { name: 'blog', path: '/blog' },
    ...articlePaths.map((p) => ({ name: `article${p.replace('/blog/', '-')}`, path: p })),
    { name: 'chat', path: '/chat' },
  ];

  const results = [];
  for (const viewport of VIEWPORTS) {
    for (const info of pages) await capture(browser, info, viewport, results);
  }

  const manifest = {
    label: LABEL,
    base: BASE,
    capturedAt: new Date().toISOString(),
    userAgent: await browser.userAgent(),
    viewports: VIEWPORTS,
    pages: results,
  };
  await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  log('done:', results.length, 'captures ->', OUT);
  log('failures:', results.filter((r) => r.error).length);
} finally {
  await browser.close();
}
