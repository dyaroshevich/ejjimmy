const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLead() {
  console.log('🚀 Testing Lead Creation...');
  const testId = `test_${Date.now()}`;
  
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      name: 'Test Senior UI',
      phone: '099-999-9999',
      location: 'Ao Nang',
      bill_amount: 5000,
      system_size: 5,
      notes: 'This is a test lead to verify Senior UI and DB columns.',
      status: 'New'
    }])
    .select();

  if (error) {
    console.error('❌ Error creating lead:', error.message);
    if (error.message.includes('column "location" does not exist')) {
      console.log('👉 ACTION REQUIRED: You need to run the SQL in Supabase Dashboard first!');
    }
  } else {
    console.log('✅ Lead created successfully!', data);
  }
}

testLead();
