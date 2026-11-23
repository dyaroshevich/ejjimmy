import { PDFGenerator, PDFData } from './generator';

const pn = (n: number) => new Intl.NumberFormat('th-TH').format(n);

function safePaybackYears(leadVal: string | null | undefined, fallback: number): number {
  if (leadVal) {
    const n = Number(leadVal);
    if (!isNaN(n) && n > 0) return n;
  }
  return fallback;
}

type WarrantyOverrides = {
  system_warranty?: string | null;
  inverter_warranty?: string | null;
  panel_warranty?: string | null;
  panel_product_warranty?: string | null;
  panel_performance_warranty?: string | null;
};

function fmtWarranty(val: string | null | undefined): string | undefined {
  if (!val) return undefined;
  const n = Number(val);
  return isNaN(n) ? val : `${n} ปี`;
}

function buildDefaultTiers(
  cost: number,
  savings: number,
  scenario: 'sample' | 'personal' | 'selected',
  overrides?: WarrantyOverrides
): NonNullable<PDFData['tiers']> {
  const shortDesc = scenario === 'selected';
  const isSample = scenario === 'sample';
  const ecoPrice = isSample ? cost * 0.9 : cost * 0.85;
  const ultraPrice = isSample ? cost * 1.25 : cost * 1.3;

  function pick(key: string, defaultVal: string): string {
    const raw = overrides?.[key as keyof WarrantyOverrides];
    if (!raw) return defaultVal;
    return fmtWarranty(raw) ?? defaultVal;
  }

  function pickPanelWarranty(): string {
    if (overrides?.panel_warranty) return overrides.panel_warranty;
    if (overrides?.panel_product_warranty && overrides?.panel_performance_warranty) {
      return `${overrides.panel_product_warranty}/${overrides.panel_performance_warranty} ปี`;
    }
    return '12/30 ปี';
  }

  return {
    eco: {
      name: 'Eco System',
      price_thb: Math.round(ecoPrice),
      image_url: '',
      brand: 'Jinko',
      description: shortDesc ? 'ระบบ On-Grid มาตรฐาน ราคาจับต้องได้' : 'ระบบ On-Grid มาตรฐาน ราคาจับต้องได้ เริ่มต้นประหยัดค่าไฟ',
      specifications: {
        inverter_model: 'GoodWe GW5000',
        system_warranty: pick('system_warranty', '3 ปี'),
        panel_warranty: pickPanelWarranty(),
        monthly_savings: `~${pn(savings)} บาท/เดือน`,
      },
      included_services: ['บริการขออนุญาต PEA/MEA', 'ติดตั้งโดยวิศวกร', 'Monitoring APP'],
    },
    premium: {
      name: 'Premium System',
      price_thb: Math.round(cost),
      image_url: '',
      brand: 'Longi',
      description: shortDesc ? 'แผง Tier-1 อินเวอร์เตอร์ Huawei คุณภาพสูง' : 'แผง Tier-1 อินเวอร์เตอร์ Huawei คุณภาพสูง ประหยัดสูงสุด',
      specifications: {
        inverter_model: 'Huawei SUN2000',
        system_warranty: pick('system_warranty', '10 ปี'),
        panel_warranty: pickPanelWarranty(),
        inverter_warranty: pick('inverter_warranty', 'รับประกัน 10 ปี'),
        monthly_savings: `~${pn(savings)} บาท/เดือน`,
      },
      included_services: ['บริการขออนุญาต PEA/MEA', 'ติดตั้งโดยวิศวกร', 'Monitoring APP', 'บำรุงรักษาปีละ 1 ครั้ง'],
    },
    ultra: {
      name: 'Ultra Hybrid System',
      price_thb: Math.round(ultraPrice),
      image_url: '',
      brand: 'Sigenergy',
      description: 'ระบบ Hybrid พร้อมแบตเตอรี่สำรอง ใช้ไฟได้แม้ไฟดับ',
      specifications: {
        inverter_model: 'Sigen Inverter',
        system_warranty: pick('system_warranty', '10 ปี'),
        battery_warranty: '10 ปี',
        panel_warranty: pickPanelWarranty(),
        monthly_savings: `~${pn(savings)} บาท/เดือน`,
        ups_function: 'รองรับ Backup',
      },
      included_services: ['บริการขออนุญาต PEA/MEA', 'ติดตั้งโดยวิศวกร', 'Monitoring APP', 'บำรุงรักษาปีละ 2 ครั้ง'],
    },
  };
}

export interface DbLead {
  id: number;
  name: string | null;
  phone: string | null;
  line_id: string | null;
  email: string | null;
  location: string | null;
  status: string | null;
  equipment_tier: string | null;
  system_size: number | null;
  bill_amount: string | null;
  base_price: string | null;
  manpower: string | null;
  discount_percent: string | null;
  installation_days: string | null;
  maintenance_visits: string | null;
  system_warranty: string | null;
  inverter_warranty: string | null;
  panel_warranty: string | null;
  panel_product_warranty?: string | null;
  panel_performance_warranty?: string | null;
  payback_years: string | null;
  selected_product_id?: string | null;
  proposal_url: string | null;
  proposal_images: string[] | null;
  [key: string]: any;
}

function applyWarrantyOverlays(
  tiers: NonNullable<PDFData['tiers']>,
  overrides?: WarrantyOverrides
): NonNullable<PDFData['tiers']> {
  if (!overrides) return tiers;
  const keys = ['eco', 'premium', 'ultra'] as const;
  for (const key of keys) {
    const t = tiers[key];
    if (!t || !t.specifications) continue;
    const specs = t.specifications;
    const sysW = fmtWarranty(overrides.system_warranty);
    if (sysW) specs.system_warranty = sysW;
    const invW = fmtWarranty(overrides.inverter_warranty);
    if (invW) specs.inverter_warranty = invW;
    if (overrides.panel_warranty) {
      specs.panel_warranty = overrides.panel_warranty;
    } else if (overrides.panel_product_warranty && overrides.panel_performance_warranty) {
      specs.panel_warranty = `${overrides.panel_product_warranty}/${overrides.panel_performance_warranty} ปี`;
    }
  }
  return tiers;
}

export async function buildPDFData(
  lead: DbLead,
  options?: { overrideTier?: string | null }
): Promise<PDFData> {
  const normalizedTier = lead.equipment_tier?.toLowerCase().trim();
  const hasSelectedTier = ['eco', 'premium', 'ultra'].includes(normalizedTier || '');

  const hasCalculatedData = lead.bill_amount && Number(lead.bill_amount) > 0;

  const hasCustomOffer = !!lead.base_price || !!lead.system_size;

  if (!hasCalculatedData) {
    if (!hasCustomOffer) {
      const defaultKw = 5;
      const defaultCost = 200000;
      const savings = Math.round(4000 * 0.5);
      const tiers = await PDFGenerator.getProductTiers(defaultKw);

      return {
        customerName: lead.name || 'ลูกค้า',
        scenario: 'sample',
        systemKw: defaultKw,
        location: lead.location || 'กระบี่',
        monthlyBill: 4000,
        monthlySavings: savings,
        paybackYears: safePaybackYears(lead.payback_years, Math.round(defaultCost / (savings * 12))),
        totalCost: defaultCost,
        tiers: tiers || buildDefaultTiers(defaultCost, savings, 'sample'),
        installmentCalculation: {
          downPayment: Math.round(defaultCost * 0.1),
          monthly36: Math.round(defaultCost * 0.03),
          monthly60: Math.round(defaultCost * 0.02),
        },
        co2Year: Number((defaultKw * 1.3).toFixed(1)),
        treesYear: Math.round(defaultKw * 1.3 * 50),
        phone: lead.phone || undefined,
        email: lead.email || undefined,
        lineId: lead.line_id || undefined,
        createdAt: (lead as any).created_at || undefined,
        roofType: (lead as any).roof_type || undefined,
      };
    }

    // Has custom offer data but no bill_amount — use custom fields with estimated bill
    const systemSizeNum = Number(lead.system_size);
    const systemKw = systemSizeNum > 0 ? systemSizeNum : 5;
    const basePrice = Number(lead.base_price) || (systemKw * 40000);
    const manpower = Number(lead.manpower) || 0;
    const discountPercent = Number(lead.discount_percent) || 0;
    const discountAmount = Math.round(basePrice * discountPercent / 100);
    const totalCost = Math.round(basePrice + manpower - discountAmount);
    const estimatedBill = Math.round(systemKw * 800);
    const monthlySavings = Math.round(estimatedBill * 0.5);
    const tiers = await PDFGenerator.getProductTiers(systemKw);

    const warrantyOverrides = {
      system_warranty: lead.system_warranty,
      inverter_warranty: lead.inverter_warranty,
      panel_warranty: lead.panel_warranty,
      panel_product_warranty: lead.panel_product_warranty,
      panel_performance_warranty: lead.panel_performance_warranty,
    };

    const scenario = hasSelectedTier ? 'selected' as const : 'personal' as const;

    const resolvedTiers = tiers
      ? applyWarrantyOverlays(tiers, warrantyOverrides)
      : buildDefaultTiers(totalCost, monthlySavings, scenario, warrantyOverrides);

    return {
      customerName: lead.name || 'ลูกค้า',
      scenario,
      selectedTier: hasSelectedTier ? normalizedTier as 'eco' | 'premium' | 'ultra' : undefined,
      systemKw,
      location: lead.location || 'กระบี่',
      monthlyBill: estimatedBill,
      monthlySavings,
      paybackYears: safePaybackYears(lead.payback_years, Math.round(totalCost / (monthlySavings * 12))),
      totalCost,
      tiers: resolvedTiers,
      installmentCalculation: {
        downPayment: Math.round(totalCost * 0.1),
        monthly36: Math.round(totalCost * 0.03),
        monthly60: Math.round(totalCost * 0.02),
      },
      co2Year: Number((systemKw * 1.3).toFixed(1)),
      treesYear: Math.round(systemKw * 1.3 * 50),
      phone: lead.phone || undefined,
      email: lead.email || undefined,
      lineId: lead.line_id || undefined,
      createdAt: (lead as any).created_at || undefined,
      roofType: (lead as any).roof_type || undefined,
      customFields: {
        basePrice,
        manpower,
        discountPercent,
        installationDays: Number(lead.installation_days) || 0,
        maintenanceVisits: Number(lead.maintenance_visits) || 0,
      },
    };
  }

  // Has calculated data (bill_amount + custom offer)
  const systemSizeNum = Number(lead.system_size);
  const systemKw = systemSizeNum > 0 ? systemSizeNum : 5;
  const monthlyBill = Number(lead.bill_amount) || 4000;
  const monthlySavings = Math.round(monthlyBill * 0.5);

  const basePrice = Number(lead.base_price) || (systemKw * 40000);
  const manpower = Number(lead.manpower) || 0;
  const discountPercent = Number(lead.discount_percent) || 0;
  const discountAmount = Math.round(basePrice * discountPercent / 100);
  const totalCost = Math.round(basePrice + manpower - discountAmount);

  const paybackYears = safePaybackYears(lead.payback_years, Math.round(totalCost / (monthlySavings * 12)));

  const tiers = await PDFGenerator.getProductTiers(systemKw);

  const warrantyOverrides = {
    system_warranty: lead.system_warranty,
    inverter_warranty: lead.inverter_warranty,
    panel_warranty: lead.panel_warranty,
    panel_product_warranty: lead.panel_product_warranty,
    panel_performance_warranty: lead.panel_performance_warranty,
  };

  const scenario = hasSelectedTier ? 'selected' as const : 'personal' as const;

  const resolvedTiers = tiers
    ? applyWarrantyOverlays(tiers, warrantyOverrides)
    : buildDefaultTiers(totalCost, monthlySavings, scenario, warrantyOverrides);

  return {
    customerName: lead.name || 'ลูกค้า',
    scenario,
    selectedTier: hasSelectedTier ? normalizedTier as 'eco' | 'premium' | 'ultra' : undefined,
    systemKw,
    location: lead.location || 'กระบี่',
    monthlyBill,
    monthlySavings,
    paybackYears,
    totalCost,
    tiers: resolvedTiers,
    installmentCalculation: {
      downPayment: Math.round(totalCost * 0.1),
      monthly36: Math.round(totalCost * 0.03),
      monthly60: Math.round(totalCost * 0.02),
    },
    co2Year: Number((systemKw * 1.3).toFixed(1)),
    treesYear: Math.round(systemKw * 1.3 * 50),
    phone: lead.phone || undefined,
    email: lead.email || undefined,
    lineId: lead.line_id || undefined,
    createdAt: (lead as any).created_at || undefined,
    roofType: (lead as any).roof_type || undefined,
    customFields: {
      basePrice,
      manpower,
      discountPercent,
      installationDays: Number(lead.installation_days) || 0,
      maintenanceVisits: Number(lead.maintenance_visits) || 0,
    },
  };
}
