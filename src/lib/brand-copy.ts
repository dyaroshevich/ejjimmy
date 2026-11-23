import { brand, address, contact, type Site } from './site.config';

/**
 * Stage 3 of `docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md`.
 *
 * The copy pack writes the brand and the city as placeholders — `ทีมงาน {brand} {city}` — so a new
 * client does not mean editing eight JSON files per sentence. The values are filled in here, once
 * per request, before next-intl formats anything:
 *
 *   · `src/i18n.ts` calls this in `getRequestConfig`, which feeds both the server translators and
 *     the `NextIntlClientProvider` in the root layout, so no component has to pass values;
 *   · `src/app/admin/layout.tsx` imports the two locale files directly and calls it too.
 *
 * Why a pre-pass instead of ICU arguments at every call site: 56 keys live in 19 namespaces and
 * are read by ~30 files (translators, metadata, LINE messages, AI prompts). Passing `{ brand, city }`
 * at each call would be a missed-value crash away from a broken page, and it could not reach the
 * strings that never go through a translator.
 *
 * Case is part of the contract: `{BRAND}` / `{CITY}` resolve upper-cased, because one collage
 * caption sets the name in caps. `scripts/brand-copy.mjs` writes the caps form when it finds an
 * all-caps literal, so the rendered pixels do not move.
 */

export interface BrandCopyValues {
  brand: string;
  city: string;
  /** Display form: the number as a visitor reads and dials it, from `site.config.ts`. */
  phone: string;
}

/** The city a locale spells its own way, falling back to the config's Latin name. */
export function brandCopyValues(locale: string, site?: Site): BrandCopyValues {
  // No site means the default storefront: the `.mjs` copy writer and the tests read the values
  // without a request in hand.
  return {
    brand: (site?.brand ?? brand).name,
    city: (site?.address ?? address).cityNames[locale] ?? (site?.address ?? address).city,
    phone: (site?.contact ?? contact).phone,
  };
}

const PLACEHOLDER = /\{(brand|city|phone)\}/gi;

/** `{BRAND}` is the caps form, so the check is "has case and is already all caps". */
const isUpper = (value: string) => value !== value.toLowerCase() && value === value.toUpperCase();

/** Fill one string; cheap to call on the 1157 that hold no placeholder. */
export function fillBrandCopy(value: string, values: BrandCopyValues = brandCopyValues('en')): string {
  if (!value.includes('{')) return value;
  return value.replace(PLACEHOLDER, (_match, key: string) => {
    const resolved = values[key.toLowerCase() as keyof BrandCopyValues];
    return isUpper(key) ? resolved.toUpperCase() : resolved;
  });
}

/**
 * Deep-copy a message tree with the placeholders resolved. Objects keep their shape; only leaves
 * change, so next-intl's namespace lookups and `t.rich` behave exactly as before.
 */
export function resolveBrandCopy<T>(messages: T, locale: string, site?: Site): T {
  const values = brandCopyValues(locale, site);

  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') return fillBrandCopy(node, values);
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) out[key] = walk(value);
      return out;
    }
    return node;
  };

  return walk(messages) as T;
}
