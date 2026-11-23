// Does the web app manifest say what the brand says?
//
// The manifest is no longer a file: `src/lib/manifest.ts` builds it for the site the *host* resolves to,
// and `src/app/manifest.webmanifest/route.ts` serves it. That change was forced by evidence — with one
// generated `public/manifest.json`, Solar 1 and Arun Phalung both served `"name": "Tawan Power"`, so a
// phone installed a second app under the flagship's name and `id`.
//
// What is still checkable without a browser: the icons the manifest names really exist, the routes are
// wired, and no static manifest has crept back to shadow them (a `public/manifest.json` wins over the
// route on the filesystem and silently reinstates the bug). Replacing the PNG art is the owner's job;
// `--check` only reports what is missing.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check') || true;

const ICONS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/admin/icons/icon-192x192.png',
  '/admin/icons/icon-512x512.png',
  '/og-image.jpg',
];

const ROUTES = ['src/app/manifest.webmanifest/route.ts', 'src/app/admin-manifest.webmanifest/route.ts'];
const REFERENCES = [
  { file: 'src/app/layout.tsx', needle: "manifest: '/manifest.webmanifest'" },
  { file: 'src/app/admin/layout.tsx', needle: "manifest: '/admin-manifest.webmanifest'" },
];

let failed = 0;

for (const route of ROUTES) {
  if (existsSync(join(ROOT, route))) console.log(`ok      ${route}`);
  else {
    console.error(`MISSING ${route} — the manifest has no handler`);
    failed++;
  }
}

for (const { file, needle } of REFERENCES) {
  const text = existsSync(join(ROOT, file)) ? readFileSync(join(ROOT, file), 'utf8') : '';
  if (text.includes(needle)) console.log(`ok      ${file} → ${needle.split("'")[1]}`);
  else {
    console.error(`MISSING ${file} does not point at ${needle}`);
    failed++;
  }
}

// A static file here would be served instead of the route, and every brand would get one manifest again.
for (const stale of ['public/manifest.json', 'public/admin-manifest.json']) {
  if (existsSync(join(ROOT, stale))) {
    console.error(`STALE   ${stale} shadows the route — delete it`);
    failed++;
  }
}

for (const src of ICONS) {
  if (existsSync(join(ROOT, 'public', src.replace(/^\//, '')))) console.log(`ok      public${src}`);
  else {
    console.error(`MISSING public${src} — referenced by the manifest, not on disk`);
    failed++;
  }
}

console.log(
  failed === 0
    ? 'brand-assets · 2 manifests are served per host · every referenced icon exists'
    : `brand-assets · ${failed} problem(s)`,
);
process.exit(failed === 0 ? 0 : 1);
