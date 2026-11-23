import { NextResponse, type NextRequest } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// POST /api/admin/payouts — mark partner commission or referral reward as paid (admin only)
// body: { kind: 'partner_lead' | 'referral', id: string }
export const POST = requireAdmin(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { kind, id } = body as { kind?: string; id?: string };
  if ((kind !== 'partner_lead' && kind !== 'referral') || !id) {
    return NextResponse.json({ error: 'kind (partner_lead|referral) and id required' }, { status: 400 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const table = kind === 'partner_lead' ? 'partner_leads' : 'referrals';
  const { data, error } = await supabase
    .from(table)
    .update({ paid_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, paid_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, paid: data });
});
