-- Tenant isolation, part 3: the keys that were global because there was one company.
--
-- Copying a franchisee's content from the flagship (scripts/tenant-clone.mjs) needs a slug that is unique
-- *per site*, not per project: `blog_posts.slug` and `solar_cases.slug` were `UNIQUE` on the column alone,
-- so the moment a second company copied «solar-cost-krabi» the insert failed.
--
-- `author TEXT DEFAULT 'Tawan Power Team'` (20260602_create_blog_posts.sql) is the same defect one level
-- down: every new post of every company is credited to the founder unless the caller overrides it.
--
-- Run after part 2, before deploying the code that copies content.

begin;

do $keys$
declare
  r record;
  target record;
begin
  for target in
    select * from (values
      ('blog_posts', 'blog_posts_site_slug_key'),
      ('solar_cases', 'solar_cases_site_slug_key')
    ) as t(tbl, constraint_name)
  loop
    for r in
      select conname from pg_constraint
      where conrelid = format('public.%I', target.tbl)::regclass
        and contype = 'u'
        and pg_get_constraintdef(oid) = 'UNIQUE (slug)'
    loop
      execute format('alter table public.%I drop constraint %I', target.tbl, r.conname);
    end loop;

    if not exists (
      select 1 from pg_constraint
      where conrelid = format('public.%I', target.tbl)::regclass
        and contype = 'u'
        and pg_get_constraintdef(oid) = 'UNIQUE (site_id, slug)'
    ) then
      execute format(
        'alter table public.%I add constraint %I unique (site_id, slug)',
        target.tbl, target.constraint_name
      );
    end if;
  end loop;

  -- A post's author is the company that wrote it, not a default in the schema.
  alter table public.blog_posts alter column author drop default;
end
$keys$;

commit;
