-- Create content_pipeline table
CREATE TABLE IF NOT EXISTS public.content_pipeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT DEFAULT 'planning', -- planning, writing, review, ready
    priority TEXT DEFAULT 'medium', -- low, medium, high
    author TEXT,
    due_date DATE,
    metadata JSONB DEFAULT '{}',
    blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.content_pipeline ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Admins can manage pipeline" ON public.content_pipeline
    FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS content_pipeline_stage_idx ON public.content_pipeline (stage);
