CREATE TABLE public.proposal_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id integer REFERENCES public.leads(id) ON DELETE CASCADE,
  label text,
  snapshot_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_proposal_snapshots_lead_id ON public.proposal_snapshots(lead_id);
