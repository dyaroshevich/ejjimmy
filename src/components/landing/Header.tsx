'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import NavLink from '@/components/layout/NavLink';
import BrandMark from '@/components/BrandMark';
import { useSite } from '@/lib/site-context';
import type { SectionId } from '@/lib/site.config';

// Section anchors first, then the two real routes. Both lists are the approved sheet's;
// the strip is the mobile form and carries three more links because it has the room.
// Absolute `/#anchor` so the same list works on every page (inner pages no longer
// have their own header). NavLink turns `/#x` into a plain in-page hash while the landing is open,
// so a prefixed URL (`/ru`) neither reloads nor falls back to Thai.
// A band the site does not render (`site.sections`) takes its link with it; `/blog` and `/cases`
// are routes, not bands, so they stay on every storefront.
type NavItem = { key: string; href: string; section?: SectionId };

const INLINE: readonly NavItem[] = [
  { key: 'navSolutions', href: '/#segments', section: 'segments' },
  { key: 'navCatalog', href: '/#systems', section: 'systems' },
  { key: 'navPortfolio', href: '/#cases', section: 'cases' },
  { key: 'navHybrid', href: '/#sigen', section: 'sigen' },
  { key: 'navSteps', href: '/#steps', section: 'steps' },
  { key: 'navBlog', href: '/blog' },
];

const STRIP: readonly NavItem[] = [
  ...INLINE.slice(0, 4),
  { key: 'navCalculator', href: '/#systems', section: 'systems' },
  { key: 'navKnowledge', href: '/#knowledge', section: 'knowledge' },
  INLINE[4],
  { key: 'navBlog', href: '/blog' },
  { key: 'navCases', href: '/cases' },
];

export default function Header() {
  const t = useTranslations('header');
  const { brand, sections } = useSite();
  // One filter for both lists: a band the site does not render loses its anchor, and the strip's
  // deliberate duplicate of `/#systems` collapses to one link.
  const visible = (list: readonly NavItem[]) => {
    const seen = new Set<string>();
    return list.filter((l) => {
      if (l.section && !sections.includes(l.section)) return false;
      if (seen.has(l.href)) return false;
      seen.add(l.href);
      return true;
    });
  };
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes owns the class on <html>; this control only reads and writes through it.
  // Mount-gated because resolvedTheme is undefined during SSR, and the glyph must not flip.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === 'dark';

  const toggleDark = () => setTheme(dark ? 'light' : 'dark');

  return (
    <header className="site-header" data-od-id="uni-header">
      <div className="wrap bar">
        <a className="logo" href="/" aria-label={`${brand.name} — home`}>
          <span className="logo-mark" aria-hidden="true">
            <BrandMark size={21} />
          </span>
          <span>
            {brand.name} <small>{t('brandTop')}</small>
          </span>
        </a>
        <nav className="nav nav--inline" aria-label="Sections" data-od-id="uni-nav-desktop">
          {visible(INLINE).map((l) => (
            <NavLink key={l.key + l.href} href={l.href}>{t(l.key)}</NavLink>
          ))}
        </nav>
        <div className="spacer" />
        <LocaleSwitcher className="theme-btn locale-btn" />
        <button type="button" className="theme-btn" onClick={toggleDark} aria-label={t('switchMode')} aria-pressed={dark}>
          {/* The sheet's own control is a text glyph (mock :410) and `☾` renders as a hairline
             crescent in the system font — ~2 px of ink in a 44 px circle. An SVG draws the same
             idea at the size the button expects. */}
          {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
        </div>
      <div className="wrap">
        <nav className="nav nav--strip" aria-label="Sections" data-od-id="uni-nav">
          {visible(STRIP).map((l) => (
            <NavLink key={l.key + l.href} href={l.href}>{t(l.key)}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
