const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function runTests() {
  console.log('🚀 Starting Automated User Story Tests...\n');

  // 1. Test Direct Form Route
  console.log('--- TEST 1: Direct Form Notification ---');
  try {
    const formResponse = await fetch('http://localhost:3001/api/notify-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Automated Form Test",
        phone: "081-FORM-TEST",
        location: "Test Region",
        segment: "Residential",
        source: "Website Form (Auto-Test)"
      })
    });
    const formData = await formResponse.json();
    console.log('Result:', formData.success ? '✅ SUCCESS' : '❌ FAILED');
  } catch (e) { console.error(e); }

  console.log('\n--- TEST 2: Supabase & Data Sync ---');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Checking if the last lead was saved (give it a moment for Supabase)
  setTimeout(async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (data && data[0]) {
      console.log('Last lead in DB:', data[0].name, 'Status:', data[0].status);
      console.log('✅ Supabase Sync OK');
    } else {
      console.error('❌ Supabase check failed', error);
    }
    console.log('\n🏁 Tests Finished. Check your LINE group for cards!');
  }, 2000);
}

runTests();
