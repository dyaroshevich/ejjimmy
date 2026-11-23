import { getTranslations } from 'next-intl/server';
import Segments from '@/components/segments/Segments';

export const dynamic = 'force-dynamic';

export default async function SegmentsPage() {
  const t = await getTranslations('segments');

  return (
    <main
      className="min-h-screen bg-white dark:bg-slate-950 px-4"
      style={{
        fontFamily: 'var(--font-text), var(--font-thai), system-ui, sans-serif',
      }}
    >
      <Segments />
    </main>
  );
}
