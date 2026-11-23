'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import CookieConsent from '@/components/CookieConsent';
import Header from './Header';
import Footer from '@/components/layout/Footer';
import ChatShell from '@/components/chat/ChatShell';
import { useChatContext } from '@/components/chat/ChatContext';
import { useTranslations } from 'next-intl';
import { useSite } from '@/lib/site-context';

interface LandingShellProps {
  children: ReactNode;
}

/**
 * Section ids that the pre-OpenDesign landing used and that still sit in bookmarks, in the footer of
 * partner pages and in old LINE broadcasts. The anchor itself is gone, so the browser did nothing at
 * all: the visitor landed at the top and the link looked broken rather than renamed.
 */
const LEGACY_HASHES: Record<string, string> = {
  'how-it-works': 'steps',
  portfolio: 'cases',
  sigenergy: 'sigen',
  'contact-form': 'contact',
};

export default function LandingShell({ children }: LandingShellProps) {
  return (
    <ChatShell>
      <LandingBody>{children}</LandingBody>
    </ChatShell>
  );
}

function LandingBody({ children }: LandingShellProps) {
  const t = useTranslations('shell');
  const { brand } = useSite();
  const { isChatOpen } = useChatContext();
  const [atTop, setAtTop] = useState(true);

  // Developer easter egg — no UI impact
  useEffect(() => {
    console.log(
      `%c☀️ ${brand.name} %c— this site runs on sunshine (and Next.js)`,
      'font-weight: bold; color: #ff8a00;',
      'color: inherit;'
    );
  }, [brand.name]);

  // The two bottom notices are readable at the top of the page and must stop covering bands
  // the moment the visitor scrolls: pinned, they ate real taps (the category pill at y=690
  // answered elementFromPoint with the notice's own <p>). Kept mounted, only display:none,
  // so the PWA listener survives a scroll and the notice returns on the way back up.
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // An old bookmark lands on a ghost anchor: nothing scrolls and no error is raised. Move it to the
  // section that replaced it and rewrite the address, so copying the URL from the bar gives the
  // current one. `scrollIntoView` is safe here — the target is a band, not a child of the hero's
  // snap strip, which is the case where walking every ancestor scroller moved the page.
  useEffect(() => {
    const legacy = window.location.hash.replace('#', '');
    const current = LEGACY_HASHES[legacy];
    if (!current) return;
    const band = document.getElementById(current);
    if (!band) return;
    window.history.replaceState(null, '', `#${current}`);
    band.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-x-clip selection:bg-orange-100 selection:text-orange-900 transition-colors duration-500">
      <a className="skip" href="#main">{t('skip')}</a>
      <Header />

      <main id="main">
        {children}
      </main>

      <Footer showTheme={false} />

      {/* System notices: stacked above the sticky AI bar so the chat input is never covered.
          Hidden while the chat is open, and never pinned over a band once the page scrolls
          (display:none only — the components stay mounted). */}
      {!isChatOpen && (
        <div
          data-notices=""
          className="fixed inset-x-0 z-[60] px-4 flex flex-col items-center gap-2 pointer-events-none"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 108px)',
            display: atTop ? undefined : 'none',
          }}
        >
          <CookieConsent />
          <PWAInstallBanner />
        </div>
      )}
    </div>
  );
}
