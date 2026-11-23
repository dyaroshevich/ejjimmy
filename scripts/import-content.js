/**
 * Import Solar1 Krabi market research content into ejjimmy Supabase schema.
 * 
 * Reads CSV files from market research and inserts into:
 * - ejjimmy_solar_products (products + systems)
 * 
 * Run: node scripts/import-content.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gfdbmxhtvhivoztgckit.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function readCSV(path) {
  let content = readFileSync(path, { encoding: 'utf8' });
  // Strip UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return parse(content, { columns: true, skip_empty_lines: true, quote: true });
}

function cleanNumber(val) {
  if (!val || val === 'n/a' || val === '0') return null;
  const n = parseFloat(val.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function cleanText(val) {
  if (!val || val === 'n/a') return null;
  return val.trim();
}

async function importProducts() {
  console.log('=== Importing products from parts_market.csv ===');
  const rows = readCSV('K:/workspaces/workspaces/solar_/market_research/03-report-результат/parts_market.csv');
  
  // Select best ~20 products: priority 10-11 first, then confidence high/medium
  const ranked = [...rows].sort((a, b) => {
    const pa = parseInt(a.priority || '0', 10);
    const pb = parseInt(b.priority || '0', 10);
    if (pb !== pa) return pb - pa;
    return (b.confidence === 'high' ? 1 : 0) - (a.confidence === 'high' ? 1 : 0);
  });
  
  const selected = ranked.slice(0, 20);
  console.log(`Selected ${selected.length} products from ${rows.length} total`);

  for (const row of selected) {
    const price = cleanNumber(row.price_thb_median) || cleanNumber(row.price_thb_min) || 0;
    const powerKw = cleanNumber(row.power_kw) || null;
    const warrantyMonths = cleanNumber(row.warranty_months) || null;
    
    const specifications = {
      category: cleanText(row.category),
      price_type: cleanText(row.price_type),
      vat_included: cleanText(row.vat_included),
      moq: cleanText(row.moq),
      availability: cleanText(row.availability),
      supplier: cleanText(row.supplier),
      source_count: cleanText(row.source_count),
      source_urls: cleanText(row.source_urls),
      source_date: cleanText(row.source_date),
      demand_signal: cleanText(row.demand_signal),
      demand_score: cleanText(row.demand_score_1_5),
      competition_score: cleanText(row.competition_score_1_5),
      fit_score: cleanText(row.fit_score_1_5),
      confidence: cleanText(row.confidence),
      notes: cleanText(row.notes),
    };

    const { data, error } = await supabase
      .from('ejjimmy_solar_products')
      .upsert({
        id: row.part_id,
        name: `${cleanText(row.brand)} ${cleanText(row.model)}`,
        model: cleanText(row.model),
        brand: cleanText(row.brand),
        type: 'parts',
        category: cleanText(row.category),
        power_kw: powerKw,
        price_thb: price,
        original_price_thb: cleanNumber(row.price_thb_max) || null,
        specifications: specifications,
        images: [],
        description: cleanText(row.notes) || `${cleanText(row.brand)} ${cleanText(row.model)} — ${cleanText(row.spec)}`,
        is_active: true,
        sort_order: parseInt(row.priority || '0', 10) * -1, // higher priority = lower sort_order = shown first
        site_id: 'ejjimmy',
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ERROR ${row.part_id}:`, error.message);
    } else {
      console.log(`  OK ${row.part_id} — ${cleanText(row.brand)} ${cleanText(row.model)} (฿${price})`);
    }
  }
}

async function importSystems() {
  console.log('\n=== Importing systems from system_expansion.csv ===');
  const rows = readCSV('K:/workspaces/workspaces/solar_/market_research/03-report-результат/system_expansion.csv');
  
  // Select best ~6 systems: priority 10-11 first
  const ranked = [...rows].sort((a, b) => {
    const pa = parseInt(a.priority || '0', 10);
    const pb = parseInt(b.priority || '0', 10);
    if (pb !== pa) return pb - pa;
    return (b.confidence === 'high' ? 1 : 0) - (a.confidence === 'high' ? 1 : 0);
  });
  
  const selected = ranked.slice(0, 6);
  console.log(`Selected ${selected.length} systems from ${rows.length} total`);

  for (const row of selected) {
    const price = cleanNumber(row.market_price_min_thb) || cleanNumber(row.bom_cost_thb) || 0;
    const powerKw = cleanNumber(row.size_kwp) || null;
    const capacityKwh = cleanNumber(row.storage_kwh) || null;
    
    const specifications = {
      segment: cleanText(row.segment),
      size_kwp: cleanText(row.size_kwp),
      storage_kwh: cleanText(row.storage_kwh),
      grid_type: cleanText(row.grid_type),
      bom_key_items: cleanText(row.bom_key_items),
      bom_cost_thb: cleanNumber(row.bom_cost_thb),
      market_price_min_thb: cleanNumber(row.market_price_min_thb),
      market_price_max_thb: cleanNumber(row.market_price_max_thb),
      price_per_kwp_thb: cleanText(row.price_per_kwp_thb),
      market_evidence: cleanText(row.market_evidence),
      our_position: cleanText(row.our_position),
      opportunity_type: cleanText(row.opportunity_type),
      barrier_to_entry: cleanText(row.barrier_to_entry),
      est_gross_margin_pct: cleanText(row.est_gross_margin_pct),
      score_demand: cleanText(row.score_demand),
      score_competition: cleanText(row.score_competition),
      score_fit: cleanText(row.score_fit),
      effort_weeks: cleanText(row.effort_weeks),
      confidence: cleanText(row.confidence),
      source_urls: cleanText(row.source_urls),
      notes: cleanText(row.notes),
    };

    const { data, error } = await supabase
      .from('ejjimmy_solar_products')
      .upsert({
        id: row.opp_id,
        name: cleanText(row.system_name),
        model: null,
        brand: 'Ejjimmy Solar',
        type: 'system',
        category: cleanText(row.segment),
        power_kw: powerKw,
        capacity_kwh: capacityKwh,
        price_thb: price,
        original_price_thb: cleanNumber(row.market_price_max_thb) || null,
        specifications: specifications,
        images: [],
        description: cleanText(row.notes) || cleanText(row.our_position) || '',
        is_active: true,
        sort_order: parseInt(row.priority || '0', 10) * -1,
        site_id: 'ejjimmy',
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ERROR ${row.opp_id}:`, error.message);
    } else {
      console.log(`  OK ${row.opp_id} — ${cleanText(row.system_name)} (฿${price})`);
    }
  }
}

async function main() {
  await importProducts();
  await importSystems();
  console.log('\n=== Import complete ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});