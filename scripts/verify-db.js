const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://odolxtryjmfpzfmuhngo.supabase.co';
const supabaseKey = 'sb_publishable_u_KIQ_gT0YZGz6pU8f0lIA_Ca8fbcBW';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('--- Verifying Supabase Tables ---');
  
  // 1. Check solar_products
  const { data: products, error: pError } = await supabase
    .from('solar_products')
    .select('count', { count: 'exact', head: true });
  
  if (pError) {
    console.error('❌ solar_products table error:', pError.message);
  } else {
    console.log('✅ solar_products table exists. Rows:', products?.length || 0);
  }

  // 2. Check leads
  const { data: leads, error: lError } = await supabase
    .from('leads')
    .select('count', { count: 'exact', head: true });
  
  if (lError) {
    console.error('❌ leads table error:', lError.message);
    if (lError.message.includes('does not exist')) {
      console.log('💡 Table "leads" needs to be created.');
    }
  } else {
    console.log('✅ leads table exists. Rows:', leads?.length || 0);
  }
}

verify();
