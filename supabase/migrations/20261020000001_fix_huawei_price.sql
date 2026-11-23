-- Fix "ชุดโซลาร์ 100 kW (Huawei)": ฿190,000 is the inverter's price, not the system's.
-- Distributor-level full-system price for a 100 kW Huawei install in Thailand: ฿1,450,000.
UPDATE public.solar_products
SET price_thb = 1450000
WHERE name = 'ชุดโซลาร์ 100 kW (Huawei)' AND price_thb = 190000;
