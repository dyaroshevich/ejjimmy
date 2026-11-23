import { routing } from '../../i18n';

export const LOCALES = routing.locales as readonly string[];
export const DEFAULT_LOCALE = routing.defaultLocale;

// `/en/blog/x` -> { locale: 'en', path: '/blog/x' }; `/blog/x` -> { path: '/blog/x' }.
export function splitLocale(pathname: string): { locale?: string; path: string } {
  const [first, ...rest] = pathname.split('/').filter((_, i) => i > 0);
  if (first && LOCALES.includes(first)) {
    return { locale: first, path: '/' + rest.join('/') };
  }
  return { path: pathname };
}

export const localeHref = (locale: string, path: string): string =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path === '/' ? '' : path}`;

export const languageAlternates = (path: string): Record<string, string> => ({
  ...Object.fromEntries(LOCALES.map((l) => [l, localeHref(l, path)])),
  'x-default': path,
});

// `/#anchor` on the landing itself is a full page load, and on a prefixed URL (`/ru`) it also drops the
// visitor back onto the Thai root. Strip the path so the browser scrolls in place; real routes keep it.
export const landingAnchor = (pathname: string, href: string): string =>
  href.startsWith('/#') && splitLocale(pathname).path === '/' ? href.slice(1) : href;
