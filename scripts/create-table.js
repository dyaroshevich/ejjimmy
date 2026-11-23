// Script to create the solar_products table using Supabase JS
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL to create the table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.solar_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    type TEXT NOT NULL CHECK (type IN ('package', 'panel', 'inverter', 'battery', 'mounting', 'charger', 'system')),
    power_kw INTEGER,
    price_thb INTEGER,
    specifications JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for this table
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'solar_products') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE solar_products;
   END IF;
END
$$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_solar_products_type ON solar_products(type);
CREATE INDEX IF NOT EXISTS idx_solar_products_brand ON solar_products(brand);
CREATE INDEX IF NOT EXISTS idx_solar_products_power_kw ON solar_products(power_kw);
CREATE INDEX IF NOT EXISTS idx_solar_products_price_thb ON solar_products(price_thb);

-- Create the update_updated_at_column function if it doesn't exist
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
      END;
      $$ language 'plpgsql';
   END IF;
END
$$;

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_solar_products_updated_at ON solar_products;
CREATE TRIGGER update_solar_products_updated_at
    BEFORE UPDATE ON solar_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

async function createTable() {
  try {
    console.log('Attempting to create solar_products table...');
    
    // Try to use rpc to execute SQL if available
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.log('RPC exec_sql not available, trying alternative approach...');
      
      // Alternative: try to insert a dummy row to see if table exists
      const { data: testData, error: testError } = await supabase
        .from('solar_products')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      if (testError && testError.code === 'PGRST205') {
        console.log('Table does not exist. Please create it manually in Supabase dashboard or run this SQL:');
        console.log(createTableSQL);
        return false;
      } else {
        console.log('Table already exists or accessible');
        return true;
      }
    } else {
      console.log('Table created successfully via RPC');
      return true;
    }
  } catch (err) {
    console.error('Error creating table:', err);
    return false;
  }
}

createTable().then(success => {
  if (success) {
    console.log('Table setup completed');
    process.exit(0);
  } else {
    console.log('Table setup failed - please create manually');
    process.exit(1);
  }
});