import { NextResponse, type NextRequest } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { requirePartner } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET /api/partner/me — own partner profile.
// Admins: ?code= to inspect any partner board.
export const GET = requirePartner(async (req: NextRequest, auth) => {
  const code = new URL(req.url).searchParams.get('code');
  if (code && (auth.role === 'admin' || auth.role === 'super_admin')) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from('partners')
      .select('id, code, company_name, contact_name, status, commission_rate, regions, created_at')
      .eq('code', code)
      .limit(1)
      .single();
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ partner: data, viewing_as_admin: true });
  }
  // Admins without a partner row get a hint, not an error
  if (!auth.partnerId) {
    return NextResponse.json({ partner: null, role: auth.role });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('partners')
    .select('id, code, company_name, contact_name, status, commission_rate, regions, created_at')
    .eq('id', auth.partnerId)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partner: data });
});