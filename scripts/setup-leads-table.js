const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const setupLeadsTableSQL = `
-- Create leads table if not exists
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    phone TEXT,
    line_id TEXT,
    email TEXT,
    bill_amount NUMERIC,
    system_size NUMERIC,
    payback_years NUMERIC,
    status TEXT DEFAULT 'New',
    location TEXT,
    notes TEXT,
    equipment_tier TEXT,
    survey_date TIMESTAMPTZ
);

-- Add missing columns if table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='email') THEN
        ALTER TABLE public.leads ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='location') THEN
        ALTER TABLE public.leads ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='notes') THEN
        ALTER TABLE public.leads ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='equipment_tier') THEN
        ALTER TABLE public.leads ADD COLUMN equipment_tier TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='survey_date') THEN
        ALTER TABLE public.leads ADD COLUMN survey_date TIMESTAMPTZ;
    END IF;
END
$$;

-- Enable realtime for leads
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leads') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE leads;
   END IF;
END
$$;
`;

async function setupLeadsTable() {
  console.log('Attempting to setup/update leads table...');
  const { data, error } = await supabase.rpc('exec_sql', { sql: setupLeadsTableSQL });
  
  if (error) {
    console.error('Error executing SQL via RPC:', error.message);
    console.log('Please run the following SQL manually in your Supabase SQL Editor:');
    console.log(setupLeadsTableSQL);
  } else {
    console.log('Leads table setup/update completed successfully.');
  }
}

setupLeadsTable();
