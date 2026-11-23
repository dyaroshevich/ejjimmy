import { getTranslations } from 'next-intl/server';

const ICONS = [
  <>
    <path key="a" d="M3 10l9-6 9 6" />
    <path key="b" d="M5 9.5V20h14V9.5" />
  </>,
  <path key="2" d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />,
  <>
    <circle key="c" cx="12" cy="8" r="3.5" />
    <path key="p" d="M5 20c.8-3.5 3.4-5 7-5s6.2 1.5 7 5" />
  </>,
];

export default async function StepSection() {
  const t = await getTranslations('steps');

  return (
    <section className="block" id="steps">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('badge')}</p>
          <h2>
            {t('titleA')} <span className="grad">{t('titleB')}</span>
          </h2>
        </div>
        <div className="grid3">
          {ICONS.map((icon, i) => (
            <div key={i} className="card step">
              <div className="step-top">
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <span className="step-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {icon}
                  </svg>
                </span>
              </div>
              <h3>{t(`s${i + 1}t`)}</h3>
              <p>{t(`s${i + 1}d`)}</p>
            </div>
          ))}
        </div>
        <div className="cta-row">
          <a href="#contact" className="btn btn--secondary">{t('cta')}</a>
        </div>
      </div>
    </section>
  );
}
