/**
 * Import FULL Solar1 Krabi market research into ejjimmy Supabase schema.
 * 
 * Reads ALL CSV files from market research and inserts into:
 * - ejjimmy_solar_products (products + systems)
 * - ejjimmy_blog_posts (SEO pages)
 * - ejjimmy_content_keys (lead magnets)
 * 
 * Run: node scripts/import-all-content.js
 * Requires: SUPABASE_SERVICE_ROLE_KEY env var
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

const MR_DIR = 'K:/workspaces/workspaces/solar_/market_research/03-report-результат';

function readCSV(name) {
  let content = readFileSync(`${MR_DIR}/${name}`, { encoding: 'utf8' });
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  return parse(content, { columns: true, skip_empty_lines: true, quote: true });
}

function cleanText(val) {
  if (!val || val === 'n/a') return null;
  return val.trim();
}

function cleanNumber(val) {
  if (!val || val === 'n/a' || val === '0') return null;
  const n = parseFloat(val.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

async function importProductsAndSystems() {
  console.log('=== Importing products AND systems from parts_market.csv + system_expansion.csv ===');
  
  const parts = readCSV('parts_market.csv');
  const systems = readCSV('system_expansion.csv');
  
  let inserted = 0;
  let errors = 0;

  // --- PRODUCTS ---
  for (const row of parts) {
    const price = cleanNumber(row.price_thb_median) || cleanNumber(row.price_thb_min) || 0;
    const powerKw = cleanNumber(row.power_kw) || null;
    const warrantyMonths = cleanNumber(row.warranty_months) || null;

    const specifications = {
      category: cleanText(row.category),
      price_type: cleanText(row.price_type),
      vat_included: cleanText(row.vat_included),
      moq: cleanText(row.moq),
      warranty_months: cleanText(row.warranty_months),
      availability: cleanText(row.availability),
      supplier: cleanText(row.supplier),
      source_count: cleanText(row.source_count),
      source_urls: cleanText(row.source_urls),
      source_date: cleanText(row.source_date),
      demand_signal: cleanText(row.demand_signal),
      demand_score: cleanText(row.demand_score_1_5),
      competition_score: cleanText(row.competition_score_1_5),
      fit_score: cleanText(row.fit_score_1_5),
      priority: cleanText(row.priority),
      confidence: cleanText(row.confidence),
      notes: cleanText(row.notes),
    };

    const { error } = await supabase
      .from('ejjimmy_solar_products')
      .upsert({
        id: cleanText(row.part_id),
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
        sort_order: -(parseInt(row.priority || '0', 10)),
        site_id: 'ejjimmy',
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ERROR ${row.part_id}:`, error.message);
      errors++;
    } else {
      inserted++;
    }
  }
  console.log(`Products: ${inserted} inserted, ${errors} errors`);

  // --- SYSTEMS ---
  inserted = 0;
  errors = 0;

  for (const row of systems) {
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

    const { error } = await supabase
      .from('ejjimmy_solar_products')
      .upsert({
        id: cleanText(row.opp_id),
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
        sort_order: -(parseInt(row.priority || '0', 10)),
        site_id: 'ejjimmy',
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ERROR ${row.opp_id}:`, error.message);
      errors++;
    } else {
      inserted++;
    }
  }
  console.log(`Systems: ${inserted} inserted, ${errors} errors`);
}

async function importSEOPages() {
  console.log('\n=== Importing ALL SEO pages into ejjimmy_blog_posts ===');
  const rows = readCSV('seo_pages.csv');

  let inserted = 0;
  let errors = 0;

  for (const row of rows) {
    const slug = cleanText(row.url_slug) || `/${row.page_id}`;
    const locale = cleanText(row.lang) || 'th';

    const contentParts = [];
    if (cleanText(row.h1)) contentParts.push(`# ${cleanText(row.h1)}`);
    if (cleanText(row.meta_description)) contentParts.push(`\n${cleanText(row.meta_description)}`);
    if (cleanText(row.primary_keyword)) contentParts.push(`\n**Ключевой запрос:** ${cleanText(row.primary_keyword)}`);
    if (cleanText(row.secondary_keywords)) contentParts.push(`\n**Вторичные ключи:** ${cleanText(row.secondary_keywords)}`);
    if (cleanText(row.notes)) contentParts.push(`\n\n${cleanText(row.notes)}`);
    if (cleanText(row.cta)) contentParts.push(`\n\n**Призыв к действию:** ${cleanText(row.cta)}`);
    if (cleanText(row.internal_links)) contentParts.push(`\n**Внутренние ссылки:** ${cleanText(row.internal_links)}`);

    const content = contentParts.join('\n') || '';

    const { error } = await supabase
      .from('ejjimmy_blog_posts')
      .upsert({
        slug: slug,
        title: cleanText(row.title_seo) || cleanText(row.primary_keyword) || slug,
        excerpt: cleanText(row.meta_description) || '',
        content: content,
        locale: locale,
        category: cleanText(row.page_type) || 'seo',
        tags: [cleanText(row.primary_keyword), cleanText(row.page_type)].filter(Boolean),
        featured_image: null,
        is_published: true,
        site_id: 'ejjimmy',
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`  ERROR ${row.page_id}:`, error.message);
      errors++;
    } else {
      inserted++;
    }
  }
  console.log(`SEO pages: ${inserted} inserted, ${errors} errors`);
}

async function importLeadMagnets() {
  console.log('\n=== Importing ALL lead magnets into ejjimmy_content_keys ===');
  const rows = readCSV('lead_magnets.csv');

  let inserted = 0;
  let errors = 0;

  for (const row of rows) {
    const key = `lead_magnet_${cleanText(row.magnet_id)}`;

    const value = {
      magnet_id: cleanText(row.magnet_id),
      title_th: cleanText(row.title_th),
      title_en: cleanText(row.title_en),
      magnet_type: cleanText(row.magnet_type),
      funnel_stage: cleanText(row.funnel_stage),
      target_audience: cleanText(row.target_audience),
      trigger: cleanText(row.trigger),
      format: cleanText(row.format),
      pages: cleanNumber(row.pages),
      languages: cleanText(row.languages),
      production_hours: cleanNumber(row.production_hours),
      cost_thb: cleanNumber(row.cost_thb),
      data_needed: cleanText(row.data_needed),
      cta: cleanText(row.cta),
      is_tripwire: cleanText(row.is_tripwire) === 'yes',
      tripwire_price_thb: cleanNumber(row.tripwire_price_thb),
      credit_to_project: cleanText(row.credit_to_project),
      follow_up_channel: cleanText(row.follow_up_channel),
      follow_up_days: cleanText(row.follow_up_days),
      priority: cleanNumber(row.priority),
      fit_score: cleanText(row.fit_score_1_5),
      cannibal_risk: cleanText(row.cannibal_risk),
      notes: cleanText(row.notes),
    };

    const { error } = await supabase
      .from('ejjimmy_content_keys')
      .upsert({
        key: key,
        value: value,
        locale: 'th',
        site_id: 'ejjimmy',
      }, { onConflict: 'key,locale,site_id' });

    if (error) {
      console.error(`  ERROR ${row.magnet_id}:`, error.message);
      errors++;
    } else {
      inserted++;
    }
  }
  console.log(`Lead magnets: ${inserted} inserted, ${errors} errors`);
}

async function main() {
  await importProductsAndSystems();
  await importSEOPages();
  await importLeadMagnets();
  console.log('\n=== FULL CONTENT IMPORT COMPLETE ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});