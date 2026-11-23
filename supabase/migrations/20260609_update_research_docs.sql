-- Adjust research_documents table
ALTER TABLE public.research_documents 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS content_preview TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- Index for duplicate check
CREATE INDEX IF NOT EXISTS research_documents_file_hash_idx ON public.research_documents (file_hash);
