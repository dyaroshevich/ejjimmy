import { redirect, notFound } from 'next/navigation';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

export default async function ShortLinkViewPage({ params }: { params: { code: string } }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    notFound();
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: link, error } = await supabase
    .from('proposal_links')
    .select('pdf_url, expires_at')
    .eq('short_code', params.code)
    .single();

  if (error || !link) {
    notFound();
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">ลิงก์หมดอายุแล้ว</h1>
          <p className="text-slate-600">ขออภัย ลิงก์สำหรับเข้าชมเอกสารนี้หมดอายุแล้ว กรุณาขอลิงก์ใหม่จากเจ้าหน้าที่</p>
          <a href="/" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  redirect(link.pdf_url);
}
