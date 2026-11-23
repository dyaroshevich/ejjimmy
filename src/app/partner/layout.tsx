import type { Metadata } from 'next';
import PartnerNav from './PartnerNav';
import { brand } from '@/lib/site.config';

export const metadata: Metadata = {
  title: `Partner Dashboard - ${brand.name}`,
  robots: 'noindex, nofollow',
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PartnerNav />
      <main className="max-w-7xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
