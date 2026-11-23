import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

// The approved mock hotlinks these from prod; the repo already ships local copies.
const BRANDS = [
  { name: 'JinkoSolar', logo: '/content/brands/jinko-solar.webp' },
  { name: 'HUAWEI', logo: '/content/brands/huawei.webp' },
  { name: 'GoodWe', logo: '/content/brands/goodwe.webp' },
  { name: 'Sigenergy', logo: '/content/brands/sigenergy.webp' },
  { name: 'SolarEdge', logo: '/content/brands/solaredge.webp' },
];

export default async function PartnersSection() {
  const t = await getTranslations('partners');
  return (
    <section className="block" data-od-id="uni-trust" aria-labelledby="partnersTitle">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('kicker')}</p>
          <h2 id="partnersTitle">
            <span>{t('titleA')} </span>
            <span className="grad">{t('titleB')}</span>
          </h2>
        </div>
        {/* Approved mobile form is a horizontal snap carousel; Chrome never lazy-loads
            what sits outside the scroll offset, so these stay eager (5 x ~5 KB). */}
        <div className="brands">
          {BRANDS.map((b) => (
            <span className="badge brand-logo" key={b.name}>
              <Image src={b.logo} alt="" width={96} height={28} sizes="110px" loading="eager" />
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
