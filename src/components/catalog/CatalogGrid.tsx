'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  categoryFromRow,
  filterByCategory,
  firstImage,
  groupRows,
  rowPrice,
  type ImportedRow,
} from '@/lib/catalog';

const CATS = ['all', 'home', 'business', 'hybrid', 'parts'] as const;
type Cat = (typeof CATS)[number];
const CAT_KEY: Record<Cat, string> = {
  all: 'catAll',
  home: 'catHome',
  business: 'catBusiness',
  hybrid: 'catHybrid',
  parts: 'catComponents',
};

/** The visitor-facing shelf: live pills over the same rows the landing's grid reads. */
export default function CatalogGrid({ rows }: { rows: ImportedRow[] }) {
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [cat, setCat] = useState<Cat>('all');
  const [showAll, setShowAll] = useState(false);
  const sorted = groupRows(rows);
  const visible = filterByCategory(sorted, cat);
  const shown = showAll ? visible : visible.slice(0, 12);
  const money = (n: number) => `฿${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)}`;

  return (
    <>
      <div className="sec-head sec-head--center">
        <p className="kicker">{t('kicker')}</p>
        <h1>{t('title')}</h1>
        <p className="lede">{t('sub')}</p>
      </div>

      <div className="pills" role="group" aria-label={tc('filter')}>
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
            {t(CAT_KEY[id])} ({id === 'all' ? rows.length : filterByCategory(rows, id).length})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="state-note">{t('empty')}</p>
      ) : (
        <>
          <div className="products">
            {shown.map((row) => {
              const photo = firstImage(row);
              const price = rowPrice(row);
              return (
                <div className="card product product--rich" key={row.id} data-cat={categoryFromRow(row)}>
                  <a className="product-photo product-open" href={`/products/${row.id}`} aria-label={`${t('details')}: ${row.name}`}>
                    <span className="badge" lang="th">{t(CAT_KEY[categoryFromRow(row)])}</span>
                    {photo ? (
                      photo.startsWith('http') ? (
                        <img className="kit-photo" src={photo} alt={row.name} width={800} height={800} loading="lazy" />
                      ) : (
                        <Image className="kit-photo" src={photo} alt={row.name} width={800} height={800} sizes="(min-width: 1100px) 282px, (min-width: 760px) 45vw, 92vw" />
                      )
                    ) : null}
                  </a>
                  <div className="product-body">
                    <h3>
                      <a className="product-name" href={`/products/${row.id}`}>
                        <span lang="th">{row.name}</span>
                      </a>
                    </h3>
                    {row.model ? <p className="kit-sub" lang="th">{row.model}</p> : null}
                    <div className="product-price-row">
                      <div>
                        <span className="lbl">{t('fullPrice')}</span>
                        <span className="full-price">{price == null ? t('priceAsk') : money(price)}</span>
                      </div>
                    </div>
                    <a className="btn btn--primary btn--sm btn--block" href="#contact">{t('getQuote')} →</a>
                  </div>
                </div>
              );
            })}
          </div>
          {!showAll && visible.length > 12 ? (
            <div className="more-row">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowAll(true)}>
                {t('showMore')} ({visible.length - 12})
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
