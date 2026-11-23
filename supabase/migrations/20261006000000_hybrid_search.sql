-- Hybrid search: vector cosine + trigram keyword overlap (works for Thai, no spaces needed)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.hybrid_search(
  query_text text,
  query_embedding vector(768),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 10,
  vector_weight float DEFAULT 0.7,
  keyword_weight float DEFAULT 0.3
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
