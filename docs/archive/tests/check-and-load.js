// Script to check if the solar_products table exists and load data if it does
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Load products data
const filePath = path.join(__dirname, 'data', 'solar-products', 'products.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const products = JSON.parse(rawData);

console.log(`Found ${products.length} products to load`);

// First, check if the table exists by trying to select one row
async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('solar_products')
      .select('id')
      .limit(1)
      .single();

    // If we get an error, check if it's because the table doesn't exist
    if (error && error.code === 'PGRST205') {
      return false;
    }
    // If there's another error, we still consider the table exists (maybe it's a permission issue, etc.)
    // But for simplicity, we'll assume that any other error means the table exists but we can't access it.
    return true;
  } catch (err) {
    console.error('Unexpected error checking table:', err);
    // Assume table exists but we had an unexpected error
    return true;
  }
}

// Load the products
async function loadProducts() {
  const tableExists = await checkTableExists();
  if (!tableExists) {
    console.error('The solar_products table does not exist in the database.');
    console.error('Please create the table by running the following SQL in your Supabase database:');
    console.error(`
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
`);
    process.exit(1);
  }

  console.log('Table exists. Proceeding to load data...');

  // Process each product
  for (const product of products) {
    try {
      // Check if product already exists by ID
      const { data: existingProduct, error: checkError } = await supabase
        .from('solar_products')
        .select('id')
        .eq('id', product.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error(`Error checking for existing product ${product.id}:`, checkError);
        continue;
      }

      if (existingProduct) {
        // Update existing product
        const { data, error } = await supabase
          .from('solar_products')
          .update({
            name: product.name,
            brand: product.brand,
            model: product.model,
            type: product.type,
            power_kw: product.power_kw,
            price_thb: product.price_thb,
            specifications: product.specifications,
            image_url: product.image_url,
            description: product.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (error) {
          console.error(`Error updating product ${product.id}:`, error);
        } else {
          console.log(`Updated product: ${product.name}`);
        }
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from('solar_products')
          .insert([{
            id: product.id,
            name: product.name,
            brand: product.brand,
            model: product.model,
            type: product.type,
            power_kw: product.power_kw,
            price_thb: product.price_thb,
            specifications: product.specifications,
            image_url: product.image_url,
            description: product.description,
            created_at: product.created_at,
            updated_at: product.updated_at
          }]);

        if (error) {
          console.error(`Error inserting product ${product.id}:`, error);
        } else {
          console.log(`Inserted product: ${product.name}`);
        }
      }
    } catch (productError) {
      console.error(`Error processing product ${product.id}:`, productError);
    }
  }

  console.log('Solar products loading completed');
}

loadProducts().catch(console.error);