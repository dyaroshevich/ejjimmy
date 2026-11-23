import { NextResponse, type NextRequest } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { requirePartner } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const FLOW = ['referred', 'qualified', 'surveyed', 'closed', 'lost'] as const;

// PATCH /api/partner/leads/[id] — move own lead in pipeline.
// Admins: ?code= to act on any partner board.
// On close: accrue partner commission (5% of latest proposal total, else 0)
// and close matching referrals with rewards (customer 3000 / affiliate 1500).
export const PATCH = requirePartner(async (req: NextRequest, auth) => {
  let partnerId = auth.partnerId;
  const code = new URL(req.url).searchParams.get('code');
  if (code && (auth.role === 'admin' || auth.role === 'super_admin')) {
    const supabase0 = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: p } = await supabase0.from('partners').select('id').eq('code', code).limit(1).single();
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    partnerId = p.id;
  }
  if (!partnerId) {
    return NextResponse.json({ error: 'No partner profile' }, { status: 403 });
  }
  const id = req.nextUrl.pathname.split('/').pop();
  const body = await req.json().catch(() => ({}));
  const status = String(body.status || '');
  if (!FLOW.includes(status as any)) {
    return NextResponse.json({ error: 'status must be one of ' + FLOW.join(',') }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: row, error: ownErr } = await supabase
    .from('partner_leads')
    .select('id, lead_id')
    .eq('id', id)
    .eq('partner_id', partnerId)
    .single();
  if (ownErr || !row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error: updErr } = await supabase
    .from('partner_leads')
    .update({ status })
    .eq('id', id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  let commission_amount: number | null = null;
  if (status === 'closed') {
    const { data: partner } = await supabase
      .from('partners')
      .select('commission_rate')
      .eq('id', partnerId)
      .single();
    const { data: snap } = await supabase
      .from('proposal_snapshots')
      .select('total_cost')
      .eq('lead_id', row.lead_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    const total = Number(snap?.total_cost) || 0;
    commission_amount = Math.round(total * Number(partner?.commission_rate ?? 0.05));
    await supabase.from('partner_leads').update({ commission_amount }).eq('id', id);

    // Close matching referrals + fixed rewards (test amounts)
    const { data: lead } = await supabase
      .from('leads')
      .select('line_id')
      .eq('id', row.lead_id)
      .single();
    if (lead?.line_id) {
      const { data: refs } = await supabase
        .from('referrals')
        .select('id, referrer_type')
        .eq('referee_line_id', lead.line_id)
        .in('status', ['pending', 'qualified']);
      for (const r of refs || []) {
        const reward = r.referrer_type === 'affiliate' ? 1500 : r.referrer_type === 'customer' ? 3000 : 0;
        await supabase
          .from('referrals')
          .update({
            status: 'closed',
            reward_type: reward > 0 ? 'cash' : null,
            reward_amount: reward > 0 ? reward : null,
          })
          .eq('id', r.id);
      }
    }
  }

  return NextResponse.json({ ok: true, status, commission_amount });
});
