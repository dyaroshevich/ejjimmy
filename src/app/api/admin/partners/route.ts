import { NextResponse, type NextRequest } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const CODE_RE = /^[a-z0-9-]{2,40}$/;

// GET /api/admin/partners — list partners (admin only)
export const GET = requireAdmin(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('partners')
    .select('id, code, company_name, contact_name, status, commission_rate, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partners: data });
});

// POST /api/admin/partners — create partner (admin only)
export const POST = requireAdmin(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || '').trim().toLowerCase();
  const company_name = String(body.company_name || '').trim();
  if (!CODE_RE.test(code) || !company_name) {
    return NextResponse.json({ error: 'code [a-z0-9-, 2-40 chars] and company_name required' }, { status: 400 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('partners')
    .insert({
      code,
      company_name,
      contact_name: body.contact_name || null,
      contact_phone: body.contact_phone || null,
      contact_email: body.contact_email || null,
      regions: Array.isArray(body.regions) ? body.regions : [],
      status: body.status === 'active' ? 'active' : 'pending',
      commission_rate: Number(body.commission_rate) || 0.05,
    })
    .select('id, code, company_name, status')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partner: data });
});
