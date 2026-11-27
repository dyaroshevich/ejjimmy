import { LOCALES } from '@/lib/locale-path';
import { sites } from '@/lib/site.config';
import { canonicalUrl, roUrl } from '@/lib/canonical';

// Two hardcoded hosts sit in the storefront today: `ejjimmy-clean.vercel.app` (the temporary deploy)
// and `ejjimmy.vercel.app` (a domain that 404s). Both must resolve through site config so a host change
// is one edit; the TH URL stays bare, and every other locale gets its own prefix.

describe('canonicalUrl', () => {
  it('uses the site origin, not a literal host', () => {
    expect(canonicalUrl(sites.ejjimmy, '/seo/solar-5kw-krabi')).toBe('https://ejjimmy.vercel.app/seo/solar-5kw-krabi');
  });

  it('puts a locale prefix on every non-default locale and keeps default bare', () => {
    expect(canonicalUrl(sites.ejjimmy, '/catalog', 'th')).toBe('https://ejjimmy.vercel.app/catalog');
    expect(canonicalUrl(sites.ejjimmy, '/catalog', 'en')).toBe('https://ejjimmy.vercel.app/en/catalog');
  });
});

describe('roUrl', () => {
  it('shares one canonical across all eight locales', () => {
    const tags = roUrl(sites.ejjimmy, '/seo/solar-5kw-krabi');
    expect(tags.canonical).toBe('https://ejjimmy.vercel.app/seo/solar-5kw-krabi');
    expect(tags['x-default']).toBe(tags.canonical);
    expect(tags.th).toBe(tags.canonical);
    expect(tags.en).toBe('https://ejjimmy.vercel.app/en/seo/solar-5kw-krabi');
    expect(tags.ru).toBe('https://ejjimmy.vercel.app/ru/seo/solar-5kw-krabi');
    expect(Object.keys(tags)).toHaveLength(LOCALES.length + 2);
  });
});
