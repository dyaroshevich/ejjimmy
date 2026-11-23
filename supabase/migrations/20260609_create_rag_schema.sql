-- RAG Schema for Research Documents
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for document chunks
CREATE TABLE IF NOT EXISTS public.research_document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    document_id UUID REFERENCES public.research_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768), -- For Google gemini-embedding-001
    metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.research_document_chunks ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Public Read Chunks" ON public.research_document_chunks FOR SELECT USING (true);

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_research_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    research_document_chunks.id,
    research_document_chunks.document_id,
    research_document_chunks.content,
    1 - (research_document_chunks.embedding <=> query_embedding) AS similarity,
    research_document_chunks.metadata
  FROM research_document_chunks
  WHERE (p_document_ids IS NULL OR research_document_chunks.document_id = ANY(p_document_ids))
    AND 1 - (research_document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
