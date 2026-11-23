-- Create content_media table
CREATE TABLE IF NOT EXISTS public.content_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    file_hash TEXT UNIQUE,
    category TEXT DEFAULT 'general', -- images, video, documents
    metadata JSONB DEFAULT '{}',
    thumbnail_url TEXT
);

-- Enable RLS
ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Admins can manage media" ON public.content_media
    FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS content_media_file_hash_idx ON public.content_media (file_hash);
CREATE INDEX IF NOT EXISTS content_media_category_idx ON public.content_media (category);
