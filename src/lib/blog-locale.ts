/**
 * Blog rows are written one language each: `blog_posts.locale` holds it, and a null column means
 * Thai, the site's primary language. The landing used to render whatever came back first, so the
 * Thai page showed English cards (owner's screenshot, 2026-11-06). Filter by the visitor's locale
 * and fall back to Thai — the same rule `selectLocaleRows` uses for catalogue and case rows.
 */
export function postsForLocale<T extends { locale?: string | null }>(rows: T[], locale: string): T[] {
  const lang = (value?: string | null) => (value || 'th').split('-')[0];
  const wanted = locale.split('-')[0];
  const mine = rows.filter((row) => lang(row.locale) === wanted);
  if (mine.length) return mine;
  return rows.filter((row) => lang(row.locale) === 'th');
}
