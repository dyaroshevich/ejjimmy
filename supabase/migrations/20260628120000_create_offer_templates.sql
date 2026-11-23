-- Create offer_templates table for quick offer presets
CREATE TABLE IF NOT EXISTS offer_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  equipment_tier TEXT,
  manpower NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  installation_days INTEGER NOT NULL DEFAULT 3,
  maintenance_visits INTEGER NOT NULL DEFAULT 3,
  system_warranty INTEGER,
  inverter_warranty INTEGER,
  panel_product_warranty INTEGER,
  panel_performance_warranty INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE offer_templates ENABLE ROW LEVEL SECURITY;

-- Admin can manage templates
CREATE POLICY "Admins can manage offer templates"
  ON offer_templates FOR ALL
  USING (auth.role() = 'service_role');

-- Seed default templates
INSERT INTO offer_templates (name, label, description, equipment_tier, manpower, discount_percent, installation_days, maintenance_visits, system_warranty, inverter_warranty, panel_product_warranty, panel_performance_warranty)
VALUES
  ('eco-standard', 'Eco Standard', 'เน้นความคุ้มค่าสูงสุด คืนทุนไวที่สุด ใช้อุปกรณ์มาตรฐานอุตสาหกรรม (แผง Jinko/Longi, อินเวอร์เตอร์ Huawei/Solis)', 'eco', 15000, 5, 3, 3, 3, 5, 12, 25),
  ('premium-optimizer', 'Premium Optimizer', 'แผงประสิทธิภาพสูงพร้อมระบบ Optimizer เพื่อประสิทธิภาพสูงสุดในสภาวะแสงน้อยหรือมีเงาบัง', 'premium', 25000, 10, 4, 5, 5, 10, 12, 30),
  ('premium-micro', 'Premium Micro-Inv', 'ระบบ Micro-inverter (Hoymiles) สำหรับบ้านที่มีเงาบังหลายจุด ติดตั้งง่าย ขยายระบบได้', 'premium', 30000, 10, 4, 5, 5, 12, 12, 25),
  ('ultra-vip', 'Ultra VIP', 'เกรดอุปกรณ์ระดับ Top ของโลก (แผง AIKO/Maxeon, อินเวอร์เตอร์ Enphase) ประกันยาวนานที่สุด บริการหลังการขายระดับพิเศษ', 'ultra', 40000, 15, 5, 8, 10, 25, 25, 40),
  ('personal', 'Personal', 'ปรับแต่งตามความต้องการเฉพาะของลูกค้า หรือสเปกที่ลูกค้ากำหนดเอง', NULL, 20000, 0, 3, 3, 3, 5, 12, 25)
ON CONFLICT (name) DO NOTHING;
