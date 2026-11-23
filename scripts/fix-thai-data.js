const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const products = [
  {
    id: "package-goodwe-5kw",
    name: "Solar Package 5 kW (GoodWe)",
    brand: "GoodWe",
    model: "GW5000-NS",
    type: "package",
    power_kw: 5,
    price_thb: 120000,
    description: "ลดค่าไฟได้ประมาณ 2,500 บาท/เดือน เหมาะสำหรับบ้านพักอาศัย",
    specifications: {
      "Inverter": "GoodWe 5 kW 1 ph (รับประกัน 5 ปี)",
      "Panels": "Jinko 715W x 8 แผง (รับประกัน 25 ปี)",
      "Saving": "ประหยัดไฟ 2,500 บาท/เดือน",
      "Warranty": "ล้างแผงฟรี 3 ปี, ตรวจเช็คฟรี 3 ปี",
      "System": "On-Grid เชื่อมต่อ PEA/MEA"
    }
  },
  {
    id: "package-goodwe-10kw",
    name: "Solar Package 10 kW (GoodWe)",
    brand: "GoodWe",
    model: "GW10K-DT",
    type: "package",
    power_kw: 10,
    price_thb: 228000,
    description: "ลดค่าไฟได้ประมาณ 5,000 บาท/เดือน สำหรับบ้านขนาดกลางหรือโฮมออฟฟิศ",
    specifications: {
      "Inverter": "GoodWe 10 kW 3 ph (รับประกัน 5 ปี)",
      "Panels": "Jinko 715W x 16 แผง (รับประกัน 25 ปี)",
      "Saving": "ประหยัดไฟ 5,000 บาท/เดือน",
      "System": "On-Grid เชื่อมต่อ PEA/MEA"
    }
  },
  {
    id: "package-huawei-100kw",
    name: "Solar Package 100 kW (Huawei)",
    brand: "Huawei",
    model: "SUN2000-100KTL",
    type: "package",
    power_kw: 100,
    price_thb: 1900000,
    description: "แพ็คเกจ 100 kW สำหรับโรงงานหรือโรงแรม ประหยัดไฟ 50,000 บาท/เดือน",
    specifications: {
      "Inverter": "Huawei 100 kW 3 ph (รับประกัน 10 ปี)",
      "Panels": "Jinko 635W x 160 แผง (รับประกัน 25 ปี)",
      "Saving": "ประหยัดไฟ 50,000 บาท/เดือน",
      "Maintenance": "ดูแลระบบฟรี 4 ปี"
    }
  },
  {
    id: "sigenergy-sigenstor-5kw",
    name: "Sigenergy SigenStor 5 kW (5-in-1)",
    brand: "Sigenergy",
    model: "SigenStor 5-in-1",
    type: "system",
    power_kw: 5,
    price_thb: 375000,
    description: "ระบบ AI Energy 5-in-1 รวม Inverter, Battery, EV Charger เข้าด้วยกัน",
    specifications: {
      "Capacity": "Battery 6.0 kWh",
      "Panels": "Jinko 630W x 12 แผง",
      "Features": "AI Management, Smart App, Real-time Monitoring",
      "EV_Charger": "รองรับการเพิ่ม DC Charger"
    }
  },
  {
    id: "package-solaredge-1mw",
    name: "Solar Package 1 MW (SolarEdge)",
    brand: "SolarEdge",
    model: "SE-1MW-PRO",
    type: "package",
    power_kw: 1000,
    price_thb: 22000000,
    description: "โซลูชันขนาดใหญ่ 1 เมกะวัตต์ สำหรับอุตสาหกรรม ประหยัดไฟ 500,000 บาท/เดือน",
    specifications: {
      "Inverter": "SolarEdge 100 kW x 10 เครื่อง",
      "Optimizer": "รองรับระบบความปลอดภัยสูงสุด",
      "Panels": "Jinko 635W x 1,600 แผง",
      "System": "High-Efficiency 100%"
    }
  }
];

async function fixData() {
  console.log('Cleaning and reloading Thai solar products...');
  
  // 1. Delete all existing products to clear question marks
  const { error: deleteError } = await supabase
    .from('solar_products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('Error cleaning table:', deleteError);
    return;
  }

  console.log('Table cleaned. Inserting fresh data...');

  // 2. Insert new data
  for (const product of products) {
    const { error } = await supabase
      .from('solar_products')
      .insert([{
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error(`Error inserting ${product.id}:`, error);
    } else {
      console.log(`Successfully added: ${product.name}`);
    }
  }

  console.log('Reload complete!');
}

fixData();
