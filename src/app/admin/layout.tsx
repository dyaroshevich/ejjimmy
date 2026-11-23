import type { Metadata } from 'next';
import AdminClientLayout from './AdminClientLayout';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { getLocale } from 'next-intl/server';
import thMessages from '../../../messages/th.json';
import enMessages from '../../../messages/en.json';
import { resolveBrandCopy } from '@/lib/brand-copy';
import { getSite } from '@/lib/site-server';
import { getStaffRole } from '@/lib/admin-auth';
import { adminAllows } from '@/lib/admin-nav';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export function generateMetadata(): Metadata {
  const { brand } = getSite();
  return {
    title: `Admin Dashboard - ${brand.name}`,
    description: `Manage leads, products, and analytics for ${brand.name}.`,
    robots: 'noindex, nofollow',
    manifest: '/admin-manifest.webmanifest',
  };
}

// Admin runs Thai/English only: clamp any other request locale to Thai.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const site = getSite();
  const role = await getStaffRole();
  // The route is guarded, not just the link: `site.admin.items` used to draw the menu while every admin
  // page stayed one URL away (`src/lib/admin-nav.ts`). A trimmed template means the page is not there.
  if (!adminAllows(site, headers().get('x-pathname') || '/admin', role)) notFound();
  const adminLocale = locale === 'en' ? 'en' : 'th';
  // Admin reads the two locale files directly instead of the request config, so the copy pack's
  // `{brand}` / `{city}` placeholders have to be filled here as well.
  const raw = adminLocale === 'en' ? enMessages : thMessages;
  const messages = resolveBrandCopy(raw, adminLocale, site) as unknown as AbstractIntlMessages;
  return (
    <NextIntlClientProvider locale={adminLocale} messages={messages}>
      <AdminClientLayout role={role}>{children}</AdminClientLayout>
    </NextIntlClientProvider>
  );
}
