-- Create content_calendar table
CREATE TABLE IF NOT EXISTS public.content_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    platform TEXT DEFAULT 'facebook', -- facebook, line, blog
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, published, failed
    metadata JSONB DEFAULT '{}',
    blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
    pipeline_item_id UUID REFERENCES public.content_pipeline(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Admins can manage calendar" ON public.content_calendar
    FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS content_calendar_scheduled_at_idx ON public.content_calendar (scheduled_at);
