import type { AdminItem, Site } from './site.config';

/**
 * Which admin pages this storefront actually has.
 *
 * `site.admin.items` used to draw the menu and nothing else: a franchisee configured with
 * `['dashboard', 'leads', 'content']` still had all 23 admin routes one URL away — the product editor, the
 * super panel, and nine tabs of the content factory. A hidden link is not a missing feature, and trimming
 * the template has to mean the page is not there.
 *
 * The menu and the guard both ask this file, so they cannot disagree: a page that 404s is not listed, and
 * a page that is listed opens. Adding a capability to a franchisee is then one word in `site.config.ts`.
 */
const OWNED: Array<[AdminItem, string]> = [
  ['leads', '/admin/leads'],
  ['products', '/admin/products'],
  ['content', '/admin/content'],
  ['super', '/admin/super'],
  // Last: `/admin` prefixes every other admin path, so it owns only the dashboard itself.
  ['dashboard', '/admin'],
];

/** The content areas a `mini` storefront keeps: its overview and its posts, nothing of the factory. */
const MINI_CONTENT = new Set(['/admin/content', '/admin/content/posts']);

const normalise = (pathname: string) => `/${pathname.replace(/^\/+|\/+$/g, '')}`;

export function adminAllows(site: Site, pathname: string, role?: string | null): boolean {
  const path = normalise(pathname);
  // The dashboard owns its own URL only: `/admin` prefixes every other admin path, and an unknown one is
  // not a capability (Next answers 404 for it anyway).
  const owner = OWNED.find(([item, prefix]) =>
    item === 'dashboard' ? path === prefix : path === prefix || path.startsWith(`${prefix}/`),
  );
  if (!owner) return false;

  const [item] = owner;
  if (!site.admin.items.includes(item)) return false;
  if (item === 'super') return role === 'super_admin';
  if (item === 'content' && site.admin.content === 'mini') {
    return MINI_CONTENT.has(path) || path.startsWith('/admin/content/posts/');
  }
  return true;
}
