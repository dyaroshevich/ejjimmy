import { DEFAULT_LOCALE, LOCALES, localeHref } from './locale-path';
import type { Site } from './site.config';

/** One origin for every canonical/OG URL on the storefront; `site.url` is the single source. */
export function canonicalUrl(site: Site, path: string, locale: string = DEFAULT_LOCALE): string {
  return `${site.url}${localeHref(locale, path)}`;
}

/** hreflang set for a page whose copy is Thai-only: all eight locales point at the same Thai URL. */
export function roUrl(site: Site, path: string): Record<string, string> {
  const url = canonicalUrl(site, path, DEFAULT_LOCALE);
  return {
    canonical: url,
    'x-default': url,
    ...Object.fromEntries(LOCALES.map((l) => [l, canonicalUrl(site, path, l)])),
  };
}
