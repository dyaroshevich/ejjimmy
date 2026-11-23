'use client';

import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import NavLink from './NavLink';
import { landingAnchor } from '@/lib/locale-path';
import { useSite } from '@/lib/site-context';
import type { SectionId } from '@/lib/site.config';

type NavItem = { key: string; href: string; section?: SectionId };

const SOLUTIONS: readonly NavItem[] = [
  { key: 'solHome', href: '/#segments', section: 'segments' },
  { key: 'solBusiness', href: '/#segments', section: 'segments' },
  { key: 'solHybrid', href: '/#sigen', section: 'sigen' },
  { key: 'solCatalog', href: '/#systems', section: 'systems' },
];

const TOOLS: readonly NavItem[] = [
  { key: 'toolCalc', href: '/#systems', section: 'systems' },
  { key: 'toolKnowledge', href: '/#knowledge', section: 'knowledge' },
  { key: 'toolSteps', href: '/#steps', section: 'steps' },
  { key: 'toolPrivacy', href: '/privacy' },
];

export default function Footer({ showTheme = true }: { showTheme?: boolean }) {
  const t = useTranslations('footer');
  const { brand, contact, sections } = useSite();
  // A band the site does not render loses its link, the same rule as the header's.
  const visible = (list: readonly NavItem[]) =>
    list.filter((l) => !l.section || sections.includes(l.section));
  const solutions = visible(SOLUTIONS);
  const tools = visible(TOOLS);
  // The two singleton anchors are the only ones not rendered through NavLink.
  const pathname = usePathname() ?? '/';

  return (
    <footer className="site-footer" data-od-id="uni-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <a className="foot-brand" href={landingAnchor(pathname, '/#top')} aria-label={`${brand.name} — home`}>
              <span className="foot-mark" aria-hidden="true">1</span>
              <span>
                <b lang="en">{brand.name}</b>
                <small>{t('brandSub')}</small>
              </span>
            </a>
            <p className="foot-tag">{t('tagline')}</p>
            {showTheme && (
              <div style={{ marginTop: 'var(--sp-4)' }}>
                <ThemeToggle />
                <span style={{ marginLeft: 8, fontSize: 'var(--text-xs)', color: '#94a3b8' }}>{t('themeLabel')}</span>
              </div>
            )}
          </div>

          <div className="foot-col">
            <h4>{t('colSolutions')}</h4>
            {solutions.map((l) => (
              <NavLink key={l.key} href={l.href}>{t(l.key)}</NavLink>
            ))}
          </div>

          <div className="foot-col">
            <h4>{t('colTools')}</h4>
            {tools.map((l) => (
              <NavLink key={l.key} href={l.href}>{t(l.key)}</NavLink>
            ))}
          </div>

          <div className="foot-contact-card">
            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fcd34d', margin: '0 0 var(--sp-2)' }}>
              {t('colContact')}
            </h4>
            <a className="foot-contact-row" href={landingAnchor(pathname, '/#contact')}>
              <span className="foot-contact-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" />
                </svg>
              </span>
              <span>
                <small>{t('consultEngineer')}</small>
                <b lang="en">{contact.phone}</b>
              </span>
            </a>
            <a className="foot-contact-row" href={contact.lineUrl} target="_blank" rel="noopener noreferrer">
              <span className="foot-contact-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
                </svg>
              </span>
              <span>
                <small>{t('chatLineAi')}</small>
                <b lang="en">{contact.lineId}</b>
              </span>
              <Image
                className="foot-qr-mini"
                src="/images/line-oa-qr.png"
                alt="LINE OA QR code"
                width={70}
                height={70}
                loading="lazy"
              />
            </a>
          </div>
        </div>

        <div className="foot-base">
          <p>
            <strong style={{ color: '#fff' }} lang="en">{brand.name}</strong> <span>{t('areas')}</span>
          </p>
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
