/**
 * Solar Calculator Configuration
 *
 * These values can be overridden via environment variables:
 * - NEXT_PUBLIC_SOLAR_SUN_HOURS: Average sun hours per day in the target location
 * - NEXT_PUBLIC_SOLAR_ELECTRICITY_RATE: Cost per kWh in THB
 * - NEXT_PUBLIC_SOLAR_PANEL_WATTAGE: Wattage of a single panel
 * - NEXT_PUBLIC_SOLAR_PANEL_AREA_SQM: Area of a single panel in square meters
 * - NEXT_PUBLIC_SOLAR_SYSTEM_LOSS_FACTOR: System efficiency loss factor
 * - NEXT_PUBLIC_SOLAR_PRICE_PREMIUM_PER_KW: Price per kW for premium tier
 * - NEXT_PUBLIC_SOLAR_PRICE_ECO_PER_KW: Price per kW for eco tier
 */

export const SOLAR_CONFIG = {
  /** Average sun hours per day in Krabi/Phuket region (Optimized for 2026) */
  sunHoursAvg: Number(process.env.NEXT_PUBLIC_SOLAR_SUN_HOURS) || 5.0,

  /** Electricity rate in THB per kWh (Updated for PEA 2025-2026 rates) */
  electricityRate: Number(process.env.NEXT_PUBLIC_SOLAR_ELECTRICITY_RATE) || 4.2,

  /** Panel wattage in watts */
  panelWattage: Number(process.env.NEXT_PUBLIC_SOLAR_PANEL_WATTAGE) || 550,

  /** Panel area in square meters */
  panelAreaSqm: Number(process.env.NEXT_PUBLIC_SOLAR_PANEL_AREA_SQM) || 2.4,

  /** System loss factor (0.85 = 15% loss) */
  systemLossFactor: Number(process.env.NEXT_PUBLIC_SOLAR_SYSTEM_LOSS_FACTOR) || 0.85,

  /** Roof orientation efficiency factors */
  orientationFactors: {
    South: 1.0,   // Best
    West: 0.90,
    East: 0.85,
    North: 0.70,  // Worst
  } as const,

  /** Equipment tier pricing per kW in THB */
  tierPricing: {
    Premium: Number(process.env.NEXT_PUBLIC_SOLAR_PRICE_PREMIUM_PER_KW) || 42000,
    Eco: Number(process.env.NEXT_PUBLIC_SOLAR_PRICE_ECO_PER_KW) || 34000,
  } as const,
};

export type Orientation = keyof typeof SOLAR_CONFIG.orientationFactors;
export type EquipmentTier = keyof typeof SOLAR_CONFIG.tierPricing;
