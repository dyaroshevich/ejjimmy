import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

const FIVE = ['five1', 'five2', 'five3', 'five4', 'five5'];

export default async function SigenSection() {
  const t = await getTranslations('sigenergy');

  return (
    <section className="block" id="sigen">
      <div className="wrap">
        <div className="sigen">
          <div className="sigen-grid">
            <div>
              <p className="kicker">{t('badge')}</p>
              <h2>
                {/* The second line is copy, not a name: the brand is `SigenStor`, and Thai is the face of the
                   page (globals.css "titleC" note). Latin locales keep the approved sheet's `5-in-One.` verbatim. */}
                SigenStor <span className="grad">{t('titleC')}</span>
              </h2>
              <p className="lede">{t('titleB')}</p>

              <ul className="five">
                {FIVE.map((key, n) => (
                  <li key={key}>
                    <b>{String(n + 1).padStart(2, '0')}</b>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>

              <a className="btn btn--primary" href="#contact">
                {t('cta')}
              </a>

              <div className="sigen-metrics">
                <div><b>&lt;10ms</b><span>{t('m1label')}</span></div>
                <div><b>98.4%</b><span>{t('m2label')}</span></div>
                <div><b>{t('m3value')}</b><span>{t('m3label')}</span></div>
                <div><b>AI-Ready</b><span>{t('m4label')}</span></div>
              </div>
            </div>

            <div className="sigen-media">
              <Image
                className="sigen-img"
                src="/images/sigenstor-5in1.jpg"
                alt={t('imgAlt')}
                width={600}
                height={920}
                sizes="(min-width: 960px) 592px, 73vw"
              />
              <div className="hotspot" style={{ top: '18%', left: '6%' }}><i></i><span>{t('hotInverter')}</span></div>
              <div className="hotspot" style={{ top: '48%', right: '4%' }}><i></i><span>{t('hotBattery')}</span></div>
              <div className="hotspot" style={{ bottom: '14%', left: '8%' }}><i></i><span>{t('hotEv')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
