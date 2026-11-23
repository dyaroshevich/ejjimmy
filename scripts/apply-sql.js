const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first. Never commit keys to this file.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function apply() {
  console.log('🚀 Applying DB changes via Service Role...');
  
  // В Supabase JS нет прямого метода для SQL, но мы можем использовать rpc('exec_sql') 
  // если он был создан ранее. Если нет - я попробую через CLI еще раз теперь когда я залогинен.
  
  const { error } = await supabase.rpc('exec_sql', { 
    sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT; 
          ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS location TEXT; 
          ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT; 
          ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS equipment_tier TEXT; 
          ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS survey_date TIMESTAMPTZ;` 
  });

  if (error) {
    console.log('RPC exec_sql not found, trying CLI push...');
  } else {
    console.log('✅ Columns added successfully via RPC!');
  }
}

apply();
