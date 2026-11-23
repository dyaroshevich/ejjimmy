-- Migration: Fix leads table RLS policies for LINE bot
-- Problem: LINE bot (server-side, no user auth) can't insert leads due to RLS

-- Option 1: Disable RLS for leads table (simplest for internal server use)
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Option 2 (alternative): Create policies if you need RLS
-- CREATE POLICY "Allow anonymous inserts" ON public.leads
--   FOR INSERT TO anon WITH CHECK (true);

-- Also ensure anon can insert (in case RLS re-enabled later)
GRANT INSERT ON public.leads TO anon;
GRANT SELECT ON public.leads TO anon;