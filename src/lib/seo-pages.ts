import { resolveBrandCopy } from './brand-copy';

import checklist from '../../content/pages/checklist.json';
import evChargerHome from '../../content/pages/ev-charger-home.json';
import hotelSolar from '../../content/pages/hotel-solar.json';
import industrialSolar100kw from '../../content/pages/industrial-solar-100kw.json';
import peaPermit from '../../content/pages/pea-permit.json';
import solar10kwKrabi from '../../content/pages/solar-10kw-krabi.json';
import solar3Phase from '../../content/pages/solar-3-phase.json';
import solar5kwKrabi from '../../content/pages/solar-5kw-krabi.json';
import solarAoLuek from '../../content/pages/solar-ao-luek.json';
import solarBatteryPrice from '../../content/pages/solar-battery-price.json';
import solarKohLanta from '../../content/pages/solar-koh-lanta.json';
import solarYieldKrabi from '../../content/pages/solar-yield-krabi.json';

/**
 * The long-form Thai landing pages, as data.
 *
 * Stage 3 of `docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md`: twelve pages × ~160 lines of JSX
 * meant a new client's landing copy lived in TypeScript, so "write our own page" was a code change.
 * The text now sits in `content/pages/<slug>.json` and one route (`src/app/[slug]/page.tsx`) renders
 * every one of them, so a page is a file drop plus one line in the registry below.
 *
 * The JSON is a small, closed vocabulary — that is the point. Blocks are `h1…h4`, `p`, `ul`, `ol`,
 * `table`, `hr`, `callout` (the bordered CTA card) and `kicker` (the small orange overline). Inline
 * text carries exactly four marks: `**bold**`, `_italic_`, `` `code` `` and `[label](href)`, where an
 * href of `@line` means "the LINE chat, from `site.config.ts`". Anything richer belongs in a
 * component, not in a content file.
 *
 * Strings are filled once, here, from the same resolver the copy pack uses: `{brand}`, `{city}`,
 * `{phone}` are not typed into twelve files. The pages are Thai-only (`lang: "th"`), which is why
 * the city resolves to the Thai spelling; the per-locale map is `brand.cityNames` if one is ever
 * translated.
 */

export type SeoBlock =
  | { t: 'kicker' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'callout'; v: string }
  | { t: 'ul' | 'ol'; v: string[] }
  /** `card` is the bordered table with row rules; `prose` is a bare table the prose rule styles. */
  | {
      t: 'table';
      v: 'card' | 'prose';
      head: string[][];
      rows: string[][];
      /** Body rows set in black — a total, or a row that ends a block. */
      strong?: boolean[];
      /** The rule under each body row: `slate-300` for a break, `slate-200` normally, none on the last. */
      edge?: Array<'none' | 'soft' | 'strong'>;
    }
  /** A language block: the yield table is the same numbers printed four times, `lang` marks each. */
  | { t: 'section'; lang?: string; blocks: SeoBlock[] }
  | { t: 'hr' };

export interface SeoPage {
  slug: string;
  /** BCP-47 tag for the article. These pages are Thai by construction. */
  lang: string;
  /**
   * Which of the two frames the page hands its gutter to — `wrapped` puts it on a `min-h-screen`
   * box around the article, `padded` puts it on the article itself. The twelve hand-written pages
   * used both; the value is in the data because the two produce columns 48 px apart, and a move
   * into JSON is not a licence to re-measure someone's page.
   */
  frame?: 'wrapped' | 'padded';
  title: string;
  description: string;
  blocks: SeoBlock[];
}

const PAGES: SeoPage[] = [
  checklist,
  evChargerHome,
  hotelSolar,
  industrialSolar100kw,
  peaPermit,
  solar10kwKrabi,
  solar3Phase,
  solar5kwKrabi,
  solarAoLuek,
  solarBatteryPrice,
  solarKohLanta,
  solarYieldKrabi,
].map((page) => resolveBrandCopy(page as unknown as SeoPage, (page as unknown as SeoPage).lang));

const BY_SLUG = new Map(PAGES.map((page) => [page.slug, page]));

/** Every route this file knows how to render — `generateStaticParams` reads it. */
export const seoSlugs: string[] = PAGES.map((page) => page.slug);

export function getSeoPage(slug: string): SeoPage | undefined {
  return BY_SLUG.get(slug);
}

export function getSeoPages(): SeoPage[] {
  return PAGES;
}
