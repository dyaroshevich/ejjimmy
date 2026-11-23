-- Partner portal + referral program foundation
-- Partners are businesses/individuals who refer leads; referrals track customer invites.

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  company_name text NOT NULL,
  contact_name text,
  contact_phone text,
  contact_email text,
  regions text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  commission_rate numeric NOT NULL DEFAULT 0.05,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partner_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  lead_id bigint NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'referred',
  commission_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, lead_id)
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_type text NOT NULL CHECK (referrer_type IN ('customer', 'partner', 'affiliate')),
  referrer_id text,
  referee_line_id text,
  status text NOT NULL DEFAULT 'pending',
  reward_type text CHECK (reward_type IN ('cash', 'discount', 'points')),
  reward_amount numeric,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_referral
  ON public.referrals (referee_line_id)
  WHERE status IN ('pending', 'qualified');

-- Lead attribution: which partner code (if any) brought this lead
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referred_by text REFERENCES public.partners(code) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_referred_by ON public.leads(referred_by);

-- RLS: locked down (service_role / admin paths only for now)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Auto-link partner leads on insert (partner dashboard reads partner_leads)
CREATE OR REPLACE FUNCTION public.link_partner_lead()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  pid uuid;
BEGIN
  IF NEW.referred_by IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT id INTO pid FROM public.partners
  WHERE code = NEW.referred_by AND status = 'active';
  IF pid IS NOT NULL THEN
    INSERT INTO public.partner_leads (partner_id, lead_id, status)
    VALUES (pid, NEW.id, 'referred')
    ON CONFLICT (partner_id, lead_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_partner_lead ON public.leads;
CREATE TRIGGER trg_link_partner_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.link_partner_lead();
