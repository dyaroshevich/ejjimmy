const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSearch(query) {
  console.log(`Testing search for: "${query}"`);
  
  try {
    let dbQuery = supabase.from('solar_products').select('*');
    
    if (query && query.trim() !== '') {
      const searchTerm = `%${query.trim()}%`;
      dbQuery = dbQuery.or(`name.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    const { data, error } = await dbQuery.limit(5);

    if (error) {
      console.error('❌ Search Error:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No products found.');
    } else {
      console.log(`✅ Found ${data.length} products:`);
      data.forEach(p => console.log(`- ${p.name} (${p.power_kw}kW): ${p.price_thb} THB`));
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

async function runTests() {
  await testSearch('5 kW');
  await testSearch('Sigenergy');
  await testSearch('Huawei');
}

runTests();
