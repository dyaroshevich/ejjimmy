'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const QuizTab = dynamic(() => import('@/components/admin/super/QuizTab').then(m => m.QuizTab), { ssr: false });

const TabFallback = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="animate-spin text-orange-600" size={32} />
  </div>
);

export default function ContentBriefPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Suspense fallback={<TabFallback />}>
        <QuizTab />
      </Suspense>
    </div>
  );
}
