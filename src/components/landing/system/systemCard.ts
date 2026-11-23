import { SolarProduct } from '@/lib/solar/products';
import { categoryOfRow, monthlyInstalment, type SystemCat } from '@/lib/domain.config';

export type { SystemCat };

/** Products-namespace labels for the raw `type` a non-system row carries. */
export const TYPE_KEY: Record<string, string> = {
  accessory: 'typeAccessory',
  inverter: 'typeInverter',
  panel: 'typePanel',
  battery: 'typeBattery',
  charger: 'typeCharger',
  mounting: 'typeMounting',
  package: 'typePackage',
};

/** One line of the position's spec table: the row's own key, humanised, and its value. */
export interface SpecRow {
  label: string;
  value: string;
}

/** A `type: 'system'` row reduced to what the catalog card can honestly render. */
export interface SystemCard {
  id: string;
  name: string;
  model: string;
  brand: string;
  brandMark: string;
  photo: string | null;
  kind: string;
  subCategory: string | null;
  cat: SystemCat;
  powerKw: number | null;
  priceThb: number | null;
  savingsThb: number | null;
  savingsApprox: boolean;
  specLine: string | null;
  monitoring: string | null;
  battery: string | null;
  paybackYears: number | null;
  warrantyProduct: number | null;
  warrantyPerformance: number | null;
  description: string | null;
  specs: SpecRow[];
}

function specText(product: SolarProduct, key: string): string {
  const v = product.specifications?.[key];
  return typeof v === 'string' || typeof v === 'number' ? String(v) : '';
}

function firstNumber(text: string): number | null {
  const m = text.match(/\d[\d,]*(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function allNumbers(text: string): number[] {
  return (text.match(/\d+/g) ?? []).map(Number);
}

// The tier rule (5 kW boundary, which brands count as hybrid) lives in `domain.config.ts`: it is a
// business decision, and this file used to spell `sigenergy` out as one.
function categoryOf(product: SolarProduct): SystemCat {
  return categoryOfRow({
    type: product.type,
    power_kw: product.power_kw,
    brand: product.brand,
    typeText: specText(product, 'type'),
  });
}

/** The same term the LINE flow quotes — one function now, not a copy of the arithmetic. */
export function installmentThb(priceThb: number | null): number | null {
  return monthlyInstalment(priceThb);
}

/**
 * `specifications` is a free-form per-row map, so the modal shows whatever the row carries instead of a
 * fixed list — humanising the key is all the translation this gets.
 * ponytail: spec labels read as English (`panel_warranty` → "Panel warranty") inside a th/ru page; a
 * per-key label table × 8 locales is an owner decision, and a row with a new key would go unlabelled until
 * that table is edited.
 */
function specRows(product: SolarProduct): SpecRow[] {
  return Object.entries(product.specifications ?? {})
    .filter(([, v]) => (typeof v === 'string' ? v.trim() !== '' : typeof v === 'number' ? Number.isFinite(v) : v === true))
    .map(([key, v]) => {
      const label = key.replace(/[_\s]+/g, ' ').trim();
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: v === true ? '✓' : String(v),
      };
    });
}

export function toSystemCard(product: SolarProduct): SystemCard {
  const panel = specText(product, 'panel_warranty');
  const panelYears = allNumbers(panel);

  return {
    id: product.id,
    name: product.name,
    model: product.model,
    brand: product.brand,
    brandMark: `/content/brands/${product.brand.toLowerCase().replace(/\s+/g, '-')}.webp`,
    photo: product.image_url ?? null,
    kind: product.type,
    subCategory: specText(product, 'sub_category') || null,
    cat: categoryOf(product),
    powerKw: product.power_kw ?? null,
    priceThb: product.price_thb ?? null,
    savingsThb: firstNumber(specText(product, 'monthly_savings')),
    savingsApprox: specText(product, 'monthly_savings').includes('~'),
    specLine: specText(product, 'type') || specText(product, 'standard') || null,
    monitoring: specText(product, 'monitoring') || null,
    battery: specText(product, 'battery_capacity') || null,
    paybackYears: firstNumber(specText(product, 'payback_period')),
    warrantyProduct: panelYears[0] ?? allNumbers(specText(product, 'system_warranty'))[0] ?? null,
    warrantyPerformance:
      panelYears[1] ?? allNumbers(specText(product, 'panel_performance_warranty'))[0] ?? null,
    description: product.description?.trim() || null,
    specs: specRows(product),
  };
}
