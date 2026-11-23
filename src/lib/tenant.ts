/**
 * One database, several companies — and the column that says whose row is whose.
 *
 * Three storefronts already share a deployment and a Supabase project, so `leads`, posts and the
 * catalogue were one pile: `/admin/leads` under a franchisee listed the flagship's enquiries, and its
 * landing repeated the flagship's name inside a case description (ROADMAP C2). The fix is a column
 * per row plus one place that enforces it, because the alternative — remembering `.eq('site_id', …)`
 * at 190 call sites — is the defect, not the cure.
 *
 * Two layers, and they cover different callers:
 *  - **RLS** (`supabase/migrations/20261120000000_tenant_site_id.sql`) is the only thing that guards
 *    the browser client, which talks to PostgREST with the staff member's own JWT.
 *  - **`scopeTenant()` below** is for the server clients, including the service-role one that bypasses
 *    RLS by design: it filters reads by the request's own site and stamps writes with it.
 *
 * `20261120000001_tenant_partner_config.sql` adds the second half: the assistant's settings, the partner
 * programme and the two RAG functions. The partner tables and `system_config` are here because their keys
 * were global (`UNIQUE (key)`, `UNIQUE (code)`, one active referral per LINE id across the project), which
 * is the part a column alone would not have fixed.
 */
export const TENANT_COLUMN = 'site_id';

/** Every table that holds one company's rows. The migration declares the same list; `tenant:check` ties them. */
export const TENANT_TABLES: ReadonlySet<string> = new Set([
  'leads',
  'blog_posts',
  'solar_cases',
  'solar_products',
  'knowledge',
  'content_media',
  'content_calendar',
  'content_pipeline',
  'line_context',
  'line_actions_log',
  'push_subscriptions',
  'user_notification_settings',
  'proposal_links',
  'proposal_snapshots',
  'offer_templates',
  'system_config',
  'partners',
  'partner_leads',
  'referrals',
]);

/** Every write carries the request's site, whatever the caller put in the payload. */
const stamp = (value: unknown, siteId: string): unknown => {
  if (Array.isArray(value)) return value.map((row) => stamp(row, siteId));
  if (value && typeof value === 'object') return { ...(value as Record<string, unknown>), [TENANT_COLUMN]: siteId };
  return value;
};

const missingColumnHint = (message: string) =>
  `tenant scoping is on but the column is missing: ${message}\n` +
  'Run supabase/migrations/20261120000000_tenant_site_id.sql before deploying this code.';

/**
 * A client that only sees one company's rows.
 *
 * PostgREST folds filters with AND, so the site filter is attached the moment a read, update or delete
 * starts — before the caller's own conditions — and inserts are stamped rather than trusted. Joins,
 * `or()`, ranges and counts are untouched: the proxy only wraps `from`.
 */
/** Any client that can ask for a table — the schema generic it carries is not this module's business. */
export type TableClient = { from: (table: string) => unknown };

/**
 * A builder that rewrites one error when the query is awaited.
 *
 * PostgREST reports a missing column as `column leads.site_id does not exist`, which says nothing about
 * the migration that adds it. Filters never throw — they arrive as `{ error }` — so the rewrite has to sit
 * on `then`, and on the builder the chain actually returns, not just on the one `from()` handed out.
 */
const hintOnAwait = (builder: any) =>
  new Proxy(builder, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: any, reject: any) =>
          target.then((result: any) => {
            const error = result?.error;
            if (error && String(error.message ?? '').includes(TENANT_COLUMN)) {
              return resolve?.({ ...result, error: { ...error, message: missingColumnHint(error.message) } });
            }
            return resolve?.(result);
          }, reject);
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

export function scopeTenant<T extends TableClient>(client: T, site: string | (() => string)): T {
  if (!client) return client;
  if (typeof site === 'string' && !site) throw new Error('scopeTenant() needs a site id');
  // A function is resolved per query, not once: a module-level client (`supabaseAdmin`) is created
  // before any request exists, and pinning the site there would serve the flagship to every storefront.
  const siteOf = typeof site === 'function' ? site : () => site;

  const from = (table: string) => {
    const builder = (client.from as (name: string) => any)(table);
    if (!TENANT_TABLES.has(table)) return builder;
    const siteId = siteOf();
    if (!siteId) throw new Error('scopeTenant() needs a site id');

    return new Proxy(builder, {
      get(target, prop) {
        if (prop === 'insert' || prop === 'upsert') {
          return (values: unknown, ...rest: unknown[]) =>
            hintOnAwait(target[prop](stamp(values, siteId), ...rest));
        }
        if (prop === 'select' || prop === 'update' || prop === 'delete') {
          return (...args: unknown[]) => hintOnAwait(target[prop](...args).eq(TENANT_COLUMN, siteId));
        }
        if (prop === 'then') {
          return (resolve: any, reject: any) => hintOnAwait(target).then(resolve, reject);
        }
        const value = Reflect.get(target, prop, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  };

  return new Proxy(client, {
    get(target, prop) {
      if (prop === 'from') return from;
      const value = Reflect.get(target, prop, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as T;
}
