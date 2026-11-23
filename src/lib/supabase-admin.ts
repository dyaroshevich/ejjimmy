import { supabaseAdmin as serviceClient } from './supabase';
import { requestSiteId, tenantClient } from './tenant-server';

/**
 * The service-role client, scoped to the request's own storefront.
 *
 * The raw client bypasses RLS — that is what the service key is for — so the site filter cannot live in
 * the database for it. Everything server-side imports this name instead of `@/lib/supabase`'s, which
 * keeps the filter in one place while the 190 call sites stay untouched. `null` is preserved: callers
 * rely on `supabaseAdmin || supabase` to fall back to the anon client when the key is absent.
 */
// The site is resolved per query (`requestSiteId` as a function): this module is evaluated once, long
// before the first request, so passing an id here would pin every storefront to the flagship.
export const supabaseAdmin = serviceClient ? tenantClient(serviceClient, requestSiteId) : serviceClient;
