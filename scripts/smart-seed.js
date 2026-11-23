const { createClient } = require('@supabase/supabase-js');

const url = 'https://odolxtryjmfpzfmuhngo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2x4dHJ5am1mcHpmbXVobmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMjgxOCwiZXhwIjoyMDg4MDA4ODE4fQ.X_wvj6zxmquPmCV0jlAsAGPudjQn-Ej2Xe-suwUrgXE';

const supabase = createClient(url, key);

async function smartSeed() {
  console.log('🚀 Smart Seeding Leads...');
  
  // Проверяем доступные колонки
  const { data: sample } = await supabase.from('leads').select('*').limit(1);
  const cols = sample && sample.length > 0 ? Object.keys(sample[0]) : ['id', 'name', 'phone', 'line_id'];
  
  console.log('Available columns:', cols);

  const testLeads = [
    {
      name: 'Somchai Solar (Test)',
      phone: '0812345678',
      line_id: 'somchai_line',
      bill_amount: 4500,
      system_size: 5,
      status: 'New'
    },
    {
      name: 'Anna Krabi (Test)',
      phone: '0991112222',
      line_id: 'anna_k_line',
      bill_amount: 12000,
      system_size: 10,
      status: 'Contacted'
    }
  ];

  // Оставляем только те поля, которые есть в базе
  const safeLeads = testLeads.map(lead => {
    const safe = {};
    Object.keys(lead).forEach(k => {
      if (cols.includes(k)) safe[k] = lead[k];
    });
    return safe;
  });

  const { data, error } = await supabase.from('leads').insert(safeLeads).select();

  if (error) {
    console.error('❌ Error seeding:', error.message);
  } else {
    console.log('✅ Successfully seeded safe leads:', data.length);
    console.log('Admin UI will now show Phone and LINE icons for these leads!');
  }
}

smartSeed();
