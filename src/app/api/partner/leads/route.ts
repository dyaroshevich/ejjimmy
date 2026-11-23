import { NextResponse, type NextRequest } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { requirePartner } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET /api/partner/leads — own leads with pipeline status.
// Admins: ?code= to inspect any partner board.
export const GET = requirePartner(async (req: NextRequest, auth) => {
  let partnerId = auth.partnerId;
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (code && (auth.role === 'admin' || auth.role === 'super_admin')) {
    const supabase0 = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: p } = await supabase0.from('partners').select('id').eq('code', code).limit(1).single();
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    partnerId = p.id;
  }
  if (!partnerId) {
    return NextResponse.json({ leads: [] });
  }
  const status = url.searchParams.get('status');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let q = supabase
    .from('partner_leads')
    .select('id, status, commission_amount, paid_at, created_at, leads(id, name, phone, location, system_size, status, created_at)')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
});
