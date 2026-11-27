import { createClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import CatalogGrid from '@/components/catalog/CatalogGrid';
import { canonicalUrl } from '@/lib/canonical';
import { sites } from '@/lib/site.config';
import type { ImportedRow } from '@/lib/catalog';

export async function generateMetadata() {
  const t = await getTranslations('products');
  const url = canonicalUrl(sites.ejjimmy, '/catalog');
  return {
    title: `${t('title')} | Ejjimmy Solar`,
    description: t('sub'),
    alternates: { canonical: url },
  };
}

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('ejjimmy_solar_products')
    .select('*')
    .eq('site_id', 'ejjimmy')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return (
    <section className="block" id="catalog">
      <div className="wrap">
        <CatalogGrid rows={(products || []) as ImportedRow[]} />
      </div>
    </section>
  );
}
