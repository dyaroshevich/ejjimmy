import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/canonical';
import { sites } from '@/lib/site.config';
import LeadMagnetForm from '@/components/catalog/LeadMagnetForm';

interface ContentKey {
  id: number;
  key: string;
  value: any;
  locale: string;
}

const loadMagnet = async (id: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('ejjimmy_content_keys')
    .select('*')
    .eq('key', `lead_magnet_${id}`)
    .eq('locale', 'th')
    .eq('site_id', 'ejjimmy')
    .single();
  return data as ContentKey | null;
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const contentKey = await loadMagnet(params.id);

  if (!contentKey) {
    return { title: 'เอกสาร | Ejjimmy Solar' };
  }

  const data = contentKey.value as any;
  const title = data.marketing_title_th || data.title_th || 'เอกสาร';
  const isTripwire = data.is_tripwire;
  const price = data.tripwire_price_thb;

  return {
    title: isTripwire && price ? `${title} — ${price}฿` : title,
    description: data.notes || data.format || '',
    alternates: {
      canonical: canonicalUrl(sites.ejjimmy, `/lead-magnets/${params.id}`),
    },
  };
}

export default async function LeadMagnetPage({ params }: { params: { id: string } }) {
  const contentKey = await loadMagnet(params.id);

  if (!contentKey) {
    notFound();
  }

  const t = await getTranslations('magnet');
  const data = contentKey.value as any;
  const isTripwire = data.is_tripwire === true;
  const price = data.tripwire_price_thb ?? null;
  const marketingTitle = data.marketing_title_th || data.title_th || 'เอกสาร';
  const key = `lead_magnet_${params.id}`;

  const rows: Array<[string, unknown]> = [
    [t('format'), data.format],
    [t('pages'), data.pages],
    [t('languages'), data.languages],
    [t('dataNeeded'), data.data_needed],
  ];

  return (
    <section className="block block--cream" id="lead-magnet">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{isTripwire ? t('paid') : t('free')}</p>
          <h1 lang="th">{marketingTitle}</h1>
        </div>

        <div className="grid2">
          <div className="card">
            <h3>{t('benefits')}</h3>
            <p className="text-lg text-muted" lang="th">
              {data.notes || data.format || ''}
            </p>

            <div className="mt-6 space-y-3">
              {rows
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div className="flex items-start gap-2" key={label}>
                    <span className="text-orange-500">✓</span>
                    <span>
                      {label}: <span lang="th">{String(value)}</span>
                    </span>
                  </div>
                ))}
            </div>

            {data.trigger && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-medium text-orange-800" lang="th">
                  <span className="font-bold">{t('why')}:</span> {data.trigger}
                </p>
              </div>
            )}
          </div>

          <div className="card pick">
            <div className="pick-head">
              <h3>{isTripwire ? t('buy') : t('getFree')}</h3>
              <p className="pick-sub">
                {isTripwire && price
                  ? t('priceNote', { price: Number(price).toLocaleString('th-TH') })
                  : t('freeNote')}
              </p>
            </div>

            <LeadMagnetForm
              magnetKey={key}
              marketingTitle={marketingTitle}
              isTripwire={isTripwire}
              price={price}
            />

            {isTripwire && price && (
              <p className="text-xs text-muted text-center mt-2">{t('credit')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
