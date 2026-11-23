import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

/**
 * Legacy no-args admin check using cookies() from next/headers.
 * Used by existing routes (pipeline, research).
 */
export async function isAdminAuthorized(): Promise<boolean> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.role;
    return role === 'admin' || role === 'super_admin';
  } catch {
    return false;
  }
}

export interface AdminAuthResult {
  authorized: boolean;
  response?: NextResponse;
  userId?: string;
  role?: string;
}

/**
 * Check admin authorization for API routes.
 * Returns { authorized: true } if admin, or { authorized: false, response } with redirect/error.
 */
export async function checkAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Service unavailable' }, { status: 503 }),
    };
  }

  const res = NextResponse.next();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options });
      },
    },
  });

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const role = user.app_metadata?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      };
    }

    return { authorized: true, userId: user.id, role };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Auth check failed' }, { status: 500 }),
    };
  }
}

/**
 * Wrapper for admin route handlers that requires authentication.
 * Usage: export const POST = requireAdmin(async (req) => { ... });
 */
export function requireAdmin(
  handler: (req: NextRequest, auth: AdminAuthResult) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const auth = await checkAdminAuth(req);
    if (!auth.authorized) {
      return auth.response!;
    }
    return handler(req, auth);
  };
}

export interface PartnerAuthResult {
  authorized: boolean;
  response?: NextResponse;
  userId?: string;
  role?: string;
  partnerId?: string;
  partnerCode?: string;
}

/**
 * Check partner authorization for /api/partner routes.
 * Admins pass through (partnerId resolved when possible).
 * Partners resolve their own partner row via partners.user_id.
 */
export async function checkPartnerAuth(req: NextRequest): Promise<PartnerAuthResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Service unavailable' }, { status: 503 }),
    };
  }

  const res = NextResponse.next();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options });
      },
    },
  });

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const role = user.app_metadata?.role;
    if (role !== 'partner' && role !== 'admin' && role !== 'super_admin') {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      };
    }

    // Resolve partner row (service key, RLS tables are locked down)
    const { createClient } = await import('@supabase/supabase-js');
    const { SUPABASE_SERVICE_ROLE_KEY } = await import('./supabase');
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: partner } = await admin
      .from('partners')
      .select('id, code')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (role === 'partner' && !partner) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'No partner profile' }, { status: 403 }),
      };
    }

    return { authorized: true, userId: user.id, role, partnerId: partner?.id, partnerCode: partner?.code };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Auth check failed' }, { status: 500 }),
    };
  }
}

/**
 * Wrapper for partner route handlers.
 * Usage: export const GET = requirePartner(async (req, auth) => { ... });
 */
export function requirePartner(
  handler: (req: NextRequest, auth: PartnerAuthResult) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const auth = await checkPartnerAuth(req);
    if (!auth.authorized) {
      return auth.response!;
    }
    return handler(req, auth);
  };
}

/**
 * The signed-in user's staff role, or null.
 *
 * The admin menu needs the role to decide whether to draw the Super link; the route and its API are
 * guarded separately, so this is presentation, not authorisation.
 */
export async function getStaffRole(): Promise<string | null> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    return (user?.app_metadata?.role as string) ?? null;
  } catch {
    return null;
  }
}
