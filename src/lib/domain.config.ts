/**
 * What this business sells — the second half of the brand, beside `site.config.ts`.
 *
 * `site.config.ts` answers "who are we": name, origin, contacts, address. This file answers "what do we
 * sell, on what terms, where": how the catalogue is cut into tiers, how the instalment is computed, what
 * the shop promises in years, and which ground the crew covers. Both are config in the template sense —
 * a franchisee changes this file and no component.
 *
 * Why a separate file rather than more keys in `site.config.ts`: the values here are consumed by the
 * pricing path, the schema.org block and the LINE flex messages at once, and they carry *rules* (a tier
 * boundary is a number a card is classified by, not a label). Keeping them apart is what lets
 * `docs/plans/BRAND_TEMPLATE_STRATEGY` treat "who" and "what" as separate edits.
 *
 * What deliberately does NOT live here: units and labels. `kW`/`kWh`/`฿` are read by eight locales as
 * `products.unitKw`, `unitKwh` and a locale-aware `Intl.NumberFormat` — putting them in config would
 * replace a correct Thai string with a Latin one. The catalogue's warranty *text* is a DB column for the
 * same reason: a per-brand number here would disagree with the row the card actually prints.
 */
import { address } from './site.config';

/** How the catalogue is cut. `parts` is everything that is not a whole system. */
export type SystemCat = 'home' | 'business' | 'hybrid' | 'parts';

export const categories = {
  /** Pill order in the catalogue, and the order the filters are proven in. */
  order: ['all', 'home', 'business', 'hybrid', 'parts'] as const,
  /** Tiers the price strip quotes. `parts` has no tier: a resistor is not a package. */
  tiers: ['home', 'business', 'hybrid'] as const,
  /**
   * Where the home tier ends. The catalogue's first paint sorts systems by kW, so this is the line a
   * visitor reads as "roof" versus "business", not a sales rule.
   */
  homeMaxKw: 5,
  /**
   * A row is a hybrid when its `specifications.type` says so, or when the brand is one of these —
   * battery-coupled systems whose own name carries the storage instead of a kW band. `sigenergy` is the
   * live case; a franchisee selling only on-grid systems empties this array and the tier disappears on
   * its own, because no card is classified into it.
   */
  hybridBrands: ['sigenergy'] as string[],
} as const;

/**
 * The instalment the shop quotes: 10 % down, 24 months, no interest.
 *
 * One function, because this arithmetic used to be typed twice — `systemCard.ts` and `ProductCard.tsx`
 * — with a comment pointing at a third copy (`lib/line-product.ts`) that no longer exists. The board's
 * card, the modal, the tier strip and the LINE share text all have to print the same number.
 */
export const financing = {
  /** Share paid up front. */
  downPayment: 0.1,
  months: 24,
  /** Annual, as a fraction. Zero today; a market that charges interest changes one number. */
  interest: 0,
} as const;

/** Monthly instalment in whole baht, or `null` when the row has no price. */
export function monthlyInstalment(priceThb: number | null | undefined): number | null {
  if (priceThb == null || !Number.isFinite(priceThb)) return null;
  const financed = priceThb * (1 - financing.downPayment);
  return Math.round(financed / financing.months);
}

/** True when a catalogue row belongs in the hybrid tier. */
export function isHybridSystem(typeText: string, brandName: string): boolean {
  if (/hybrid/i.test(typeText)) return true;
  const brand = brandName.trim().toLowerCase();
  return categories.hybridBrands.some((b) => brand.includes(b.toLowerCase()));
}

/**
 * Which category a catalogue row falls into, from its own columns only — the grid and the mobile
 * behaviour gate both read this instead of re-deriving the rule.
 */
export function categoryOfRow(row: { type?: string | null; power_kw?: number | null; brand?: string | null; typeText?: string }): SystemCat {
  if (row.type !== 'system') return 'parts';
  if (isHybridSystem(row.typeText ?? '', row.brand ?? '')) return 'hybrid';
  return row.power_kw != null && row.power_kw <= categories.homeMaxKw ? 'home' : 'business';
}

/**
 * What the shop actually installs. Read by the nine system prompts, which used to spell the panel and
 * inverter brands out in every locale — so a franchisee with a different supply chain would have had the
 * AI recommending the founder's brands to their customers.
 */
export const market = {
  /** Panel makers, in the order the AI should mention them. */
  panels: ['Longi', 'Jinko', 'REC'] as string[],
  /** Inverter makers. */
  inverters: ['Huawei', 'GoodWe'] as string[],
  /** The neighbouring places the AI may name; the rest comes from `address.serviceAreas`. */
  nearby: ['Phuket', 'Ao Nang'] as string[],
  /** Districts the crew works in, straight from the address block. */
  districts: address.serviceAreas,
} as const;

/**
 * What the shop promises, in years. Read by the schema.org block and by the LINE answer that talks about
 * warranty before a customer has a product row in hand; the card's own numbers come from the DB.
 */
export const warranty = {
  /** Typical range across the panels the shop installs. */
  panels: [25, 30] as [number, number],
  /** Typical range across the inverters. */
  inverter: [10, 12] as [number, number],
  /** Workmanship, one number. */
  installation: 5,
} as const;

/**
 * Where and when the business works. `address` already holds the city, the coordinates, the opening hours
 * and the districts the crew covers; this block is the presentation of them that schema.org and the
 * contact form need, so neither carries its own copy of "Krabi, Phuket, Southern Thailand".
 */
export const service = {
  hours: address.hours,
  geo: address.geo,
  /** The districts listed on the contact form. */
  areas: address.serviceAreas,
  /**
   * The catchments schema.org advertises, in the order they are declared: the city itself, the next
   * province the crew travels to, and the region. Kept as values, not derived from `areas`, because
   * structured data should not claim the shop serves only its own four districts.
   */
  areaServed: [address.city, 'Phuket', 'Southern Thailand'] as string[],
  /** schema.org `priceRange` — a band, not a price. */
  priceRange: '฿฿฿',
  /** `Mo-Su 09:00-18:00` → the pair schema.org wants. */
  opensAt: '08:00',
  closesAt: '20:00',
} as const;
