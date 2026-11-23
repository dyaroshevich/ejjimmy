import { getTranslations } from 'next-intl/server';

const ICONS: Record<string, React.ReactNode> = {
  ask: <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />,
  compare: (
    <>
      <path d="M12 3v18" />
      <path d="M5 7l7-4 7 4" />
      <path d="M5 7v4a7 7 0 0 0 14 0V7" />
      <path d="M5 12h14" />
    </>
  ),
  estimate: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <path d="M8.5 6.5h7" />
      <path d="M8.5 11h7" />
      <path d="M8.5 14.5h4" />
      <circle cx="15.5" cy="17.5" r="2.2" />
      <path d="M15.5 16v1.2l.8.8" />
    </>
  ),
  engineer: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z" />,
};

const CARDS = ['ask', 'compare', 'estimate', 'engineer'] as const;

export default async function ServicesSection() {
  const t = await getTranslations('services');
  return (
    <section className="block" id="features" data-od-id="uni-features" aria-labelledby="servicesTitle">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('kicker')}</p>
          <h2 id="servicesTitle">
            <span>{t('titleA')} </span>
            <span className="grad">{t('titleB')}</span>
          </h2>
        </div>
        <div className="grid4">
          {CARDS.map((id) => (
            <div className="card feat" data-od-id={`uni-feat-${id}`} key={id}>
              <span className="feat-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[id]}
                </svg>
              </span>
              <h3>{t(`${id}Title`)}</h3>
              <p>{t(`${id}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
