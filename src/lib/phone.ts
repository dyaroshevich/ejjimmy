/**
 * Shared phone validation + normalization.
 * Thai mobiles: 06/08/09 + 8 digits (10 total), landlines 02/03x/04x/05x/07x (9-10 digits).
 * Accepts +66/66 prefix and separators (spaces, dashes, parens).
 * Falls back to generic international numbers (7-15 digits) for expat/tourist leads.
 * ponytail: single regex pair covers TH + intl; per-country libphonenumber if intl volume grows.
 */
export function normalizePhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if (d.length >= 11 && d.startsWith('66')) d = '0' + d.slice(2);
  return d;
}

export function isValidPhone(raw: string): boolean {
  const d = normalizePhone(raw);
  if (/^0[23456789]\d{7,8}$/.test(d)) return true; // TH: 9-10 digits
  if (/^[1-9]\d{6,14}$/.test(d)) return true; // intl: 7-15 digits
  return false;
}
