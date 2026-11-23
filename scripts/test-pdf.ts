import { PDFGenerator } from '../src/lib/pdf/generator';

const tiers = {
  eco: { name: 'ECO 5kW', price_thb: 120000, image_url: '', brand: 'GoodWe', description: 'Start', specifications: { inverter_model: 'GW5000', panel_warranty: '12/30', system_warranty: '3', monthly_savings: '~2,500' }, included_services: ['ติดตั้ง', 'ขออนุญาต'] },
  premium: { name: 'PREMIUM 5kW', price_thb: 185000, image_url: '', brand: 'Huawei', description: 'Best', specifications: { inverter_model: 'SUN2000', panel_warranty: '12/30', system_warranty: '10', inverter_warranty: '10', monthly_savings: '~3,500' }, included_services: ['ติดตั้ง', 'ขออนุญาต', 'บำรุงรักษา'] },
  ultra: { name: 'ULTRA Hybrid', price_thb: 280000, image_url: '', brand: 'Sigenergy', description: 'Hybrid', specifications: { inverter_model: 'Sigen 5kW', panel_warranty: '12/30', system_warranty: '10', battery_warranty: '10', monthly_savings: '~4,500', ups_function: 'Backup' }, included_services: ['ติดตั้ง', 'ขออนุญาต', 'บำรุงรักษา 2ครั้ง'] }
};
const sofin = { downPayment: 20000, monthly36: 5200, monthly60: 3400 };

(async () => {
  for (const { name, data } of [
    { name: 'A_Sample', data: { customerName: 'คุณสมชาย', scenario: 'sample', systemKw: 5, location: 'กระบี่', monthlyBill: 4000, monthlySavings: 2000, paybackYears: 5, totalCost: 200000, tiers, sofinCalculation: sofin } },
    { name: 'B_Personal', data: { customerName: 'คุณสมชาย', scenario: 'personal', systemKw: 10, location: 'อ่าวนาง', monthlyBill: 8000, monthlySavings: 4000, paybackYears: 4, totalCost: 400000, tiers, sofinCalculation: { downPayment: 40000, monthly36: 10400, monthly60: 6800 } } },
    { name: 'C_Selected', data: { customerName: 'คุณสมชาย', scenario: 'selected', selectedTier: 'premium', systemKw: 5, location: 'กระบี่', monthlyBill: 3500, monthlySavings: 1750, paybackYears: 4, totalCost: 200000, tiers, sofinCalculation: sofin } }
  ]) {
    console.log(`Generating ${name}...`);
    const buf = await PDFGenerator.generateProposal(data as any);
    const fs = await import('fs');
    const path = await import('path');
    fs.writeFileSync(path.resolve(process.cwd(), `test-${name}.pdf`), buf);
    console.log(`  ✅ ${(buf.length / 1024).toFixed(0)} KB`);
  }
  console.log(`\nГотово: test-A_Sample.pdf, test-B_Personal.pdf, test-C_Selected.pdf`);
})();
