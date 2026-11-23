/**
 * Blog cover resolution.
 *
 * 1. A curated cover (below) wins while the DB still carries the one generic
 *    hero image every post shipped with.
 * 2. Otherwise the DB `cover_image` is used as-is.
 * 3. Otherwise a stable hash of the slug picks one of the generic fallbacks.
 *
 * ponytail: the curated table is keyed by slug and closed — a post that is not
 * listed here takes its `cover_image` from the DB, so the content pipeline can
 * still set a cover on its own. A new slug needs one line here, nothing else.
 */
import { siteUrl } from './site.config';

const FALLBACKS = [
  '/images/blog-fallbacks/cover-1.jpg',
  '/images/blog-fallbacks/cover-2.jpg',
  '/images/blog-fallbacks/cover-3.jpg',
  '/images/blog-fallbacks/cover-4.jpg',
] as const;

/** The one image every post carried before the covers were curated. */
const GENERIC_COVER = 'hero-solar.jpg';

const COVER_BY_SLUG: Record<string, string> = {
  'solar-for-business-krabi-roi': '/images/blog-covers/resort-panels.jpg',
  'solar-ev-charging-integration-krabi': '/images/blog-covers/abstract-energy.jpg',
  'why-hems-is-heart-of-solar-home-2026': '/images/blog-covers/house-water.jpg',
  'solar-installation-krabi-climate-protection': '/images/blog-covers/crew-install.jpg',
  'solar-panel-maintenance-thailand-krabi': '/images/blog-covers/engineer.jpg',
  'solar-inverters-on-grid-off-grid-hybrid-thailand': '/images/blog-covers/battery-wall.jpg',
  'solar-panel-price-krabi-2026': '/images/blog-covers/shop-day.jpg',
  'why-solar-best-investment-krabi-2026': '/images/blog-covers/villa-sunset.jpg',
  '5-solar-misconceptions-krabi': '/images/blog-covers/hex-cells.jpg',
  'solar-financing-incentives-thailand-2026': '/images/blog-covers/villa-sea.jpg',
};

export function blogCover(coverImage: string | null | undefined, slug: string): string {
  const curated = COVER_BY_SLUG[slug];
  if (curated && (!coverImage || coverImage.includes(GENERIC_COVER))) return curated;
  if (coverImage) return coverImage;
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length];
}

/** OG images and JSON-LD need an absolute URL; local covers are root-relative. */
export function absoluteUrl(path: string, base: string = siteUrl): string {
  return path.startsWith('http') ? path : `${base}${path}`;
}
