'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { landingAnchor } from '@/lib/locale-path';

// A bare <a> for anything with a fragment: on the landing Next would route to the same path and take
// the scroll over, and from an inner page its client router drops the hash the middleware redirect keeps.
export default function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const resolved = landingAnchor(usePathname() ?? '/', href);
  return resolved.includes('#') ? <a href={resolved}>{children}</a> : <Link href={resolved}>{children}</Link>;
}
