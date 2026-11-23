import type { MetadataRoute } from 'next';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { LOCALES, localeHref, languageAlternates } from '@/lib/locale-path';
import { getSite } from '@/lib/site-server';
import { missingLegalFields } from '@/lib/legal';

export const revalidate = 3600;

const abs = (base: string, href: string) => new URL(href, base).toString();

type Entry = MetadataRoute.Sitemap[number];

// One entry per language, each listing the same set of alternates so Google can pair them.
function localized(
  base: string,
  path: string,
  lastModified: Date,
  changeFrequency: Entry['changeFrequency'],
  priority: number
): Entry[] {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([locale, href]) => [locale, abs(base, href)])
  );
  return LOCALES.map((locale) => ({
    url: abs(base, localeHref(locale, path)),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Each hostname advertises only its own origin: three storefronts, one sitemap route.
  const site = getSite();
  const SITE = site.url;
  const legalReady = missingLegalFields(site.brand.legal).length === 0;
  const now = new Date();
  const entries: Entry[] = [
    ...localized(SITE, '/', now, 'weekly', 1),
    ...localized(SITE, '/blog', now, 'weekly', 0.8),
    ...localized(SITE, '/cases', now, 'weekly', 0.7),
    ...localized(SITE, '/segments', now, 'monthly', 0.6),
    // Thai + English side by side in the document itself, so there is nothing to translate.
    // Both documents are drafts until the owner's registration data is real (`src/lib/legal.ts`), and a
    // draft that is `noindex` must not be advertised here — sitemap and robots tag, one source.
    ...(legalReady
      ? [
          { url: `${SITE}/privacy`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 },
          { url: `${SITE}/terms`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 },
        ]
      : []),
    // Three languages in one document (th/en/ru), so nothing to translate per locale.
    { url: `${SITE}/checklist`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/solar-yield-krabi`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    // Thai price pages — the BOFU pair, Thai copy only for now.
    { url: `${SITE}/solar-5kw-krabi`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/solar-10kw-krabi`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/hotel-solar`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/solar-3-phase`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/solar-ao-luek`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/pea-permit`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/solar-battery-price`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/solar-koh-lanta`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/ev-charger-home`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/industrial-solar-100kw`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return entries;

  const { data } = await createClient(url, key)
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('published', true);

  const seen = new Set<string>();
  for (const p of data || []) {
    if (!p.slug || seen.has(p.slug)) continue;
    seen.add(p.slug);
    entries.push(
      ...localized(
        SITE,
        `/blog/${p.slug}`,
        new Date(p.updated_at || p.published_at || now),
        'monthly',
        0.6
      )
    );
  }

  return entries;
}
