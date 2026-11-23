-- Tenant isolation, part 2: the partner programme, the assistant's configuration, and the RAG search.
--
-- Part 1 (`20261120000000_tenant_site_id.sql`) covered the storefront's own rows. Three things were left
-- out on purpose, because each needed a decision rather than a column:
--
--   * `system_config` is one key/value row set for the whole project — the AI model and temperature. A
--     franchisee must be able to change theirs without changing the founder's, so the key becomes unique
--     per site and every existing value is copied to the other storefronts (nobody starts with an empty
--     assistant).
--   * `partners` / `partner_leads` / `referrals` are the partner programme. `partners.code` was globally
--     unique and a referral's LINE id was unique across the whole project, so two companies could not
--     reuse either; both become per-site. The `link_partner_lead()` trigger has to look the partner up
--     inside the lead's own site and stamp the row, or every attributed lead fails on the NOT NULL column.
--   * `hybrid_search()` / `match_knowledge()` run over `knowledge`, which is now one company's rows per
--     site. They take no site argument and PostgREST cannot add one, so they read the same request header
--     the policies read (`public.current_site()`); the clients that call them send it.
--
-- Run this **after** part 1 and **before** deploying the code that goes with it.

begin;

-- ---------------------------------------------------------------------------------------------------
-- 1. The four tables, same shape as part 1.
-- ---------------------------------------------------------------------------------------------------
do $migration$
declare
  tenant_tables text[] := array['system_config', 'partners', 'partner_leads', 'referrals'];
  t text;
begin
  foreach t in array tenant_tables loop
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      raise notice 'tenant site_id (2): % does not exist, skipped', t;
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
-- 2. Keys that were global and must be per-site.
-- ---------------------------------------------------------------------------------------------------
do $constraints$
declare
  r record;
begin
  -- leads.referred_by historically pointed at partners(code) globally; that FK blocks
  -- dropping the global unique constraint, so remove it before re-creating it per site.
  if to_regclass('public.leads') is not null then
    execute 'alter table public.leads drop constraint if exists leads_referred_by_fkey';
  end if;
  -- system_config: UNIQUE (key) -> UNIQUE (site_id, key), so each storefront keeps its own model choice.
  if to_regclass('public.system_config') is not null then
    for r in
      select conname from pg_constraint
      where conrelid = 'public.system_config'::regclass
        and contype = 'u'
        and pg_get_constraintdef(oid) = 'UNIQUE (key)'
    loop
      execute format('alter table public.system_config drop constraint %I', r.conname);
    end loop;
    if not exists (
      select 1 from pg_constraint
      where conrelid = 'public.system_config'::regclass
        and contype = 'u'
        and pg_get_constraintdef(oid) = 'UNIQUE (site_id, key)'
    ) then
      alter table public.system_config add constraint system_config_site_key_key unique (site_id, key);
    end if;
  end if;

  -- partners: UNIQUE (code) -> UNIQUE (site_id, code). A code is a partner's own handle, not a global id.
  for r in
    select conname from pg_constraint
    where conrelid = 'public.partners'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (code)'
  loop
    execute format('alter table public.partners drop constraint %I', r.conname);
  end loop;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.partners'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (site_id, code)'
  ) then
    alter table public.partners add constraint partners_site_code_key unique (site_id, code);
  end if;

  -- Re-create the referral FK now that partner codes are unique per site.
  if to_regclass('public.leads') is not null and to_regclass('public.partners') is not null then
    if not exists (
      select 1 from pg_constraint
      where conrelid = 'public.leads'::regclass
        and conname = 'leads_referred_by_fkey'
    ) then
      alter table public.leads
        add constraint leads_referred_by_fkey
        foreign key (site_id, referred_by)
        references public.partners (site_id, code)
        on delete set null;
    end if;
  end if;
end
$constraints$;

-- One active referral per LINE user per company, not per project.
drop index if exists public.uniq_active_referral;
create unique index if not exists uniq_active_referral
  on public.referrals (site_id, referee_line_id)
  where status in ('pending', 'qualified');

-- The key alone can no longer be the primary key once it is per site.
do $system_config_pk$
declare
  r record;
begin
  if to_regclass('public.system_config') is null then
    return;
  end if;
  for r in
    select conname from pg_constraint
    where conrelid = 'public.system_config'::regclass
      and contype = 'p'
      and pg_get_constraintdef(oid) = 'PRIMARY KEY (key)'
  loop
    execute format('alter table public.system_config drop constraint %I', r.conname);
  end loop;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.system_config'::regclass
      and contype = 'p'
  ) then
    alter table public.system_config add primary key (site_id, key);
  end if;
end
$system_config_pk$;

-- Every existing setting is copied to the other storefronts, so a franchisee's assistant starts working
-- instead of falling back to the model name hardcoded in `chat/reply`. Idempotent: re-running keeps edits.
do $seed$
declare
  other text;
begin
  if to_regclass('public.system_config') is null then
    return;
  end if;
  foreach other in array array['solar1', 'template'] loop
    execute format(
      'insert into public.system_config (site_id, key, value)
         select %L, c.key, c.value from public.system_config c
          where c.site_id = %L
       on conflict (site_id, key) do nothing',
      other, 'tawan'
    );
  end loop;
end
$seed$;

-- ---------------------------------------------------------------------------------------------------
-- 3. Attribution has to stay inside the lead's own site.
-- ---------------------------------------------------------------------------------------------------
create or replace function public.link_partner_lead()
returns trigger
language plpgsql
as $fn$
declare
  pid uuid;
begin
  if new.referred_by is null then
    return new;
  end if;
  select id into pid from public.partners
   where code = new.referred_by
     and status = 'active'
     and site_id = new.site_id;
  if pid is not null then
    insert into public.partner_leads (partner_id, lead_id, status, site_id)
    values (pid, new.id, 'referred', new.site_id)
    on conflict (partner_id, lead_id) do nothing;
  end if;
  return new;
end
$fn$;

-- ---------------------------------------------------------------------------------------------------
-- 4. Policies: staff see their own company, a partner sees their own row.
-- ---------------------------------------------------------------------------------------------------
alter table public.partners enable row level security;
create policy "staff see their own partners" on public.partners
  for all to authenticated
  using (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()))
  with check (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()));
create policy "a partner sees their own record" on public.partners
  for select to authenticated
  using (site_id = public.current_site() and user_id = auth.uid());

alter table public.partner_leads enable row level security;
create policy "staff see their own partner leads" on public.partner_leads
  for all to authenticated
  using (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()))
  with check (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()));
create policy "a partner sees their own leads" on public.partner_leads
  for select to authenticated
  using (
    site_id = public.current_site()
    and exists (
      select 1 from public.partners p
       where p.id = partner_leads.partner_id and p.user_id = auth.uid()
    )
  );

alter table public.referrals enable row level security;
create policy "staff see their own referrals" on public.referrals
  for all to authenticated
  using (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()))
  with check (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()));

do $config_policies$
begin
  if to_regclass('public.system_config') is null then
    return;
  end if;
  execute 'alter table public.system_config enable row level security';
  execute 'drop policy if exists "staff manage system config" on public.system_config';
  execute $p$
    create policy "staff manage system config" on public.system_config
      for all to authenticated
      using (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()))
      with check (public.is_super_admin() or (public.is_staff() and site_id = public.current_site()))
  $p$;
end
$config_policies$;

-- ---------------------------------------------------------------------------------------------------
-- 5. The RAG search reads the request's own site. Same signature, so an old client keeps working; the
--    clients that care send `x-site` (`createClientEdge` in `api/chat`, `createScopedClient` elsewhere).
-- ---------------------------------------------------------------------------------------------------
create or replace function public.hybrid_search(
  query_text text,
  query_embedding vector(768),
  match_threshold float default 0.4,
  match_count int default 10,
  vector_weight float default 0.7,
  keyword_weight float default 0.3
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float,
  vector_score float,
  keyword_score float
)
language plpgsql
as $fn$
begin
  return query
  with scored as (
    select
      k.id as kid,
      k.content as kcontent,
      k.metadata as kmeta,
      (1 - (k.embedding <=> query_embedding)) as vsim,
      similarity(k.content, query_text) as ksim
    from public.knowledge k
    where k.embedding is not null
      and k.site_id = public.current_site()
  )
  select
    s.kid, s.kcontent, s.kmeta,
    (s.vsim * vector_weight + s.ksim * keyword_weight)::float as similarity,
    s.vsim::float as vector_score,
    s.ksim::float as keyword_score
  from scored s
  where s.vsim > match_threshold or s.ksim > 0.1
  order by similarity desc
  limit match_count;
end;
$fn$;

create or replace function public.match_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $fn$
begin
  return query
  select
    knowledge.id,
    knowledge.content,
    knowledge.metadata,
    1 - (knowledge.embedding <=> query_embedding) as similarity
  from public.knowledge
  where 1 - (knowledge.embedding <=> query_embedding) > match_threshold
    and knowledge.site_id = public.current_site()
  order by similarity desc
  limit match_count;
end;
$fn$;

commit;
