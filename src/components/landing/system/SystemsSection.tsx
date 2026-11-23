import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase-server';
import { getSolarProducts } from '@/lib/solar/db';
import { selectLocaleRows } from '@/lib/locale-rows';
import { toSystemCard } from './systemCard';
import SystemsGrid from './SystemsGrid';
import SystemAssemblyIllustration from './SystemAssemblyIllustration';

const bySize = (a: { power_kw?: number; price_thb?: number }, b: { power_kw?: number; price_thb?: number }) =>
  (a.power_kw ?? 0) - (b.power_kw ?? 0) || (a.price_thb ?? 0) - (b.price_thb ?? 0);

/** Systems first by kW, then the parts shelf by price — the pills filter either way. */
const byGroup = (a: { type: string; power_kw?: number; price_thb?: number }, b: { type: string; power_kw?: number; price_thb?: number }) => {
  const group = (r: typeof a) => (r.type === 'system' ? 0 : 1);
  return group(a) - group(b) || (a.type === 'system'
    ? bySize(a, b)
    : (a.price_thb ?? 0) - (b.price_thb ?? 0));
};

async function SystemsFromDatabase() {
  try {
    const { data } = await getSolarProducts({ limit: 100, supabase: createClient() });
    const rows = selectLocaleRows(data, await getLocale()).sort(byGroup);
    return <SystemsGrid cards={rows.map(toSystemCard)} failed={false} />;
  } catch {
    return <SystemsGrid cards={[]} failed />;
  }
}

function SystemsLoading() {
  return (
    <div className="products" aria-busy="true">
      {[0, 1, 2, 3].map((i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}

export default function SystemsSection() {
  // `block block--alt`, not the legacy `section section--alt`: the tinted bands of the approved
  // sheet bleed to both viewport edges and re-add the gutter as their own padding (globals.css
  // `section.block--alt, section.block--cream`), which is why `#systems` has no `.wrap` here and
  // why it was the one band missing `scroll-margin-top: 84px` — the anchor landed under the header.
  return (
    <section className="block block--alt relative" id="systems" data-od-id="uni-systems">
      {/* Right-side assembly illustration — full height, behind content */}
      <div className="absolute inset-0 -z-10 hidden lg:block w-1/2 right-0">
        <SystemAssemblyIllustration
          imageSrc="/images/system-assembly.jpg"
          alt="Solar system assembly — brick by brick like a bagger"
        />
      </div>

      <Suspense fallback={<SystemsLoading />}>
        <SystemsFromDatabase />
      </Suspense>
    </section>
  );
}
