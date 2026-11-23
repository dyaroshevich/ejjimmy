'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/landing/Header';
import Footer from './Footer';
import ChatShell from '@/components/chat/ChatShell';
import { splitLocale } from '@/lib/locale-path';

const hidePaths = ['/admin', '/chat', '/liff', '/login', '/proposal', '/v/', '/view/'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Every route is also reachable as /<locale>/… and the middleware only rewrites,
  // so the visitor's pathname still carries the prefix. Strip it before the two
  // decisions below, or /de, /ru, … render the landing inside AppShell's chrome and
  // double both the header and the footer.
  const { path } = splitLocale(pathname);
  const hidden = hidePaths.some((p) => path.startsWith(p));
  // '/' brings its own chrome from LandingShell (same Header component, so the
  // look is identical — inner pages used to render a second, different header).
  const landing = path === '/';

  const showHeader = !hidden && !landing;
  const showFooter = !hidden && !landing;

  return (
    <>
      {showHeader && <Header />}
      {/* Inner pages get the same AI bar/overlay as '/', which brings its own from
          LandingShell. Hidden paths (admin, chat, liff, login…) keep none. */}
      {!hidden && !landing ? <ChatShell>{children}</ChatShell> : children}
      {showFooter && <Footer />}
    </>
  );
}
