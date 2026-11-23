import { createScopedClient as createClient } from '@/lib/supabase-server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export interface PDFData {
  customerName: string;
  systemKw: number;
  location: string;
  monthlyBill: number;
  monthlySavings: number;
  paybackYears: number;
  totalCost: number;
  tiers: {
    eco: any;
    premium: any;
    ultra: any;
  };
  // Generic installment breakdown. Sofin-specific naming removed — see docs/SOFIN_FEATURE_FLAG.md
  installmentCalculation: {
    downPayment: number;
    monthly36: number;
    monthly60: number;
  };
  co2Year?: number;
  treesYear?: number;
  scenario?: 'sample' | 'personal' | 'selected';
  selectedTier?: 'eco' | 'premium' | 'ultra';
  phone?: string;
  email?: string;
  lineId?: string;
  createdAt?: string;
  roofType?: string;
  customFields?: {
    basePrice: number;
    manpower: number;
    discountPercent: number;
    installationDays: number;
    maintenanceVisits: number;
  };
  engineerName?: string;
  engineerTitle?: string;
}

export class PDFGenerator {
  public static async getProductTiers(powerKw: number) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: products } = await supabase
      .from('solar_products')
      .select('*')
      .eq('type', 'system')
      .gte('power_kw', powerKw * 0.7)
      .lte('power_kw', powerKw * 1.5)
      .order('price_thb', { ascending: true });

    if (!products || products.length === 0) return null;
    return {
      eco: products[0],
      premium: products.find(p => p.brand?.toLowerCase().includes('longi')) || products[1] || products[0],
      ultra: products.find(p => p.name.toLowerCase().includes('hybrid')) || products[products.length - 1]
    };
  }

  public static async generateProposal(html: string): Promise<Buffer | null> {
    const pdfsparkUrl = 'https://pdfspark.dev/api/v1/pdf/from-html';
    const MAX_RETRIES = 2;
    const RETRY_DELAYS_MS = [3000, 6000];
    const TIMEOUT_MS = 25000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(pdfsparkUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }

        const errText = await response.text();
        
        if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS_MS[attempt - 1] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
          console.log(`[PDF] PDFSpark ${response.status} (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        console.error(`[PDF] PDFSpark error (${response.status}): ${errText.slice(0, 200)}`);
        return null;
      } catch (err: any) {
        clearTimeout(timeout);
        
        if (err.name === 'AbortError' && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS_MS[attempt - 1] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
          console.log(`[PDF] PDFSpark timeout (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        console.error(`[PDF] PDF generation failed (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
        return null;
      }
    }

    console.error('[PDF] All PDF generation attempts failed');
    return null;
  }
}
