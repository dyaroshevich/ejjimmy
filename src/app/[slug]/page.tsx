import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SeoArticle } from '@/components/seo/SeoArticle';
import { getSeoPage, seoSlugs } from '@/lib/seo-pages';

/**
 * One route, twelve pages.
 *
 * These are the long-form Thai landings (`/solar-5kw-krabi`, `/pea-permit`, …) that used to be a
 * directory each, ~160 lines of JSX apiece. The text lives in `content/pages/*.json`; this file only
 * maps a slug to data and data to `SeoArticle`. Adding a page is a JSON file plus a line in
 * `src/lib/seo-pages.ts` — no component, no route folder.
 *
 * `dynamicParams = false` keeps the URL space closed: a slug that is not in the registry is a 404 at
 * the routing layer, not a render, so a typo cannot ship a blank article.
 *
 * The pages stay Thai-only (`lang="th"` on the article). They are the BOFU half of the SEO set and
 * a translated price page nobody reviewed is worse than a Thai one; `metadata.alternates` still come
 * from the root layout, which builds the canonical URL and the eight hreflang links from the path.
 */

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return seoSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getSeoPage(params.slug);
  if (!page) return {};
  return { title: page.title, description: page.description };
}

export default function SeoPageRoute({ params }: { params: { slug: string } }) {
  const page = getSeoPage(params.slug);
  if (!page) notFound();
  return <SeoArticle page={page} />;
}
