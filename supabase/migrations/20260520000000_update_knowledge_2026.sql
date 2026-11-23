-- Update Knowledge Base with May 2026 PEA Tariffs and Subsidies
-- This ensures the RAG system has the most up-to-date information for AI Tan

INSERT INTO knowledge (content, metadata) VALUES 
(
  'PEA Residential Electricity Tariffs (May 2026): The current rate for residential households in Krabi and Phuket is approximately 4.18 - 4.20 THB per kWh. This rate includes the base tariff and the quarterly Ft (Fuel Adjustment Charge). For households with solar, Time-of-Use (TOU) rates are highly recommended: On-Peak (9:00-22:00 Mon-Fri) at ~5.8 THB/kWh and Off-Peak (22:00-9:00 Mon-Fri, all day Sat-Sun/Holidays) at ~2.6 THB/kWh. Installing solar helps offset the expensive On-Peak usage.',
  '{"category": "Tariff", "title": "PEA Residential Rates 2026", "tags": ["pricing", "pea", "tou", "krabi", "phuket"]}'
),
(
  'Solar Subsidies & Net Metering in Thailand (2026): The "Solar Rooftop" program (โครงการโซลาร์ภาคประชาชน) allows residential users to sell excess electricity back to the PEA at a Feed-in Tariff (FiT) rate of 2.20 THB per kWh. This is fixed for a 10-year contract. Additionally, the Board of Investment (BOI) and Ministry of Finance allow a personal income tax deduction for solar installation costs on residential properties up to 200,000 THB, which can be claimed over 5 years (40,000 THB per year).',
  '{"category": "Policy", "title": "Subsidies & FiT 2026", "tags": ["subsidy", "fit", "tax", "incentive"]}'
);
