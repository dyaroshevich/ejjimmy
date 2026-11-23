/**
 * Solar Calculator for LINE chatbot
 * Calculates system size, savings, and payback based on monthly bill
 */

import { supabase } from './supabase';

export interface SolarCalculationInput {
  monthlyBill: number;
  location?: string;
}

export interface SolarCalculationResult {
  recommendedSystemSize: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  systemCost: number;
  monthlyPayment: number;
  co2Reduction: number;
  tier: 'eco' | 'standard' | 'premium';
}

const PRICING = {
  eco: 34000,
  standard: 38000,
  premium: 42000
};

const ELECTRICITY_RATE = 4.2; // THB per kWh (PEA 2026 rate)
const DAYS_PER_MONTH = 30;
const RATE_PER_KW_MONTHLY = ELECTRICITY_RATE * DAYS_PER_MONTH; // 126 THB/kW/month
const SAVINGS_RATIO = 0.7;
const INSTALLMENT_MONTHS = 84; // Generic installment term (was Sofin-specific)
const CO2_PER_KW_YEAR = 800;

export function calculateSolar(input: SolarCalculationInput): SolarCalculationResult {
  const { monthlyBill } = input;

  const estimatedSystemKw = Math.max(3, Math.round(monthlyBill / RATE_PER_KW_MONTHLY * 10) / 10);

  const tier = estimatedSystemKw < 5 ? 'eco' : estimatedSystemKw < 10 ? 'standard' : 'premium';
  const pricePerKw = PRICING[tier];

  const systemCost = Math.round(estimatedSystemKw * pricePerKw);
  const monthlySavings = Math.round(monthlyBill * SAVINGS_RATIO);
  const annualSavings = monthlySavings * 12;
  const paybackYears = Number((systemCost / annualSavings).toFixed(1));

  const monthlyPayment = Math.round(systemCost / INSTALLMENT_MONTHS);
  const co2Reduction = Math.round(estimatedSystemKw * CO2_PER_KW_YEAR);

  return {
    recommendedSystemSize: estimatedSystemKw,
    monthlySavings,
    annualSavings,
    paybackYears,
    systemCost,
    monthlyPayment,
    co2Reduction,
    tier
  };
}

export function parseUserBillInput(text: string): number | null {
  const cleaned = text
    .replace(/[^0-9.]/g, '')
    .trim();

  if (!cleaned) return null;

  const bill = parseFloat(cleaned);
  if (isNaN(bill) || bill < 100 || bill > 100000) return null;

  return Math.round(bill);
}

export async function getProductsForCatalog(filter?: string): Promise<any[]> {
  console.log(`[DB] Fetching products for filter: ${filter}`);
  
  const { data, error } = await supabase
    .from('solar_products')
    .select('*')
    .order('power_kw', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  let products = data || [];
  console.log(`[DB] Total products fetched: ${products.length}`);

if (filter) {
    if (filter === 'residential') {
      // 3kW to 30kW for residential
      products = products.filter((p: any) =>
        p.type === 'system' &&
        Number(p.power_kw) >= 3 &&
        Number(p.power_kw) <= 30
      );
    }
 else if (filter === 'commercial') {
      // 20kW to 100kW
      products = products.filter((p: any) => 
        p.type === 'system' && 
        Number(p.power_kw) > 20 && 
        Number(p.power_kw) <= 100
      );
    } else if (filter === 'industrial') {
      // Over 100kW
      products = products.filter((p: any) => 
        (p.type === 'system' || p.type === 'inverter') && 
        Number(p.power_kw) >= 100
      );
    } else if (filter === 'battery') {
      // Any battery systems or smart chargers
      products = products.filter((p: any) => 
        p.name.includes('SigenStor') || 
        p.name.includes('kWh') || 
        p.name.includes('Charger') ||
        p.name.includes('Battery')
      );
    }
  } else {
    // Default: show basic systems
    products = products.filter((p: any) => p.type === 'system').slice(0, 10);
  }

  console.log(`[DB] Products after filtering: ${products.length}`);
  return products.slice(0, 10);
}