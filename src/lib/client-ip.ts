/**
 * One answer to "who is asking", for every route that rate-limits.
 *
 * `x-forwarded-for` is a list the caller starts: a request may arrive as
 * `x-forwarded-for: 1.2.3.4` and the edge appends the real peer after it. Reading `.split(',')[0]`
 * therefore keyed the limiter on a value the caller chose, so rotating that header bought a fresh
 * bucket on every request — the limit existed and did nothing. Read the edge's own headers first,
 * and when only the forwarded list is available take its **last** hop (the one the edge appended),
 * never the first.
 */
export function clientIp(headers: Headers): string {
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((hop) => hop.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  const cloudflare = headers.get('cf-connecting-ip')?.trim();
  if (cloudflare) return cloudflare;

  return 'anonymous';
}
