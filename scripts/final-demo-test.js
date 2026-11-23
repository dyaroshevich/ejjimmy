const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function runFinalDemo() {
  console.log('🚀 Running Final End-to-End Test (Thai + Admin Link)...\n');

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // 1. Create a real lead in Supabase to get a real ID
  const testLeadName = "Demo: Somchai Test";
  const { data: newLead, error } = await supabase
    .from('leads')
    .insert([{
      name: testLeadName,
      phone: "081-DEMO-2026",
      location: "Ao Nang, Krabi",
      bill_amount: 4500,
      status: 'New (PWA Demo)',
      equipment_tier: 'Residential'
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase insert failed:', error);
    return;
  }

  console.log('✅ Lead created in Supabase with ID:', newLead.id);

  // 2. Call the LINE notification API with this real ID
  try {
    const response = await fetch('http://localhost:3001/api/notify-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: newLead.id,
        name: testLeadName,
        phone: "081-DEMO-2026",
        location: "Ao Nang, Krabi",
        segment: "home",
        monthly_bill: "4500",
        source: "AI Chat (Demo)"
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ LINE Notification sent successfully!');
      console.log('🔗 Link in LINE will point to lead:', newLead.id);
    } else {
      console.error('❌ LINE Notification failed:', result);
    }
  } catch (e) {
    console.error('❌ Fetch error:', e);
  }

  console.log('\n🏁 Test complete. Check your LINE for the Thai card + Admin button!');
}

runFinalDemo();
