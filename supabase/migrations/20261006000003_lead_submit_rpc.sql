-- Server-side lead submission (SECURITY DEFINER).
-- Browser anon key cannot SELECT leads anymore, so inserts go through this
-- RPC which validates, rate-limits per phone, and returns the created row.
-- Trigger trg_link_partner_lead still fires for partner attribution.
CREATE OR REPLACE FUNCTION public.submit_lead(
  p_name text,
  p_phone text DEFAULT NULL,
  p_line_id text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_bill numeric DEFAULT 0,
  p_system_size numeric DEFAULT NULL,
  p_payback numeric DEFAULT NULL,
  p_tier text DEFAULT NULL,
  p_source text DEFAULT 'web',
  p_notes text DEFAULT NULL,
  p_chat_history jsonb DEFAULT '[]',
  p_survey_date text DEFAULT NULL,
  p_referred_by text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nl public.leads%ROWTYPE;
  v_referred text := NULLIF(trim(p_referred_by), '');
BEGIN
  IF p_phone IS NOT NULL AND p_phone !~ '^[0-9+\-\s()]{7,20}$' THEN
    RAISE EXCEPTION 'bad phone';
  END IF;
  -- Per-phone daily cap (cheap spam guard)
  IF p_phone IS NOT NULL THEN
    IF (SELECT count(*) FROM public.leads
        WHERE phone = p_phone AND created_at > now() - interval '1 day') >= 5 THEN
      RAISE EXCEPTION 'too many leads';
    END IF;
  END IF;
  -- Attribution only for active partner codes (stale/forged -> NULL, never fails)
  IF v_referred IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.partners WHERE code = v_referred AND status = 'active'
  ) THEN
    -- keep v_referred
    NULL;
  ELSE
    v_referred := NULL;
  END IF;
  INSERT INTO public.leads
    (name, phone, line_id, email, location, bill_amount, system_size,
     payback_years, equipment_tier, status, notes, source, chat_history,
     survey_date, referred_by, unread, updated_at)
  VALUES (
    COALESCE(NULLIF(trim(p_name), ''), 'ลูกค้าใหม่'),
    NULLIF(trim(p_phone), ''), NULLIF(trim(p_line_id), ''), NULLIF(trim(p_email), ''),
    NULLIF(trim(p_location), ''), COALESCE(p_bill, 0), p_system_size,
    p_payback, NULLIF(trim(p_tier), ''), 'New (Web)',
    NULLIF(p_notes, ''), COALESCE(NULLIF(trim(p_source), ''), 'web'),
    COALESCE(p_chat_history, '[]'),
    CASE WHEN p_survey_date IS NULL THEN NULL ELSE p_survey_date::timestamptz END,
    v_referred, true, now()
  )
  RETURNING * INTO nl;
  RETURN row_to_json(nl);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_lead(text, text, text, text, text, numeric, numeric, numeric, text, text, text, jsonb, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_lead(text, text, text, text, text, numeric, numeric, numeric, text, text, text, jsonb, text, text) TO anon, authenticated;
