-- Migration to add missing columns to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS equipment_tier TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS survey_date TIMESTAMPTZ;
