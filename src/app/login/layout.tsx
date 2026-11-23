import type { Metadata } from 'next';
import { getSite } from '@/lib/site-server';

// `/login` is a client component, so it cannot carry metadata itself. Without this the page inherited
// the storefront's marketing title and, because robots.txt closed `/admin` but not `/login`, a sign-in
// form could be indexed as a near-duplicate of the landing page.
export function generateMetadata(): Metadata {
  const { brand } = getSite();
  return {
    title: `Staff sign-in — ${brand.name}`,
    robots: 'noindex, nofollow',
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
