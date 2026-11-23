export interface SolarCalculationInput {
  mode: 'bill' | 'area' | 'kw' | 'panels';
  value: number; // The numeric input based on mode
  roofOrientation?: 'South' | 'North' | 'East' | 'West';
  equipmentTier?: 'Premium' | 'Eco';
  location?: string;
}

export interface SolarCalculationResult {
  recommendedSystemKw: number;
  panelCount: number;
  totalInvestmentThb: number;
  monthlySavingsThb: number;
  yearlySavingsThb: number;
  paybackPeriodYears: number;
  roiPercent: number;
  costPerSqm: number;
  roofAreaUsed: number;
  orientationEfficiency: number;
}

import { SOLAR_CONFIG } from '@/config/solar';

export function calculateSolarSystemV8(input: SolarCalculationInput): SolarCalculationResult {
  const { mode, value, roofOrientation = 'South', equipmentTier = 'Premium' } = input;
  const factor = SOLAR_CONFIG.orientationFactors[roofOrientation];
  const pricePerKw = SOLAR_CONFIG.tierPricing[equipmentTier];
  const effectiveHours = SOLAR_CONFIG.sunHoursAvg * factor;

  let targetKw = 0;

  // Branch logic based on Input Tabs
  switch(mode) {
    case 'bill':
      targetKw = (value / SOLAR_CONFIG.electricityRate / 30) / effectiveHours / SOLAR_CONFIG.systemLossFactor;
      break;
    case 'area':
      // How many panels fit in this area
      const panelsByArea = Math.floor(value / SOLAR_CONFIG.panelAreaSqm);
      targetKw = (panelsByArea * SOLAR_CONFIG.panelWattage) / 1000;
      break;
    case 'kw':
      targetKw = value;
      break;
    case 'panels':
      targetKw = (value * SOLAR_CONFIG.panelWattage) / 1000;
      break;
  }

  const panelCount = Math.ceil((targetKw * 1000) / SOLAR_CONFIG.panelWattage);
  const finalKw = (panelCount * SOLAR_CONFIG.panelWattage) / 1000;
  const investment = finalKw * pricePerKw;
  const monthlyProduction = finalKw * effectiveHours * 30 * SOLAR_CONFIG.systemLossFactor;
  const monthlySavings = Math.min(monthlyProduction * SOLAR_CONFIG.electricityRate, (mode === 'bill' ? value : monthlyProduction * SOLAR_CONFIG.electricityRate));
  const roofAreaUsed = panelCount * SOLAR_CONFIG.panelAreaSqm;

  return {
    recommendedSystemKw: Number(finalKw.toFixed(2)),
    panelCount,
    totalInvestmentThb: Math.round(investment),
    monthlySavingsThb: Math.round(monthlySavings),
    yearlySavingsThb: Math.round(monthlySavings * 12),
    paybackPeriodYears: Number((investment / (monthlySavings * 12)).toFixed(1)),
    roiPercent: Number(((monthlySavings * 12) / investment * 100).toFixed(1)),
    costPerSqm: Math.round(investment / roofAreaUsed),
    roofAreaUsed: Number(roofAreaUsed.toFixed(1)),
    orientationEfficiency: Math.round(factor * 100)
  };
}
