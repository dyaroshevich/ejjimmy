export interface SolarProductSpecifications {
  [key: string]: string | number | boolean;
}

export interface SolarProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: 'package' | 'panel' | 'inverter' | 'battery' | 'mounting' | 'charger' | 'system';
  power_kw?: number;
  price_thb?: number;
  specifications: SolarProductSpecifications;
  image_url?: string;
  description?: string;
  locale?: string;
  created_at: string;
  updated_at: string;
}