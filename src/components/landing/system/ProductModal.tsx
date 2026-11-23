'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { SystemCard, SystemCat, TYPE_KEY, installmentThb } from './systemCard';

const SEG_KEY: Record<SystemCat, string> = {
  home: 'segHome',
  business: 'segBusiness',
  hybrid: 'segHybrid',
  parts: 'catComponents',
};

/**
 * The position of one system, on the browser's own `<dialog>`: Esc, the focus trap, the backdrop and
 * focus returning to the card that opened it are `showModal()`'s job, not ours.
 */
export default function ProductModal({ card, onClose }: { card: SystemCard | null; onClose: () => void }) {
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const locale = useLocale();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (card && !dialog.open) dialog.showModal();
    else if (!card && dialog.open) dialog.close();
  }, [card]);

  const money = (n: number) => `฿${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)}`;
  const inst = card && card.cat !== 'parts' ? installmentThb(card.priceThb) : null;

  return (
    <dialog
      ref={ref}
      className="product-modal"
      aria-labelledby="pm-title"
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop targets the dialog itself; a click on any content targets a child.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {card ? (
        <div className="product-modal__in">
          <button type="button" className="product-modal__x" aria-label={tc('close')} onClick={onClose}>
            ×
          </button>

          <div className="product-modal__photo">
            <span className="badge" lang={card.cat === 'parts' && card.subCategory ? 'th' : undefined}>
              {card.cat === 'parts' ? (card.subCategory ?? t(TYPE_KEY[card.kind] ?? 'typeAccessory')) : t(SEG_KEY[card.cat])}
            </span>
            {card.photo ? (
              card.photo.startsWith('http') ? (
                <img src={card.photo} alt={card.name} width={800} height={800} />
              ) : (
                <Image src={card.photo} alt={card.name} width={800} height={800} sizes="(min-width: 860px) 440px, 92vw" />
              )
            ) : null}
          </div>

          <div className="product-modal__body">
            <h2 id="pm-title">{card.name}</h2>
            <p className="product-modal__meta">
              {[card.brand, card.model, card.powerKw != null ? `${card.powerKw} ${t('unitKw')}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>

            <div className="product-modal__price">
              <div>
                <span className="lbl">{t('fullPrice')}</span>
                <b>{card.priceThb == null ? t('priceAsk') : money(card.priceThb)}</b>
              </div>
              {inst != null ? (
                <span className="inst-note">
                  {t('installStart')} {money(inst)}
                  {t('perMonth')}
                </span>
              ) : null}
              {card.savingsThb != null ? (
                <span className="inst-note">
                  {t('savePower')}: {card.savingsApprox ? '~' : ''}
                  {money(card.savingsThb)}
                  {t('perMonth')}
                </span>
              ) : null}
            </div>

            {/* Above the details on purpose: on a phone the spec table runs past the fold. */}
            <a className="btn btn--primary btn--block" href="#contact" onClick={onClose}>
              {t(card.cat === 'parts' ? 'ctaOther' : 'ctaSystem')} →
            </a>

            {card.description ? (
              <>
                <h3>{t('descTitle')}</h3>
                <p className="product-modal__text">{card.description}</p>
              </>
            ) : null}

            {card.specs.length ? (
              <>
                <h3>{t('techSpecs')}</h3>
                <dl className="spec-table">
                  {card.specs.map((row) => (
                    <div key={row.label} className="spec-table__row">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}

            {card.warrantyProduct != null && card.warrantyPerformance != null ? (
              <p className="dim">
                {t('warrantyNote', { product: card.warrantyProduct, performance: card.warrantyPerformance })}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
