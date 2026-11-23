import { redirect } from 'next/navigation';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

export default async function ProposalViewPage({ params }: { params: { id: string } }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-600">ระบบยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง</p>
          <a href="/" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: lead, error } = await supabase
    .from('leads')
    .select('proposal_url')
    .eq('id', params.id)
    .single();

  if (error || !lead?.proposal_url || lead.proposal_url === '__generating__') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">เอกสารยังไม่พร้อมใช้งาน</h1>
          <p className="text-slate-600">ขออภัย กำลังเตรียมเอกสาร หรือลิงก์อาจไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่</p>
          <a href="/" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  redirect(lead.proposal_url);
}
