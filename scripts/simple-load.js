const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const supabaseUrl = 'https://odolxtryjmfpzfmuhngo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2x4dHJ5am1mcHpmbXVobmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMjgxOCwiZXhwIjoyMDg4MDA4ODE4fQ.X_wvj6zxmquPmCV0jlAsAGPudjQn-Ej2Xe-suwUrgXE';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function loadProducts() {
  try {
    const filePath = path.join(__dirname, 'data/solar-products/products_mvp.json');
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8')).map(p => ({
      ...p,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log(`🚀 Loading ${products.length} products with manual IDs...`);

    const { data, error } = await supabase
      .from('solar_products')
      .insert(products);

    if (error) {
      console.error(`❌ Error loading products:`, error.message);
    } else {
      console.log(`✅ Loaded ${products.length} products successfully!`);
    }

    console.log('✨ Finish!');
  } catch (err) {
    console.error('💥 Loading failed:', err);
  }
}

loadProducts();
