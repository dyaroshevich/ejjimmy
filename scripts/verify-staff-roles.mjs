// Proves the role → menu chain the way a person experiences it: two throwaway staff accounts
// (`admin`, `super_admin`) sign in through the real /login form in Chrome, and the script prints the
// shell menu and the content menu each one gets on each site profile.
//
//   npm run dev            (on :3476, in another terminal)
//   node scripts/verify-staff-roles.mjs --yes
//
// It WRITES to the database the app points at — on this project the same Supabase as production — hence
// `--yes`. Both accounts are deleted in a `finally`, so a failed run leaves no residue. The service-role
// key is read from the environment and never printed.
import nextEnv from '@next/env';
import puppeteer from 'puppeteer-core';
import { randomBytes } from 'node:crypto';

const BASE = 'http://127.0.0.1:3476';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

if (!process.argv.includes('--yes')) {
  console.log('Refusing to run: this creates and deletes two staff accounts in the configured Supabase.');
  console.log('Re-run with --yes when that is the project you mean.');
  process.exit(2);
}

nextEnv.loadEnvConfig(process.cwd());
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE || !SERVICE) {
  console.log('MISSING env: url=%s service=%s', !!SUPABASE, !!SERVICE);
  process.exit(1);
}

const password = randomBytes(18).toString('base64url');
const stamp = Date.now();
const accounts = {
  admin: { email: `verify.admin.${stamp}@example.com`, role: 'admin', id: null },
  super: { email: `verify.super.${stamp}@example.com`, role: 'super_admin', id: null },
};

/** Supabase admin REST, authorised with the service-role key. */
const auth = (path, init = {}) =>
  fetch(`${SUPABASE}${path}`, {
    ...init,
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'content-type': 'application/json' },
  });

/** Hrefs in DOM order, duplicates kept: a menu that lists one page twice is a defect worth seeing. */
const hrefs = (page, selector) =>
  page.evaluate(
    (sel) => [...document.querySelectorAll(sel)].map((a) => a.getAttribute('href')),
    selector
  );

/** The content sidebar is the aside that holds the post links; the admin shell's own aside is outside it. */
const contentMenu = (page) =>
  page.evaluate(() => {
    const aside = document.querySelector('aside a[href^="/admin/content/"]')?.closest('aside');
    return aside ? [...aside.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [];
  });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const failures = [];

try {
  for (const account of Object.values(accounts)) {
    const res = await auth('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: account.email,
        password,
        email_confirm: true,
        app_metadata: { role: account.role },
      }),
    });
    if (!res.ok) throw new Error(`create ${account.email}: ${res.status} ${await res.text()}`);
    account.id = (await res.json()).id;
  }

  for (const { site, account } of [
    { site: 'solar1', account: 'admin' },
    { site: 'solar1', account: 'super' },
    { site: 'template', account: 'admin' },
    { site: 'tawan', account: 'admin' },
  ]) {
    const { email, role } = accounts[account];
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setExtraHTTPHeaders({ 'x-site': site });

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 120000 });
    // React stamps its props onto the form only once hydration has run. Clicking before that submits the form
    // natively — a GET with the password in the URL — so wait for the marker rather than for a timer.
    await page.waitForFunction(() =>
      Object.keys(document.querySelector('form') ?? {}).some((key) => key.startsWith('__react'))
    );
    await page.type('#loginEmail', email);
    await page.type('#loginPassword', password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }),
      page.click('button[type="submit"]'),
    ]);
    const landed = new URL(page.url()).pathname;
    if (landed === '/login') {
      const shown = await page.$eval('[role="alert"]', (el) => el.textContent).catch(() => 'no error shown');
      throw new Error(`sign-in refused on ${site}/${account}: ${shown}`);
    }

    await page.waitForSelector('aside a', { timeout: 60000 });
    const menu = await hrefs(page, 'aside a');

    await page.goto(`${BASE}/admin/content`, { waitUntil: 'networkidle2', timeout: 120000 });
    // Waits for the content shell itself, which renders after hydration, not just the admin one around it.
    await page.waitForSelector('aside a[href^="/admin/content/"]', { timeout: 120000 });
    const content = await contentMenu(page);
    const crashed = await page.evaluate(() => /Application error|Unhandled Runtime/i.test(document.body.innerText));

    // The menu is the capability, not a hint: a page it lists must open, and one it does not list must be
    // gone. This is what "trim the template" has to mean — otherwise the 23 admin pages stay one URL away.
    const PROBES = [
      '/admin',
      '/admin/leads',
      '/admin/products',
      '/admin/super',
      '/admin/content',
      '/admin/content/posts',
      '/admin/content/generator',
      '/admin/content/brief',
    ];
    const listed = new Set([...menu, ...content]);
    const paths = [];
    for (const path of PROBES) {
      const response = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
      const status = response?.status() ?? 0;
      const expected = listed.has(path) ? 200 : 404;
      if (status !== expected) failures.push(`${site}/${account}: ${path} → ${status}, expected ${expected}`);
      paths.push(`${path} ${status}${status === expected ? '' : '✗'}`);
    }

    console.log(`\n== ${site} · ${account} (${role}) → ${landed}`);
    console.log('   menu   :', JSON.stringify(menu), 'super:', menu.includes('/admin/super'));
    console.log('   content:', JSON.stringify(content), 'error-panel:', crashed);
    console.log('   paths  :', paths.join(' · '));
    await page.close();
  }
} finally {
  if (failures.length) {
    console.error(`\nFAIL ${failures.length} route(s) disagree with the menu:`);
    for (const message of failures) console.error(`  - ${message}`);
  }
  for (const { id } of Object.values(accounts)) {
    if (!id) continue;
    const res = await auth(`/auth/v1/admin/users/${id}`, { method: 'DELETE' });
    console.log(`cleanup ${id.slice(0, 8)}… → ${res.status}`);
  }
  await browser.close();
}
