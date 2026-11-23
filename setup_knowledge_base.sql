-- 1. Включаем поддержку векторов (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Создаем таблицу базы знаний
CREATE TABLE IF NOT EXISTS knowledge (
  id bigserial PRIMARY KEY,
  content text NOT NULL,        -- Текст (FAQ, спецификация и т.д.)
  metadata jsonb,              -- Доп. инфо (категория, теги)
  embedding vector(1536)      -- Смысловой вектор
);

-- 3. Создаем функцию поиска по смыслу (Similarity Search)
CREATE OR REPLACE FUNCTION match_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge.id,
    knowledge.content,
    knowledge.metadata,
    1 - (knowledge.embedding <=> query_embedding) AS similarity
  FROM knowledge
  WHERE 1 - (knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
