import { supabase as defaultClient } from '../supabase';
import { SolarProduct } from './products';

export async function getSolarProducts(options: {
  limit?: number;
  offset?: number;
  type?: string;
  brand?: string;
  minPower?: number;
  maxPower?: number;
  search?: string;
  supabase?: any;
} = {}): Promise<{ data: SolarProduct[]; count: number }> {
  const client = options.supabase || defaultClient;
  let query = client.from('solar_products').select('*', { count: 'exact' });

  // Apply filters
  if (options.type) {
    query = query.eq('type', options.type);
  }
  if (options.brand) {
    query = query.ilike('brand', `%${options.brand}%`);
  }
  if (options.minPower !== undefined) {
    query = query.gte('power_kw', options.minPower);
  }
  if (options.maxPower !== undefined) {
    query = query.lte('power_kw', options.maxPower);
  }
  if (options.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`name.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  // Apply pagination
  if (options.offset !== undefined) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  } else if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return { data: data as SolarProduct[], count: count || 0 };
}

export async function getSolarProductById(id: string, supabase?: any): Promise<SolarProduct | null> {
  const client = supabase || defaultClient;
  const { data, error } = await client
    .from('solar_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return null;
    }
    throw error;
  }

  return data as SolarProduct;
}

export async function createSolarProduct(
  product: Omit<SolarProduct, 'id' | 'created_at' | 'updated_at'>,
  supabase?: any
): Promise<SolarProduct> {
  const client = supabase || defaultClient;
  const now = new Date().toISOString();
  const { data, error } = await client
    .from('solar_products')
    .insert([{
      ...product,
      created_at: now,
      updated_at: now
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as SolarProduct;
}

export async function updateSolarProduct(
  id: string, 
  updates: Partial<SolarProduct>,
  supabase?: any
): Promise<SolarProduct> {
  const client = supabase || defaultClient;
  const { data, error } = await client
    .from('solar_products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as SolarProduct;
}

export async function deleteSolarProduct(id: string, supabase?: any): Promise<void> {
  const client = supabase || defaultClient;
  const { error } = await client
    .from('solar_products')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
