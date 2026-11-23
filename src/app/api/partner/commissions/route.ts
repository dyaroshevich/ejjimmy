import { NextResponse, type NextRequest } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { requirePartner } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET /api/partner/commissions — expected vs paid totals + history.
// Admins: ?code= to inspect any partner board.
export const GET = requirePartner(async (req: NextRequest, auth) => {
  let partnerId = auth.partnerId;
  const code = new URL(req.url).searchParams.get('code');
  if (code && (auth.role === 'admin' || auth.role === 'super_admin')) {
    const supabase0 = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: p } = await supabase0.from('partners').select('id').eq('code', code).limit(1).single();
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    partnerId = p.id;
  }
  if (!partnerId) {
    return NextResponse.json({ expected: 0, paid: 0, rows: [] });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('partner_leads')
    .select('id, status, commission_amount, paid_at, created_at, leads(id, name)')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = data || [];
  const expected = rows
    .filter((r: any) => r.status === 'closed')
    .reduce((s: number, r: any) => s + (Number(r.commission_amount) || 0), 0);
  const paid = rows
    .filter((r: any) => r.paid_at)
    .reduce((s: number, r: any) => s + (Number(r.commission_amount) || 0), 0);
  return NextResponse.json({ expected, paid, rows });
});
