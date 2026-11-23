require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('ANON KEY:', supabaseAnonKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

supabase.from('solar_products').select('count', { count: 'exact' })
  .then(({ count, error }) => {
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }
    console.log('Success! Found', count, 'rows in solar_products table');
    process.exit(0);
  })
  .catch(err => {
    console.error('Exception:', err);
    process.exit(1);
  });