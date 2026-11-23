const { createClient } = require('@supabase/supabase-js');

const url = 'https://odolxtryjmfpzfmuhngo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2x4dHJ5am1mcHpmbXVobmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMjgxOCwiZXhwIjoyMDg4MDA4ODE4fQ.X_wvj6zxmquPmCV0jlAsAGPudjQn-Ej2Xe-suwUrgXE';

const supabase = createClient(url, key);

async function seed() {
  console.log('🚀 Seeding realistic test leads...');
  
  const testLeads = [
    {
      name: 'Somchai Solar',
      phone: '0812345678',
      line_id: 'somchai_line',
      email: 'somchai@example.com',
      location: 'Ao Nang',
      bill_amount: 4500,
      system_size: 5,
      status: 'New'
    },
    {
      name: 'Anna Krabi',
      phone: '0991112222',
      line_id: 'anna_k',
      email: 'anna.k@gmail.com',
      location: 'Krabi Town',
      bill_amount: 12000,
      system_size: 10,
      status: 'Contacted'
    }
  ];

  const { data, error } = await supabase.from('leads').insert(testLeads).select();

  if (error) {
    console.error('❌ Error seeding:', error.message);
  } else {
    console.log('✅ Successfully seeded leads:', data.length);
  }
}

seed();
