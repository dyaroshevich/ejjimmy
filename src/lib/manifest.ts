import type { Site } from './site.config';

/**
 * The web app manifest as a function of the site, not a file on disk.
 *
 * It used to be `public/manifest.json`, generated once from `brand.json`. That works for the flagship and
 * breaks the moment a second storefront shares the deployment: the host picks the brand at request time
 * (`site-server.ts`), so Solar 1 and Arun Phalung were both handing visitors a manifest that carried the
 * flagship's name and its `id`. On a phone that installs a second app under someone
 * else's name, and `id` is the installed app's identity — it cannot be repaired after the fact for the
 * people who already installed it.
 *
 * A route handler reads the manifest from the request's own site, so a franchisee's custom domain gets
 * its own identity without a rebuild.
 */

const ICONS = [
  { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
  { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

const ADMIN_ICONS = [
  { src: '/admin/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/admin/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
];

function slugOf(name: string): string {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** `theme_color` is the one manifest field a brand genuinely repaints; the rest is text. */
function themeColour(site: Site): string {
  return site.theme.light.primary ?? '#ff8a00';
}

export function publicManifest(site: Site) {
  const { brand } = site;
  const appIds = brand.appIds ?? { public: `${slugOf(brand.name)}-public-app`, admin: `${slugOf(brand.name)}-admin` };
  return {
    id: appIds.public,
    name: brand.name,
    short_name: brand.shortName ?? brand.name,
    description: brand.description ?? '',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColour(site),
    orientation: 'portrait',
    scope: '/',
    categories: ['utilities', 'business', 'lifestyle'],
    icons: ICONS,
    screenshots: [{ src: '/og-image.jpg', sizes: '1200x630', type: 'image/jpeg', form_factor: 'wide' }],
    shortcuts: [
      {
        name: 'AI Solar Consult',
        short_name: 'Consult',
        description: 'Chat with the solar advisor',
        url: '/chat',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Our Installations',
        short_name: 'Cases',
        description: 'Real projects',
        url: '/cases',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}

export function adminManifest(site: Site) {
  const { brand } = site;
  const appIds = brand.appIds ?? { public: `${slugOf(brand.name)}-public-app`, admin: `${slugOf(brand.name)}-admin` };
  return {
    id: appIds.admin,
    name: `${brand.name} Admin`,
    short_name: `${brand.shortName ?? brand.name} Admin`,
    description: `Admin panel for ${brand.name}`,
    start_url: '/admin',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: themeColour(site),
    scope: '/admin',
    icons: ADMIN_ICONS,
  };
}
