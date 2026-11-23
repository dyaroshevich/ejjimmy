'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
// submitLead is called via API route to avoid server-only import issues in client components
import { normalizePhone, isValidPhone } from '@/lib/phone';
import { useLiffProfile } from '@/hooks/useLiffProfile';
import { localeHref } from '@/lib/locale-path';
import { toast } from 'sonner';
import { useSite } from '@/lib/site-context';

const TRUST_ICONS = [
  <path key="shield" d="M12 2l8 3.5v5.2c0 5-3.4 9.4-8 11.3-4.6-1.9-8-6.3-8-11.3V5.5L12 2z" />,
  <g key="clock"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></g>,
  <g key="trend"><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></g>,
];

export default function ContactSection() {
  const t = useTranslations('contact');
  const f = useTranslations('leadForm');
  const { contact, address } = useSite();
  // Each storefront covers its own districts; the form's options and the lead's `location` follow.
  const areas = address.serviceAreas;
  const { profile } = useLiffProfile();
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [area, setArea] = useState(areas[0]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const consentRef = useRef<HTMLInputElement>(null);

  const phoneError = phoneTouched && !isValidPhone(phone) ? f('phoneError') : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const rawPhone = (data.get('phone') as string) || '';
    setPhoneTouched(true);
    if (!isValidPhone(rawPhone)) return;
    // The form is noValidate, so `required` on the box is a hint for the browser's
    // own autofill UI, not a gate — the gate is here.
    if (!consent) {
      setConsentError(true);
      consentRef.current?.focus();
      return;
    }

    setLoading(true);
    const chosen = (data.get('area') as string) || areas[0];
    const location = chosen === 'other'
      ? ((data.get('areaOther') as string) || '').trim() || 'Krabi'
      : chosen;
    let error: string | undefined;
    try {
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (data.get('name') as string) || '',
          phone: normalizePhone(rawPhone),
          line_id: profile?.userId || null,
          location,
          source: 'web',
          // ponytail: the consent record rides in `notes` because a real column is a
          // migration plus a `submit_lead` signature change. It is visible in /admin/leads.
          notes: `PDPA consent v1.0 — web form, ${new Date().toISOString()}, hero_v=${(document.cookie.match(/(?:^|; )hero_v=([^;]+)/)?.[1]) ?? 'unknown'}`,
        }),
      });
      const result = await response.json();
      error = result.error;
    } catch {
      error = 'network';
    }
    setLoading(false);

    if (error) {
      toast.error(error === 'network' ? f('failToast') : f('errorToast') + error);
      return;
    }
    setSent(true);
    toast.success(f('successToast'));
    // The sent panel stays as the in-place fallback; the thank-you page is the primary confirmation.
    router.push(localeHref(locale, '/thank-you'));
  }

  return (
    <section className="block block--cream" id="contact" data-od-id="uni-contact">
      <div className="sec-head">
        <p className="kicker">{t('badge')}</p>
        <h2>
          <span>{t('titleA')}</span>
          <br />
          <span className="grad">{t('titleB')}</span>
        </h2>
        <p className="lede">{t('sub')}</p>
      </div>

      <div className="lead-grid">
        <div>
          <ul className="trust" style={{ marginTop: 0 }}>
            {TRUST_ICONS.map((icon, i) => (
              <li key={i}>
                <span className="trust-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    {icon}
                  </svg>
                </span>
                <span>{t(`b${i + 1}`)}</span>
              </li>
            ))}
          </ul>
          <div className="info">
            {/* Owner's 2026-11-07: the handle is an offer, not a button — it reads as a CTA banner now:
               channel chip, the handle as the headline, the reply promise under it, and an arrow. */}
            <a
              className="line-cta"
              href={contact.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="line-cta-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
                </svg>
              </span>
              <span className="line-cta-txt">
                <b>LINE {contact.lineId}</b>
                <small>{t('lineAi')}</small>
              </span>
              <span className="line-cta-go" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </a>
            <p style={{ marginTop: 'var(--sp-3)' }}>{t('hours')}</p>
            <p className="privacy">{t('desc')}</p>
          </div>
        </div>

        <div className="card" style={{ padding: 'clamp(24px, 3vw, 36px)' }}>
          <div>
            {sent ? (
              <div className="success" role="status">
                <span className="badge badge--success">{t('received')}</span>
                <p>{f('successSub')}</p>
              </div>
            ) : (
              <form className="form-grid" id="leadForm" onSubmit={handleSubmit} noValidate data-od-id="uni-lead-form">
                <div className="field">
                  <label htmlFor="fName">{f('nameLabel')}</label>
                  <input
                    className="input"
                    id="fName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder={f('namePh')}
                    defaultValue={profile?.displayName}
                    minLength={2}
                    maxLength={100}
                  />
                </div>
                <div className="field">
                  <label htmlFor="fPhone">{f('phoneLabel')}</label>
                  <input
                    className="input"
                    id="fPhone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    maxLength={18}
                    placeholder="+66 …"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setPhoneTouched(true)}
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? 'fPhoneError' : undefined}
                  />
                  {phoneError && (
                    <p id="fPhoneError" role="alert" className="field-error">{phoneError}</p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="fArea">{f('locationLabel')}</label>
                  <select
                    className="input"
                    id="fArea"
                    name="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                    <option value="other">{t('otherArea')}</option>
                  </select>
                </div>
                {area === 'other' && (
                  <div className="field">
                    <label htmlFor="fAreaOther">{t('areaOtherLabel')}</label>
                    <input
                      className="input"
                      id="fAreaOther"
                      name="areaOther"
                      type="text"
                      maxLength={200}
                      placeholder={f('locationPh')}
                    />
                  </div>
                )}
                <label
                  htmlFor="fConsent"
                  style={{
                    display: 'flex',
                    gap: 'var(--sp-3)',
                    alignItems: 'flex-start',
                    fontSize: 'var(--text-xs)',
                    lineHeight: 1.7,
                    color: 'var(--fg)',
                    textTransform: 'none',
                    letterSpacing: 0,
                    fontWeight: 500,
                  }}
                >
                  <input
                    ref={consentRef}
                    id="fConsent"
                    name="consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setConsentError(false);
                    }}
                    aria-invalid={consentError}
                    aria-describedby={consentError ? 'fConsentError' : undefined}
                    style={{ marginTop: 4, accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span>
                    {f('consentLabel')}{' '}
                    <Link href="/privacy" style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>
                      {f('consentLink')}
                    </Link>
                  </span>
                </label>
                {consentError && (
                  <p id="fConsentError" role="alert" className="field-error" style={{ marginTop: 'calc(var(--sp-3) * -1)' }}>
                    {f('consentError')}
                  </p>
                )}
                <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                  {loading ? f('sending') : f('submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
