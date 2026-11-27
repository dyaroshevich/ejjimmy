'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/** The magnet request form. Server components cannot carry `onSubmit`, so it lives here. */
export default function LeadMagnetForm({
  magnetKey,
  marketingTitle,
  isTripwire,
  price,
}: {
  magnetKey: string;
  marketingTitle: string;
  isTripwire: boolean;
  price: number | null;
}) {
  const t = useTranslations('magnet');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      id="lead-magnet-form"
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = (formData.get('name') as string) || '';
        const phone = (formData.get('phone') as string) || '';

        if (!name || !phone) {
          setError(t('errorFill'));
          return;
        }

        setError(null);
        setStatus('sending');
        try {
          const response = await fetch('/api/leads/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              phone: phone.replace(/\D/g, ''),
              source: 'lead_magnet',
              line_id: null,
              location: 'Krabi',
              notes: `Lead magnet requested: ${marketingTitle} (${magnetKey})`,
            }),
          });
          const result = await response.json();
          if (result.success) {
            setStatus('done');
            form.reset();
          } else {
            setStatus('idle');
            setError(t('errorServer', { error: result.error || '?' }));
          }
        } catch {
          setStatus('idle');
          setError(t('errorNetwork'));
        }
      }}
    >
      <div className="field">
        <label htmlFor="lmName">{t('namePh')}</label>
        <input id="lmName" name="name" type="text" placeholder={t('namePh')} required className="input" />
      </div>
      <div className="field">
        <label htmlFor="lmPhone">{t('phonePh')}</label>
        <input
          id="lmPhone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder={t('phonePh')}
          required
          className="input"
        />
      </div>
      <button type="submit" className="btn btn--primary btn--lg w-full" disabled={status === 'sending'}>
        {isTripwire && price ? `${t('buy')} ฿${price.toLocaleString('th-TH')}` : t('getFree')}
      </button>
      <p className="text-xs text-muted text-center mt-2" aria-live="polite">
        {error ?? (status === 'done' ? t('thanks') : t('pdp'))}
      </p>
    </form>
  );
}
