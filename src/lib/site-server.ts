import { headers } from 'next/headers';
import { sites, siteFromHost, type Site, type SiteId } from './site.config';

/**
 * The storefront this request belongs to.
 *
 * The host decides it, not the build: one Vercel deployment answers on three hostnames. `x-site`
 * is honoured first so a future proxy or a test can pin the site without owning a hostname;
 * otherwise `x-forwarded-host` (Vercel's own) and `host` are matched in `site.config.ts`.
 * Unknown hosts — localhost, preview URLs, custom domains — fall back to the default storefront.
 */
export function getSite(): Site {
  const h = headers();
  const pinned = h.get('x-site') as SiteId | null;
  if (pinned && pinned in sites) return sites[pinned];
  return siteFromHost(h.get('x-forwarded-host') || h.get('host') || '');
}
