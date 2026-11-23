-- Tenant isolation: one project, three companies, one column.
--
-- Three storefronts share this deployment and this database, so `leads`, the catalogue and the posts
-- were a single pile: `/admin/leads` under Solar 1 listed Tawan Power's enquiries, and a Solar 1 case
-- description still says «ทีมงาน Tawan Power». The code side lives in `src/lib/tenant.ts`; this file is
-- the half the browser client needs, because it talks to PostgREST with the staff member's own JWT and
-- no application code sits in between.
--
-- **Run this before deploying the code that goes with it** (`src/lib/tenant.ts` filters every server
-- query on `site_id`; until the column exists those queries fail, and the error names this file).
--
-- What it does, in order:
--   1. adds `site_id` to every table that holds one company's rows, backfilled to `tawan`;
--   2. defines three helpers policies read: `current_site()`, `is_staff()`, `is_super_admin()`;
--   3. stamps `site_id` on insert when the caller left it empty (a browser-side form has no way to
--      choose a tenant, and trusting the payload would let anyone write into another company's rows);
--   4. replaces the permissive policies with site-scoped ones on the tables that actually leak.
--
-- Who is who:
--   `x-site` — sent by our own server clients and by the browser client (`src/lib/supabase.ts`), so a
--              request carries the storefront it was made on;
--   JWT `app_metadata.site` — the staff member's own company, set per account. Accounts without it are
--              treated as the flagship, which is what keeps today's Tawan staff working unchanged;
--   `app_metadata.role = super_admin` — the founder's cross-site role, unchanged.
--
-- NOT scoped here, deliberately: `system_config` (one row of AI settings for the whole project — making
-- it per-site needs defaults, or a franchisee's assistant has no configuration), the partner tables
-- (`partners`/`referrals`/`partner_leads`), and the owner-scoped `push_subscriptions` /
-- `user_notification_settings`, which are already keyed by `user_id`. Recorded in ROADMAP, not silently
-- half-done.

begin;

-- ---------------------------------------------------------------------------------------------------
-- 1. Helpers. `current_setting(..., true)` is empty rather than NULL when the setting is absent, so
--    every read is guarded: ''::json would raise, and an absent header must mean the flagship.
-- ---------------------------------------------------------------------------------------------------
create or replace function public.current_site()
returns text
language sql
stable
as $fn$
  select coalesce(
    nullif(current_setting('request.headers', true), '')::json ->> 'x-site',
    nullif(current_setting('request.jwt.claims', true), '')::json -> 'app_metadata' ->> 'site',
    'tawan'
  )
$fn$;

create or replace function public.staff_role()
returns text
language sql
stable
as $fn$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::json -> 'app_metadata' ->> 'role',
    ''
  )
$fn$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $fn$ select public.staff_role() in ('admin', 'super_admin') $fn$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $fn$ select public.staff_role() = 'super_admin' $fn$;

-- Fills the tenant when the caller did not: a form on a franchisee's phone cannot choose one, and a
-- payload that could choose would let a visitor file a lead into another company's inbox.
create or replace function public.stamp_site()
returns trigger
language plpgsql
as $fn$
begin
  if new.site_id is null then
    new.site_id := public.current_site();
  end if;
  return new;
end
$fn$;

grant execute on function public.current_site() to anon, authenticated;
grant execute on function public.staff_role() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.is_super_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------------------------------
-- 2. The column, its index and the insert trigger — every table `src/lib/tenant.ts` scopes.
--    `scripts/tenant-audit.mjs` fails when this list and the code's list disagree.
-- ---------------------------------------------------------------------------------------------------
do $migration$
declare
  tenant_tables text[] := array[
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
    'offer_templates'
  ];
  t text;
begin
  foreach t in array tenant_tables loop
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      raise notice 'tenant site_id: % does not exist, skipped', t;
      continue;
    end if;

    execute format('alter table public.%I add column if not exists site_id text', t);
    execute format('update public.%I set site_id = %L where site_id is null', t, 'tawan');
    execute format('alter table public.%I alter column site_id set not null', t);
    execute format('create index if not exists %I on public.%I (site_id)', t || '_site_id_idx', t);
    execute format('drop trigger if exists stamp_site on public.%I', t);
    execute format(
      'create trigger stamp_site before insert on public.%I for each row execute function public.stamp_site()',
      t
    );
  end loop;
end
$migration$;

-- ---------------------------------------------------------------------------------------------------
-- 3. Policies. Only the tables whose current policy actually lets a company see another company's rows.
--    Each one is dropped by name (the permissive ones come from earlier migrations) and recreated scoped.
-- ---------------------------------------------------------------------------------------------------

-- leads: was "any authenticated user may manage every lead", which is every franchisee's staff.
alter table public.leads enable row level security;
drop policy if exists "Admins can manage leads" on public.leads;
drop policy if exists "Public can insert leads" on public.leads;
drop policy if exists "Allow public inserts" on public.leads;
drop policy if exists "Allow public read leads" on public.leads;
create policy "staff see their own leads" on public.leads
  for all to authenticated
  using (public.is_super_admin() or site_id = public.current_site())
  with check (public.is_super_admin() or site_id = public.current_site());
create policy "public can leave a lead" on public.leads
  for insert to anon
  with check (site_id = public.current_site());

-- blog_posts: published posts are public, but only the ones this storefront wrote.
alter table public.blog_posts enable row level security;
drop policy if exists "Allow public read access for published posts" on public.blog_posts;
create policy "staff see their own posts" on public.blog_posts
  for all to authenticated
  using (public.is_super_admin() or site_id = public.current_site())
  with check (public.is_super_admin() or site_id = public.current_site());
create policy "public reads published posts of this site" on public.blog_posts
  for select to anon
  using (published = true and site_id = public.current_site());

-- solar_cases: same shape.
alter table public.solar_cases enable row level security;
drop policy if exists "Public read for published cases" on public.solar_cases;
create policy "staff see their own cases" on public.solar_cases
  for all to authenticated
  using (public.is_super_admin() or site_id = public.current_site())
  with check (public.is_super_admin() or site_id = public.current_site());
create policy "public reads published cases of this site" on public.solar_cases
  for select to anon
  using (published = true and site_id = public.current_site());

-- solar_products: RLS had been switched OFF by 20260315114445, so no policy could protect it at all.
alter table public.solar_products enable row level security;
create policy "staff see their own catalogue" on public.solar_products
  for all to authenticated
  using (public.is_super_admin() or site_id = public.current_site())
  with check (public.is_super_admin() or site_id = public.current_site());
create policy "public reads this site's catalogue" on public.solar_products
  for select to anon
  using (site_id = public.current_site());

-- knowledge: the RAG rows behind the assistant, public read, per site.
alter table public.knowledge enable row level security;
drop policy if exists "Public can view knowledge" on public.knowledge;
create policy "staff see their own knowledge" on public.knowledge
  for all to authenticated
  using (public.is_super_admin() or site_id = public.current_site())
  with check (public.is_super_admin() or site_id = public.current_site());
create policy "public reads this site's knowledge" on public.knowledge
  for select to anon
  using (site_id = public.current_site());

-- line_context / line_actions_log: these carried `FOR ALL TO anon USING (true)` — every customer's
-- LINE conversation, readable with the public key. The webhook writes them with the service key, so
-- dropping the anon grant costs nothing.
alter table public.line_context enable row level security;
drop policy if exists "Allow anonymous line_context" on public.line_context;
create policy "staff see their own line context" on public.line_context
  for all to authenticated
  using (public.is_super_admin() or site_id = public.current_site())
  with check (public.is_super_admin() or site_id = public.current_site());

alter table public.line_actions_log enable row level security;
drop policy if exists "Allow anonymous line_actions_log" on public.line_actions_log;
create policy "staff see their own line log" on public.line_actions_log
  for all to authenticated
  using (public.is_super_admin() or site_id = public.current_site())
  with check (public.is_super_admin() or site_id = public.current_site());

commit;
