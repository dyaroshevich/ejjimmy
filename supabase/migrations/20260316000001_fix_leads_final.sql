-- Migration: Add missing lead columns and enable Realtime
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS equipment_tier TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS survey_date TIMESTAMPTZ;

-- Enable Realtime for leads
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leads') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE leads;
   END IF;
END
$$;
