/**
 * Content tables carry a `locale` column, but only Thai has been authored so far.
 * Fall back to Thai instead of showing an empty section to a non-Thai visitor.
 */
export function selectLocaleRows<T extends { locale?: string | null }>(rows: T[], locale: string): T[] {
  const exact = rows.filter((r) => r.locale === locale);
  if (exact.length) return exact;
  const thai = rows.filter((r) => (r.locale ?? 'th') === 'th');
  return thai.length ? thai : rows;
}
