import { getTranslations } from 'next-intl/server';

const ICONS = {
  home: (
    <>
      <path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22v-8h6v8" />
    </>
  ),
  biz: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h.01" />
      <path d="M15 7h.01" />
      <path d="M9 11h.01" />
      <path d="M15 11h.01" />
      <path d="M10 21v-3h4v3" />
    </>
  ),
};

export default async function Segments() {
  const t = await getTranslations('segments');

  const cards = [
    {
      key: 'home',
      cls: 'card pick',
      icon: ICONS.home,
      title: t('homeTitle'),
      sub: t('homeTag'),
      desc: t('homeDesc'),
      features: [t('homeF1'), t('homeF2')],
      ctas: [{ label: t('homeCta1'), primary: true }, { label: t('homeCta2'), primary: false }],
    },
    {
      key: 'biz',
      cls: 'card pick pick--biz',
      icon: ICONS.biz,
      title: t('bizTitle'),
      sub: t('bizTag'),
      desc: t('bizDesc'),
      features: [t('bizF1'), t('bizF2')],
      ctas: [{ label: t('bizCta1'), primary: false }, { label: t('bizCta2'), primary: true }],
    },
  ];

  return (
    <section className="block" id="segments">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('badge')}</p>
          <h2>
            <span>{t('titleA')}</span><span className="grad">{t('titleB')}</span>
          </h2>
        </div>
        <div className="grid2">
          {cards.map((c) => (
            <div key={c.key} className={c.cls}>
              <div className="pick-head">
                <span className="pick-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {c.icon}
                  </svg>
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <p className="pick-sub">{c.sub}</p>
                </div>
              </div>
              <p className="pick-desc">{c.desc}</p>
              <ul>
                {c.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="pick-ctas">
                {c.ctas.map((cta) => (
                  <a key={cta.label} href="#contact" className={cta.primary ? 'btn btn--primary' : 'btn btn--secondary'}>
                    {cta.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
