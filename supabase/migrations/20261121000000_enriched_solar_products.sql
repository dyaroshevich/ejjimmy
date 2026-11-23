-- Content pack: unify catalogue (solar_products) and enrich it for RAG/seller scripts.
-- Adds the embedding column (768-dim) and the enriched_solar_products view described in
-- docs/seller-scripts-integration/01-database-foundation.md. Safe to re-run.
begin;

create extension if not exists vector;

alter table public.solar_products
  add column if not exists embedding vector(768);

create or replace view public.enriched_solar_products as
select
  p.*,
  (select json_agg(k.content)
     from public.knowledge k
    where k.metadata->>'id' = p.id
      and k.embedding is not null) as direct_research,
  (select json_agg(json_build_object(
      'content', sub.content,
      'category', sub.category,
      'type', sub.type,
      'similarity', sub.similarity
    ))
     from (
       select k.content,
              k.metadata->>'category' as category,
              k.metadata->>'type' as type,
              1 - (k.embedding <=> p.embedding) as similarity
         from public.knowledge k
        where k.embedding is not null
          and k.id not in (select id from public.knowledge where metadata->>'id' = p.id)
        order by k.embedding <=> p.embedding
        limit 3
     ) sub) as similar_research,
  (select count(*) from public.knowledge k where k.content ilike '%' || p.brand || '%') as brand_mentions
from public.solar_products p;

commit;
