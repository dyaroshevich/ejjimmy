const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://odolxtryjmfpzfmuhngo.supabase.co';
const supabaseKey = 'sb_publishable_u_KIQ_gT0YZGz6pU8f0lIA_Ca8fbcBW';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
  console.log('--- Deep Check Supabase Content ---');
  
  // 1. Try to fetch ANY 5 products
  const { data: products, error: pError, count: pCount } = await supabase
    .from('solar_products')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (pError) {
    console.error('❌ solar_products read error:', pError.message);
  } else {
    console.log(`✅ solar_products: count=${pCount}, fetched=${products?.length}`);
    if (products && products.length > 0) {
      console.log('Sample product:', products[0].name);
    }
  }

  // 2. Try to fetch ANY 5 leads
  const { data: leads, error: lError, count: lCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (lError) {
    console.error('❌ leads read error:', lError.message);
  } else {
    console.log(`✅ leads: count=${lCount}, fetched=${leads?.length}`);
    if (leads && leads.length > 0) {
      console.log('Sample lead:', leads[0].name || leads[0].email || leads[0].id);
    }
  }

  // 3. Check if there are other tables by listing from a common query
  // Since we don't have admin access here, we can only check what we know.
}

checkContent();
