const { createClient } = require('@supabase/supabase-js');

const url = 'https://odolxtryjmfpzfmuhngo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2x4dHJ5am1mcHpmbXVobmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMjgxOCwiZXhwIjoyMDg4MDA4ODE4fQ.X_wvj6zxmquPmCV0jlAsAGPudjQn-Ej2Xe-suwUrgXE';

const supabase = createClient(url, key);

async function finalTest() {
  console.log('🚀 Creating the Perfect Lead...');
  
  const lead = {
    name: 'Elon Musk (Solar Test)',
    phone: '081-TAWAN-POWER',
    line_id: 'elon_solar',
    email: 'elon@spacex.com',
    location: 'Mars Colony 1',
    bill_amount: 99999,
    system_size: 100,
    notes: 'Customer wants to power his house on Mars with our Krabi-made panels. High priority!',
    status: 'New'
  };

  const { data, error } = await supabase.from('leads').insert([lead]).select();

  if (error) {
    console.error('❌ Test failed:', error.message);
  } else {
    console.log('✅ PERFECT LEAD CREATED!', data[0].id);
    console.log('Admin Dashboard link: https://tawanpower.vercel.app/admin');
  }
}

finalTest();
