'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { SystemCard, SystemCat, TYPE_KEY, installmentThb } from './systemCard';
import ProductModal from './ProductModal';

const CATS: Array<SystemCat | 'all'> = ['all', 'home', 'business', 'hybrid', 'parts'];
// The approved sheet uses three different labels for one category: a short pill, a tier name
// with the kW band, and a badge per card. Keeping them in one key set is what made the tier
// strip read "Premium systems (Hybrid)" instead of "Premium Hybrid · 5 kW+".
const SEG_KEY: Record<SystemCat, string> = {
  home: 'segHome',
  business: 'segBusiness',
  hybrid: 'segHybrid',
  parts: 'catComponents',
};
const TIER_KEY: Record<Exclude<SystemCat, 'parts'>, string> = { home: 'tierHome', business: 'tierBusiness', hybrid: 'tierHybrid' };
const TIERS: Array<Exclude<SystemCat, 'parts'>> = ['home', 'business', 'hybrid'];
const PAGE = 8;

export default function SystemsGrid({ cards, failed }: { cards: SystemCard[]; failed: boolean }) {
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [cat, setCat] = useState<SystemCat | 'all'>('all');
  const [showAll, setShowAll] = useState(false);
  const [openCard, setOpenCard] = useState<SystemCard | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  const groupPrice = useMemo(() => {
    const byCat = new Map<SystemCat, number | null>();
    for (const tier of TIERS) {
      const prices = cards.filter((c) => c.cat === tier && c.priceThb != null).map((c) => c.priceThb as number);
      byCat.set(tier, prices.length ? Math.min(...prices) : null);
    }
    return byCat;
  }, [cards]);

  const money = (n: number) => `฿${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)}`;
  // The sheet sizes a badge by what the buyer compares: kW for on-grid roofs, the stored kWh for
  // a hybrid. `battery_capacity` arrives as free text ("10.0 kWh"), so only its number is used
  // and the unit comes from the locale — Russian reads "кВт·ч", not the Latin the row carries.
  const sizeOf = (p: SystemCard) => {
    const kwh = p.cat === 'hybrid' ? Number(p.battery?.match(/[\d.]+/)?.[0]) : NaN;
    if (Number.isFinite(kwh) && kwh > 0) return `${kwh} ${t('unitKwh')}`;
    return p.powerKw == null ? null : `${p.powerKw} ${t('unitKw')}`;
  };
  const badgeOf = (p: SystemCard) =>
    p.cat === 'parts' ? (p.subCategory ?? t(TYPE_KEY[p.kind] ?? 'typeAccessory')) : t(SEG_KEY[p.cat]);
  const visible = cat === 'all' ? cards : cards.filter((c) => c.cat === cat);
  const shown = showAll ? visible : visible.slice(0, PAGE);
  // A tier row is a price door, not a link: it filters the catalogue and puts the pills under the
  // sticky header. `all` is the way back, so a second tap on the same tier clears it.
  const pickTier = (tier: SystemCat) => {
    setCat((prev) => (prev === tier ? 'all' : tier));
    setShowAll(false);
    pillsRef.current?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      <div className="sec-head sec-head--center">
        <p className="kicker">{t('kicker')}</p>
        <h2>{t('title')}</h2>
        <p className="lede">{t('sub')}</p>
      </div>

      <div className="tier-strip">
        {TIERS.map((tier) => {
          const price = groupPrice.get(tier) ?? null;
          return (
            <button
              type="button"
              className="tier-strip__item"
              aria-pressed={cat === tier}
              onClick={() => pickTier(tier)}
              key={tier}
            >
              <span className="t-price">
                {price == null ? t('priceAsk') : t('fromPrice', { price: money(price) })}
              </span>
              <span className="t-name">{t(TIER_KEY[tier])}</span>
            </button>
          );
        })}
      </div>

      <div className="pills" role="group" aria-label={tc('filter')} ref={pillsRef}>
        {CATS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === cat}
            onClick={() => {
              setCat(id);
              setShowAll(false);
            }}
          >
            {id === 'all' ? t('catAll') : t(SEG_KEY[id])}
          </button>
        ))}
      </div>

      {failed ? (
        <p className="state-note">
          {t('loadError')} <a href="/chat">{t('consultExpert')}</a>
        </p>
      ) : visible.length === 0 ? (
        <p className="state-note">{t('empty')}</p>
      ) : (
        <>
          <div className="products">
            {shown.map((p) => {
              const inst = p.cat === 'parts' ? null : installmentThb(p.priceThb);
              const size = p.cat === 'parts' ? null : sizeOf(p);
              return (
              // The sheet gives its inner padding to `.product-body`, not to the card: `article.card`
              // carries `padding: clamp(20px, 2.5vw, 28px)` and product cards are `<div>`s, so an
              // <article> here stole 28 px from the photo and wrapped the CTA onto three lines.
              <div className="card product product--rich" key={p.id} data-cat={p.cat}>
                <button
                  type="button"
                  className="product-photo product-open"
                  aria-label={`${t('details')}: ${p.name}`}
                  onClick={() => setOpenCard(p)}
                >
                  <span className="badge" lang={p.cat === 'parts' && p.subCategory ? 'th' : undefined}>{badgeOf(p)}{size ? ` · ${size}` : ''}</span>
                  {p.photo ? (
                    p.photo.startsWith('http') ? (
                      <img className="kit-photo" src={p.photo} alt={p.name} width={800} height={800} loading="lazy" />
                    ) : (
                      <Image
                        className="kit-photo"
                        src={p.photo}
                        alt={p.name}
                        width={800}
                        height={800}
                        sizes="(min-width: 1100px) 282px, (min-width: 760px) 45vw, 92vw"
                      />
                    )
                  ) : null}
                  <Image className="brand-mark" src={p.brandMark} alt={p.brand} width={300} height={300} sizes="46px" />
                </button>
                <div className="product-body">
<h3>
                     <button type="button" className="product-name" onClick={() => setOpenCard(p)}>
                       <span lang="th">{p.name}</span>
                     </button>
                   </h3>
                   {p.model ? <p className="kit-sub" lang="th">{p.model}</p> : null}

                  <div className="product-price-row">
                    <div>
                      <span className="lbl">{t('fullPrice')}</span>
                      <span className="full-price">{p.priceThb == null ? t('priceAsk') : money(p.priceThb)}</span>
                      <span className="inst-note">
                        {inst == null ? t('totalVat') : `${t('installStart')} ${money(inst)}${t('perMonth')}`}
                      </span>
                    </div>
                    {p.savingsThb != null ? (
                      <div className="save">
                        <span className="lbl">{t('savePower')}</span>
                        <i>
                          {p.savingsApprox ? '~' : ''}
                          {money(p.savingsThb)}
                          <small>{t('perMonth')}</small>
                        </i>
                      </div>
                    ) : null}
                  </div>

                  {inst != null || p.specLine || p.monitoring ? (
                    <div className="product-inst">
                      <span>
                        <span>{inst != null ? t('monthlyInst') : t('techSpecs')}</span>
                        <b>{inst != null ? money(inst) : (p.specLine ?? p.monitoring)}</b>
                      </span>
                      <span className="roi">
                        {p.paybackYears != null ? `${p.paybackYears} ${t('yrsShort')}` : t('roiPlan')}
                      </span>
                    </div>
                  ) : null}

                  <a className="btn btn--primary btn--sm btn--block" href="#contact">
                    {t(p.cat === 'parts' ? 'ctaOther' : 'ctaSystem')} →
                  </a>
                </div>
              </div>
              );
            })}
          </div>
          {!showAll && visible.length > PAGE ? (
            <div className="more-row">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowAll(true)}>
                {t('showMore')} ({visible.length - PAGE})
              </button>
            </div>
          ) : null}
        </>
      )}

      <ProductModal card={openCard} onClose={() => setOpenCard(null)} />
    </>
  );
}
