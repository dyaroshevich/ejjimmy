INSERT INTO public.solar_cases (
    slug, customer_name, location_name, lat, lng,
    system_kw, roof_type, inverter_brand, panel_brand,
    savings_annual_thb, payback_years,
    case_description, customer_quote,
    media_assets, metadata, published, created_at
) VALUES (
    'krabi-001',
    'ระบบไฮบริดสุดหรู 10kW - กระบี่',
    'จังหวัดกระบี่',
    8.07840123, 98.92267937,
    10.00, 'metal_sheet', 'Deye', 'Tier 1 Standard (16 pcs)',
    95000.00, 4.50,
    'โปรเจกต์ติดตั้งระบบโซลาร์เซลล์แบบไฮบริดระดับพรีเมียมขนาด 10kW สำหรับวิลล่าในจังหวัดกระบี่ ลูกค้าต้องการลดค่าไฟฟ้าที่พุ่งสูงขึ้นในช่วงฤดูร้อนและต้องการระบบสำรองไฟที่เชื่อถือได้ในกรณีที่เกิดไฟดับ

ทีมงาน Tawan Power ได้ออกแบบระบบโดยใช้แผงโซลาร์ประสิทธิภาพสูงจำนวน 16 แผง พร้อมอินเวอร์เตอร์ Deye และระบบกักเก็บพลังงานด้วยแบตเตอรี่ Dyness ขนาด 10kWh ซึ่งช่วยให้บ้านสามารถใช้พลังงานสะอาดได้แม้ในยามค่ำคืน',
    'The system has drastically reduced my electricity bills!',
    '{"cover":"krabi-001.png","video":"krabi-001.mp4","gallery":["1779681091103.jpg","1779681091334.jpg","1779681091454.jpg","1779681091773.jpg","1779681091838.jpg","1779681091904.jpg","1779681102957.jpg","1779681103039.jpg","1779681103087.jpg","1779681103133.jpg","1779681110450.jpg","1779681110584.jpg"]}',
    '{"battery":"Dyness 10kWh","inverter":"Deye 10kW Hybrid","system_type":"Hybrid Premium","panels_count":16,"mounting_time":"3 วัน","total_investment":576000}',
    true,
    '2026-05-25 06:37:40.750362+00'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.solar_cases (
    slug, customer_name, location_name, lat, lng,
    system_kw, roof_type, inverter_brand, panel_brand,
    savings_annual_thb, payback_years,
    case_description, customer_quote,
    media_assets, metadata, published, created_at
) VALUES (
    'krabi-002',
    'ระบบโซลาร์เซลล์ไฮบริด 20kW สำหรับธุรกิจ - กระบี่',
    'จังหวัดกระบี่',
    8.096000, 98.906000,
    20.00, 'metal_sheet', 'Deye', 'Tier 1 High Efficiency',
    180000.00, 5.0,
    'โครงการติดตั้งระบบโซลาร์เซลล์แบบไฮบริดขนาด 20kW สำหรับอาคารธุรกิจและที่พักในจังหวัดกระบี่ เจ้าของโครงการต้องการลดค่าใช้จ่ายด้านพลังงานที่เพิ่มสูงขึ้นจากการใช้งานเครื่องปรับอากาศ ระบบแสงสว่าง และอุปกรณ์ไฟฟ้าตลอดทั้งวัน พร้อมเพิ่มความมั่นคงด้านพลังงานในกรณีที่เกิดไฟฟ้าดับ

ทีมงาน Tawan Power ได้ออกแบบระบบโดยใช้แผงโซลาร์เซลล์ประสิทธิภาพสูงจำนวน 48 แผง ร่วมกับอินเวอร์เตอร์ Deye Hybrid ขนาด 20kW และแบตเตอรี่ Dyness ความจุ 20kWh เพื่อรองรับการใช้งานพลังงานในช่วงกลางวันและสำรองไฟสำหรับโหลดสำคัญในช่วงกลางคืน

ระบบช่วยลดค่าไฟฟ้าได้อย่างมีประสิทธิภาพ เพิ่มความต่อเนื่องในการดำเนินธุรกิจ และสร้างผลตอบแทนจากการลงทุนในระยะยาว',
    'ระบบนี้ช่วยลดค่าไฟฟ้าและเพิ่มความมั่นคงทางพลังงานให้กับธุรกิจของเราได้อย่างมาก',
    '{"cover":"krabi-002.png","video":"krabi-002.mp4","gallery":["krabi-002-gallery-01.png","krabi-002-gallery-02.png"]}',
    '{"battery":"Dyness 20kWh","inverter":"Deye 20kW Hybrid","system_type":"Hybrid Business","panels_count":48,"mounting_time":"4 วัน","total_investment":890000}',
    true,
    '2026-06-05 06:00:00+00'
) ON CONFLICT (slug) DO NOTHING;
