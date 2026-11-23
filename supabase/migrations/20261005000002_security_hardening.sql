-- Security hardening applied 2026-10-05 (previously executed live, recorded here for reproducibility)
-- 1. Drop dangerous exec_sql RPC (SECURITY DEFINER arbitrary SQL execution exposed to anon via PostgREST)
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM anon, authenticated, public;
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- 2. Leads table: RLS was disabled (only table without it) + anon read policy
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read leads" ON public.leads;
DROP POLICY IF EXISTS "Admins full access to leads" ON public.leads;
-- Remaining leads policies: "Allow admin manage leads" (authenticated + role=admin, ALL),
-- "Enable web lead submission" (public, INSERT only)
