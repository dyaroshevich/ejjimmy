-- Locale support for multilingual content (th default, en, zh)
ALTER TABLE public.solar_products ADD COLUMN IF NOT EXISTS locale text DEFAULT 'th';
ALTER TABLE public.knowledge ADD COLUMN IF NOT EXISTS locale text DEFAULT 'th';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS locale text DEFAULT 'th';
ALTER TABLE public.solar_cases ADD COLUMN IF NOT EXISTS locale text DEFAULT 'th';

CREATE INDEX IF NOT EXISTS idx_products_locale ON public.solar_products(locale);
CREATE INDEX IF NOT EXISTS idx_knowledge_locale ON public.knowledge(locale);

-- Backfill: legacy rows without locale are Thai content
UPDATE public.knowledge SET locale = 'th' WHERE locale IS NULL;
UPDATE public.solar_products SET locale = 'th' WHERE locale IS NULL;

-- Hybrid search with optional locale filter (NULL legacy rows count as Thai)
CREATE OR REPLACE FUNCTION public.hybrid_search(
  query_text text,
  query_embedding vector(768),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 10,
  vector_weight float DEFAULT 0.7,
  keyword_weight float DEFAULT 0.3,
  p_locale text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float,
  vector_score float,
  keyword_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH scored AS (
    SELECT
      k.id AS kid,
      k.content AS kcontent,
      k.metadata AS kmeta,
      (1 - (k.embedding <=> query_embedding)) AS vsim,
      similarity(k.content, query_text) AS ksim
    FROM public.knowledge k
    WHERE k.embedding IS NOT NULL
      AND (
        p_locale IS NULL
        OR COALESCE(k.locale, 'th') = p_locale
        OR (p_locale <> 'th' AND k.locale IS NULL)
      )
  )
  SELECT
    s.kid, s.kcontent, s.kmeta,
    (s.vsim * vector_weight + s.ksim * keyword_weight)::float AS similarity,
    s.vsim::float AS vector_score,
    s.ksim::float AS keyword_score
  FROM scored s
  WHERE s.vsim > match_threshold OR s.ksim > 0.1
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
