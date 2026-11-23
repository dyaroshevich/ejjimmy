// Proves a storefront is its own company everywhere a visitor can see it: the tab title, `og:site_name`,
// the JSON-LD business, the PWA manifest, the canonical origin and the sitemap. One deployment answers on
// three hostnames and the host picks the brand (`src/lib/site-server.ts`), so a single hardcoded string —
// the pitfall C1 was — shows up here as a disagreement instead of on a franchisee's phone.
//
//   npm run dev                      (on :3476, in another terminal)
//   node scripts/brand-smoke.mjs     [--base http://127.0.0.1:3476]
//
// Read-only: no credentials, no writes, no browser. It pins the profile with `x-site`, so it checks the
// config rather than the DNS; host matching is a separate question.
//
// A fourth profile in `site.config.ts` must be added to PROFILES — nothing here can discover the list.

const argv = process.argv.slice(2);
const BASE = argv.includes('--base') ? argv[argv.indexOf('--base') + 1] : 'http://127.0.0.1:3476';
const PROFILES = ['tawan', 'solar1', 'template'];

const get = async (path, site) => {
  const res = await fetch(new URL(path, BASE), { headers: { 'x-site': site }, redirect: 'follow' });
  return { status: res.status, text: await res.text() };
};

const first = (html, re) => html.match(re)?.[1]?.trim() ?? null;

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');

/**
 * The `LocalBusiness` node's names — the field that says which company the page claims to be.
 * Thai shows the display phrase and keeps the Latin brand in `alternateName`, so either may name it.
 */
const ldBusiness = (html) => {
  for (const block of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(block[1].replace(/<!--|-->/g, ''));
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        if (node?.['@type'] === 'LocalBusiness') return [node.name, node.alternateName].filter(Boolean);
      }
    } catch {
      // A malformed block is reported as a missing one, which is what it is.
    }
  }
  return [];
};

const labels = {
  title: (html) => first(html, /<title>([^<]*)<\/title>/),
  ogSiteName: (html) => first(html, /<meta property="og:site_name" content="([^"]*)"/),
  canonical: (html) => first(html, /<link rel="canonical" href="([^"]*)"/),
  robots: (html) => first(html, /<meta name="robots" content="([^"]*)"/),
  manifestHref: (html) => first(html, /<link rel="manifest" href="([^"]*)"/),
};

const rows = [];
const record = (site, check, ok, detail) => rows.push({ site, check, ok, detail });

const seen = new Map();

try {
  const probe = await fetch(new URL('/', BASE)).catch(() => null);
  if (!probe?.ok) throw new Error(`no dev server answering at ${BASE} — start it with \`npm run dev\``);
  await probe.text();
} catch (error) {
  console.error(String(error.message ?? error));
  process.exit(2);
}

for (const site of PROFILES) {
  const home = await get('/', site);
  if (home.status !== 200) {
    record(site, 'GET /', false, `HTTP ${home.status}`);
    continue;
  }

  const manifestHref = labels.manifestHref(home.text);
  const manifestRes = manifestHref ? await get(manifestHref, site) : null;
  const manifest = manifestRes?.status === 200 ? JSON.parse(manifestRes.text) : null;
  if (!manifest) {
    record(site, 'manifest', false, `${manifestHref ?? 'no <link rel=manifest>'} → HTTP ${manifestRes?.status ?? 'n/a'}`);
    continue;
  }

  seen.set(site, { manifest, canonical: labels.canonical(home.text) });
  const name = manifest.name;

  const title = labels.title(home.text);
  record(site, 'title names the brand', Boolean(title?.includes(name)), title ?? 'no <title>');

  const og = labels.ogSiteName(home.text);
  record(site, 'og:site_name', og === name, `${og ?? 'missing'} (manifest: ${name})`);

  const business = ldBusiness(home.text);
  record(
    site,
    'JSON-LD LocalBusiness',
    business.includes(name),
    `${business.join(' / ') || 'missing'} (manifest: ${name})`
  );

  // A storefront's own robots tag must never be `noindex`; that is how a draft policy leaks to the homepage.
  const robots = labels.robots(home.text) ?? '';
  record(site, '/ is indexable', !robots.includes('noindex'), robots || 'no robots tag');

  const canonical = labels.canonical(home.text);
  record(site, 'canonical is absolute', /^https?:\/\/[^/]+/i.test(canonical ?? ''), canonical ?? 'missing');

  // Nobody else's company name may reach a visitor's page. This is the content half of C2: the strings
  // come from the database, so a clean build proves nothing about them.
  const text = visibleText(home.text);
  for (const other of PROFILES.filter((id) => id !== site)) {
    const otherName = seen.get(other)?.manifest?.name;
    if (!otherName) continue;
    const hits = text.split(otherName).length - 1;
    record(site, `no mention of ${otherName}`, hits === 0, hits ? `${hits} occurrence(s)` : 'none');
  }

  const privacy = await get('/privacy', site);
  if (privacy.status === 200) {
    const draft = /ฉบับร่าง|Draft/.test(privacy.text);
    const noindex = (labels.robots(privacy.text) ?? '').includes('noindex');
    seen.get(site).draft = draft;
    record(site, 'privacy draft ⇔ noindex', draft === noindex, `draft ${draft} / noindex ${noindex}`);
  }
}

// Cross-profile: one manifest id per company, or two brands install the same app (C1).
if (seen.size > 1) {
  const ids = [...seen].map(([site, { manifest }]) => ({ site, id: manifest.id }));
  const unique = new Set(ids.map((i) => i.id));
  record('all', 'manifest ids distinct', unique.size === ids.length, ids.map((i) => `${i.id}`).join(' · '));

  const origins = [...seen].map(([site, { canonical }]) => ({ site, origin: canonical ? new URL(canonical).origin : null }));
  const uniqueOrigins = new Set(origins.map((o) => o.origin));
  record('all', 'canonical origins distinct', uniqueOrigins.size === origins.length, origins.map((o) => o.origin).join(' · '));
}

// Canonical and sitemap must advertise one origin, per profile.
for (const site of PROFILES) {
  const { canonical } = seen.get(site) ?? {};
  if (!canonical) continue;
  const sitemap = await get('/sitemap.xml', site);
  const firstLoc = first(sitemap.text, /<loc>([^<]*)<\/loc>/);
  if (!firstLoc) {
    record(site, 'sitemap', false, `HTTP ${sitemap.status}, no <loc>`);
    continue;
  }
  record(site, 'sitemap origin = canonical', new URL(firstLoc).origin === new URL(canonical).origin, new URL(firstLoc).origin);

  // A draft policy is `noindex` and therefore must not be advertised; both flip together.
  const inSitemap = sitemap.text.includes(`${new URL(canonical).origin}/privacy`);
  const draft = seen.get(site)?.draft ?? false;
  record(site, 'draft privacy stays out of sitemap', draft ? !inSitemap : inSitemap, `draft ${draft} / listed ${inSitemap}`);
}

const width = Math.max(...rows.map((r) => r.site.length));
for (const { site, check, ok, detail } of rows) {
  console.log(`${ok ? ' PASS' : '*FAIL'}  ${site.padEnd(width)}  ${check.padEnd(34)} ${detail}`);
}

const failed = rows.filter((r) => !r.ok).length;
console.log(`\n${rows.length - failed}/${rows.length} checks passed on ${BASE}`);
console.log('canonical:', JSON.stringify(Object.fromEntries([...seen].map(([s, v]) => [s, v.canonical]))));
process.exitCode = failed ? 1 : 0;
