-- Create research_documents table
CREATE TABLE IF NOT EXISTS public.research_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    content TEXT,
    insight TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'in-progress'
);

-- Enable RLS
ALTER TABLE public.research_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access for research_documents" ON public.research_documents
    FOR SELECT USING (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-research', 'content-research', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access Research"
ON storage.objects FOR SELECT
USING ( bucket_id = 'content-research' );

CREATE POLICY "Admins can manage research"
ON storage.objects FOR ALL
USING ( bucket_id = 'content-research' )
WITH CHECK ( bucket_id = 'content-research' );
