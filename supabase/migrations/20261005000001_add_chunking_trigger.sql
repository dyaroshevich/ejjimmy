-- Auto-chunking trigger for knowledge base (applied live 2026-10-05)
-- Fires chunk-and-embed Edge Function for long content (>2000 chars).
-- NOTE: service_key must be inserted at apply time from a secure source.
-- It is intentionally NOT stored in this file. Replace the placeholder below
-- with the project's service_role key before running, or set it via Vault:
--   SELECT vault.create_secret('<SERVICE_ROLE_KEY>', 'sb_service_role');
--   service_key text := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'sb_service_role');
CREATE OR REPLACE FUNCTION public.trigger_chunk_and_embed()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  service_key text := '<YOUR_SERVICE_ROLE_KEY>';
BEGIN
  IF length(NEW.content) > 2000 AND (NEW.total_chunks IS NULL OR NEW.total_chunks = 1) THEN
    PERFORM net.http_post(
      'https://gfdbmxhtvhivoztgckit.supabase.co/functions/v1/chunk-and-embed',
      jsonb_build_object('record_id', NEW.id),
      '{}'::jsonb,
      jsonb_build_object(
        'Authorization', 'Bearer ' || service_key,
        'Content-Type', 'application/json'
      ),
      60000
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_knowledge_chunking ON public.knowledge;
CREATE TRIGGER trigger_knowledge_chunking
  AFTER INSERT OR UPDATE OF content ON public.knowledge
  FOR EACH ROW EXECUTE FUNCTION trigger_chunk_and_embed();
