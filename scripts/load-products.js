const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const products = require('../data/solar-products/products.json');

async function loadProducts() {
  console.log(`Loading ${products.length} products to database...`);
  
  for (const product of products) {
    const { id, name, brand, model, type, power_kw, price_thb, specifications, image_url, description } = product;
    
    const { error } = await supabase
      .from('solar_products')
      .upsert({
        id,
        name,
        brand,
        model,
        type,
        power_kw,
        price_thb,
        specifications,
        image_url,
        description
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error loading ${name}:`, error.message);
    } else {
      console.log(`✓ ${name} (${price_thb} THB)`);
    }
  }
  
  console.log('\n✅ All products loaded!');
}

loadProducts().catch(console.error);
