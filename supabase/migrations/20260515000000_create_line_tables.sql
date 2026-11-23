-- LINE Context & Action Logging Tables

-- User context for LINE chatbot state management
CREATE TABLE IF NOT EXISTS line_context (
  user_id TEXT PRIMARY KEY,
  state TEXT DEFAULT 'idle',
  calculator_step TEXT DEFAULT 'idle',
  calculator_bill NUMERIC,
  calculator_area TEXT,
  last_action TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action log for LINE analytics
CREATE TABLE IF NOT EXISTS line_actions_log (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_line_actions_log_user_id ON line_actions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_line_actions_log_action ON line_actions_log(action);
CREATE INDEX IF NOT EXISTS idx_line_actions_log_created_at ON line_actions_log(created_at);

-- Add source column to leads table if not exists
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

-- RLS disabled for simplicity (can enable later)
ALTER TABLE line_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_actions_log ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for LINE webhook
CREATE POLICY "Allow anonymous line_context" ON line_context FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow anonymous line_actions_log" ON line_actions_log FOR ALL TO anon, authenticated USING (true);

COMMENT ON TABLE line_context IS 'Stores LINE user state for multi-step flows (calculator, lead form)';
COMMENT ON TABLE line_actions_log IS 'Analytics log for all LINE user actions';