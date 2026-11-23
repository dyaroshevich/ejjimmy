import { supabase } from '../supabase';
import { SolarProduct } from './products';
import * as fs from 'fs';
import * as path from 'path';

export async function loadSolarProducts(): Promise<void> {
  try {
    // First, check if the solar_products table exists
    const { data: testData, error: testError } = await supabase
      .from('solar_products')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (testError && testError.code === 'PGRST205') {
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

    // Read the JSON file with product data
    const filePath = path.resolve(process.cwd(), 'data', 'solar-products', 'products.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const products: SolarProduct[] = JSON.parse(jsonData);

    console.log(`Found ${products.length} products to load`);

    // Process each product
    for (const product of products) {
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
    }

    console.log('Solar products loading completed');
  } catch (error) {
    console.error('Failed to load solar products:', error);
    throw error;
  }
}

// Run the loader if this script is executed directly
if (require.main === module) {
  loadSolarProducts()
    .then(() => {
      console.log('Loading completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Loading failed:', error);
      process.exit(1);
    });
}