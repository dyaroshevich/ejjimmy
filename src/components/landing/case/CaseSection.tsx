import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase-server';
import { selectLocaleRows } from '@/lib/locale-rows';

interface SolarCase {
  slug: string;
  customer_name: string | null;
  location_name: string | null;
  system_kw: number | null;
  savings_annual_thb: number | null;
  case_description: string | null;
  media_assets: { cover?: string } | null;
  metadata: { total_investment?: number; mounting_time?: string } | null;
  locale?: string | null;
}

const CARDS = 2;

function coverUrl(caseRow: SolarCase): string | null {
  const cover = caseRow.media_assets?.cover;
  if (!cover) return null;
  return cover.startsWith('http') ? cover : `/images/${cover}`;
}

export default async function CaseSection() {
  const t = await getTranslations('cases');
  const tl = await getTranslations('casesList');
  const locale = await getLocale();
  let rows: SolarCase[] = [];
  let failed = false;

  try {
    const { data, error } = await createClient()
      .from('solar_cases')
      .select('slug,customer_name,location_name,system_kw,savings_annual_thb,case_description,media_assets,metadata,locale')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(CARDS * 2);
    if (error) throw error;
    rows = selectLocaleRows((data ?? []) as SolarCase[], locale).slice(0, CARDS);
  } catch {
    failed = true;
  }

  const money = (n: number) => `฿${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)}`;

  return (
    <section className="block" id="cases">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('badge')}</p>
          <h2>
            <span>{t('titleA')}</span><span className="grad">{t('titleB')}</span>
          </h2>
        </div>

        {failed ? (
          <p className="state-note">{t('loadError')}</p>
        ) : rows.length === 0 ? (
          <p className="state-note">{tl('empty')}</p>
        ) : (
          <div className="grid2">
            {rows.map((c) => {
              const img = coverUrl(c);
              const meta = c.metadata ?? {};
              return (
                <article className="card case-card" key={c.slug}>
                  {img ? (
                    img.startsWith('/') ? (
                      <Image
                        className="case-img"
                        src={img}
                        alt={c.customer_name ?? ''}
                        width={960}
                        height={600}
                        sizes="(max-width: 767px) 100vw, 46vw"
                      />
                    ) : (
                      <img className="case-img" src={img} alt={c.customer_name ?? ''} width={600} height={375} loading="lazy" />
                    )
                  ) : null}
                  <h3>{c.customer_name}</h3>
                  {c.case_description ? <p>{c.case_description}</p> : null}
                  <div className="case-stats">
                    <div>
                      <span>{t('location')}</span>
                      <strong className="case-val">{c.location_name ? `⌖ ${c.location_name}` : '—'}</strong>
                    </div>
                    <div>
                      <span>{t('systemSize')}</span>
                      <strong className="case-val">{c.system_kw != null ? `${c.system_kw} kW` : '—'}</strong>
                    </div>
                    <div>
                      <span>{t('investment')}</span>
                      <strong className="case-val">{meta.total_investment != null ? money(meta.total_investment) : '—'}</strong>
                    </div>
                    <div>
                      <span>{t('mounting')}</span>
                      <strong className="case-val">{meta.mounting_time ?? t('mountingDefault')}</strong>
                    </div>
                  </div>
                  <Link href={`/cases/${c.slug}`} className="btn btn--secondary btn--sm case-cta">
                    {tl('view')}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
