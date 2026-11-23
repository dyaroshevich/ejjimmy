// Simple script to load solar products data into Supabase
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

// Process each product
async function loadProducts() {
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