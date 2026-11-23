import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';
// План «Б»: серверный клиент тоже привязывается к SUPABASE_SCHEMA (если она задана).
import { SUPABASE_SCHEMA, createScopedClient as scopedClient } from './supabase';
import { requestSiteId, tenantClient } from './tenant-server';

export const createClient = () => {
  const cookieStore = cookies();

  // Every server read goes through here, so the storefront's rows are the only ones it can see: the
  // admin pages of a franchisee used to list everyone's leads (ROADMAP C2).
  return tenantClient(
    createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        db: SUPABASE_SCHEMA ? { schema: SUPABASE_SCHEMA } : undefined,
        // The storefront is announced to PostgREST as well: the RLS policies and the two RAG functions read
        // `x-site`, and an anon request has no JWT claim to fall back on.
        global: { headers: { 'x-site': requestSiteId() } },
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  );
};

/**
 * A one-off client for a route handler or a script, scoped like the one above.
 *
 * It lives here rather than in `@/lib/supabase` because `next/headers` must not reach the browser
 * bundle — `@/lib/supabase` is imported by client components for the anon client.
 */
export const createScopedClient = (
  url: string,
  key: string,
  options?: Parameters<typeof scopedClient>[2]
) =>
  tenantClient(
    scopedClient(url, key, {
      ...options,
      global: {
        ...options?.global,
        headers: { ...options?.global?.headers, 'x-site': requestSiteId() },
      },
    })
  );
