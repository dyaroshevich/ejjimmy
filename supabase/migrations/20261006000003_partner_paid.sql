-- Partner payouts tracking (test mode)
ALTER TABLE public.partner_leads ADD COLUMN IF NOT EXISTS paid_at timestamptz;
