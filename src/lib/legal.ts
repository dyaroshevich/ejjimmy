/**
 * The owner's own registration data, and whether it is real yet.
 *
 * `/privacy` and `/terms` are the two pages a Thai consumer can hold you to, and both name a data
 * controller. Until that name, its tax id and its phone are the owner's, the documents are drafts — so
 * this module answers one question for both pages and for the sitemap: *is this publishable?*
 *
 * The rule is intentionally mechanical rather than a boolean someone remembers to flip: a value that
 * still contains one of the placeholder markers below counts as missing. That way the page, its
 * `robots` tag and the sitemap cannot disagree — a draft stays `noindex` and out of the sitemap, and
 * the day the last placeholder is replaced both flip on their own.
 *
 * Where the values live: `brand.json` (`brand.legal`), because a franchisee's entity is brand data, not
 * code. `npm run brand:new` leaves them empty on purpose — a template must not ship someone's tax id.
 */
import site from '../../brand.json';

/** Markers that mean "a human still has to fill this". One match is enough to keep the page a draft. */
const PLACEHOLDERS = ['รอระบุ', 'xxx', 'to be completed', '0-0000-0000-0000-0000-0000-0', '0000000000000'];

export const legalPlaceholders = PLACEHOLDERS;

export interface LegalProfile {
  /** Registered company name, as it appears on the tax invoice. */
  entityName: string;
  /** Tax identification number. Digits, with or without dashes. */
  taxId: string;
  /** Street address of the registered office. */
  address: string;
  /** Display phone for PDPA requests. */
  phone: string;
  /** Effective date of the current versions, ISO. */
  effective: string;
  /** Document version, shown beside the date. */
  version: string;
}

const raw = (site.brand as { legal?: Partial<LegalProfile> }).legal ?? {};

export const legal: LegalProfile = {
  entityName: raw.entityName ?? site.brand.legalName ?? site.brand.name,
  taxId: raw.taxId ?? '',
  address: raw.address ?? '',
  phone: raw.phone ?? '',
  effective: raw.effective ?? '2026-10-20',
  version: raw.version ?? '1.0',
};

/** True when a field still carries a placeholder or is empty. */
export function isPlaceholder(value: string | undefined): boolean {
  const v = (value ?? '').trim();
  if (!v) return true;
  const lower = v.toLowerCase();
  return PLACEHOLDERS.some((m) => lower.includes(m.toLowerCase()));
}

/** The fields that still need the owner, in the order the documents use them. */
export function missingLegalFields(profile: LegalProfile = legal): string[] {
  const checks: Array<[keyof LegalProfile, string]> = [
    ['entityName', 'legal entity name'],
    ['taxId', 'tax identification number'],
    ['address', 'registered address'],
    ['phone', 'contact phone'],
  ];
  return checks.filter(([key]) => isPlaceholder(profile[key])).map(([, label]) => label);
}

/**
 * Whether the two documents may be indexed. False today: the owner's registration details are still
 * placeholders, so the pages render a draft banner, carry `noindex` and stay out of the sitemap.
 */
export const isLegalReady = missingLegalFields().length === 0;
