-- Add chunking support to knowledge table
-- Allows splitting long documents into overlapping chunks for better RAG retrieval

ALTER TABLE public.knowledge
  ADD COLUMN IF NOT EXISTS parent_id bigint REFERENCES public.knowledge(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS chunk_index int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_chunks int DEFAULT 1;

-- Index for efficient chunk lookup
CREATE INDEX IF NOT EXISTS idx_knowledge_parent ON public.knowledge(parent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunk ON public.knowledge(parent_id, chunk_index);

-- Comment for documentation
COMMENT ON COLUMN public.knowledge.parent_id IS 'References parent document when this row is a chunk';
COMMENT ON COLUMN public.knowledge.chunk_index IS 'Sequential index of this chunk within parent document';
COMMENT ON COLUMN public.knowledge.total_chunks IS 'Total number of chunks in parent document';