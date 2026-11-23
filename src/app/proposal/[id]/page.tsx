import { Suspense } from 'react';
import ProposalDashboard from './ProposalDashboard';
import { decodeId } from '@/lib/hashid';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { brand, siteUrl } from '@/lib/site.config';

// Kept in front of `siteUrl` because this route has always honoured its own variable; the fallback is
// the shared origin instead of a second copy of the domain.
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || siteUrl;
const PROPOSAL_TITLE = `${brand.nameTh} | ${brand.name} - โซลาร์เซลล์กระบี่`;

const defaultMetadata = {
  title: PROPOSAL_TITLE,
  description: 'ประเมินการประหยัดไฟฟรีด้วย AI พร้อมใบเสนอราคาโซลาร์เซลล์คุณภาพสูง',
  openGraph: {
    title: PROPOSAL_TITLE,
    description: 'ประเมินการประหยัดไฟฟรีด้วย AI พร้อมใบเสนอราคาโซลาร์เซลล์คุณภาพสูง',
    images: [{ url: `${SITE_URL}/og/default.png` }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: PROPOSAL_TITLE,
    description: 'ประเมินการประหยัดไฟฟรีด้วย AI พร้อมใบเสนอราคาโซลาร์เซลล์คุณภาพสูง',
    images: [{ url: `${SITE_URL}/og/default.png` }],
  },
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const leadId = decodeId(params.id);
    if (!leadId) return defaultMetadata;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data: lead, error } = await supabase
      .from('leads')
      .select('name, location, system_size, title, description, og_image_url')
      .eq('id', leadId)
      .single();

    if (error || !lead) return defaultMetadata;

    const title = lead.title || `ข้อเสนอโซลาร์เซลล์สำหรับ ${lead.name || 'ลูกค้า'}`;
    const description = lead.description || `ประเมินการประหยัดไฟฟรีสำหรับ ${lead.location || 'กระบี่'} ระบบ ${lead.system_size || ''} kW`;

    const imageUrl = lead.og_image_url
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${lead.og_image_url}`
      : `${SITE_URL}/og/default.png`;

    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: imageUrl }], siteName: brand.nameTh, locale: 'th_TH', type: 'website' },
      twitter: { card: 'summary_large_image' as const, title, description, images: [{ url: imageUrl }] },
    };
  } catch (err) {
    console.error('Failed to generate proposal metadata:', err);
    return defaultMetadata;
  }
}

export default async function ProposalPage({ params }: { params: { id: string } }) {
  const leadId = decodeId(params.id);
  let leadData: any = null;

  if (leadId) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
      leadData = data;
    } catch {}
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <ProposalDashboard initialLead={leadData} />
    </Suspense>
  );
}
