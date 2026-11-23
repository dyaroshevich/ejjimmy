import { NextResponse, type NextRequest } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { requirePartner } from '@/lib/admin-auth';
import { leadSubmitRatelimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';

export const dynamic = 'force-dynamic';

function siteUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
}

// GET /api/partner/referrals — my referrals + my invite link.
// Admins: ?code= to inspect any partner board.
export const GET = requirePartner(async (req: NextRequest, auth) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let key = auth.partnerCode || auth.userId!;
  let invite_link = auth.partnerCode ? `${siteUrl(req)}/ref/${auth.partnerCode}` : null;
  const code = new URL(req.url).searchParams.get('code');
  if (code && (auth.role === 'admin' || auth.role === 'super_admin')) {
    key = code;
    invite_link = `${siteUrl(req)}/ref/${code}`;
  }
  const { data, error } = await supabase
    .from('referrals')
    .select('id, referrer_type, referee_line_id, status, reward_type, reward_amount, paid_at, created_at')
    .eq('referrer_id', key)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ referrals: data, invite_link });
});

// POST /api/partner/referrals — invite a customer (name + phone or LINE id)
export const POST = requirePartner(async (req: NextRequest, auth) => {
  const ip = clientIp(req.headers);
  const { success } = await leadSubmitRatelimit.limit(`ref:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 100);
  const phone = String(body.phone || '').trim();
  const line_id = String(body.line_id || '').trim() || null;
  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone required' }, { status: 400 });
  }
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: 'bad phone' }, { status: 400 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_type: 'partner',
      referrer_id: auth.partnerCode || auth.userId!,
      referee_line_id: line_id,
      status: 'pending',
    })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
});
