import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { siteUrl } from '@/lib/site.config';

export const dynamic = 'force-dynamic';

// GET /api/ref/[code] — partner referral link entry.
// Validates active partner, stores code in sb_ref cookie (30d), redirects home.
export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const code = String(params.code || '').trim().toLowerCase();
  if (!/^[a-z0-9-]{2,40}$/.test(code)) {
    return NextResponse.redirect(new URL('/', siteUrl));
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('no db');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('code', code)
      .eq('status', 'active')
      .limit(1)
      .single();

    const res = NextResponse.redirect(new URL('/', siteUrl));
    if (partner) {
      res.cookies.set('sb_ref', code, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
      });
    }
    return res;
  } catch {
    return NextResponse.redirect(new URL('/', siteUrl));
  }
}
