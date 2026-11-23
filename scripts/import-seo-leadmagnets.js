/**
 * Import SEO pages and lead magnets from Solar1 market research into ejjimmy Supabase.
 * 
 * SEO pages -> ejjimmy_blog_posts table
 * Lead magnets -> ejjimmy_content_keys table
 * 
 * Run: node scripts/import-seo-leadmagnets.js
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

async function importSEOPages() {
  console.log('=== Importing SEO pages into ejjimmy_blog_posts ===');
  const rows = readCSV('K:/workspaces/workspaces/solar_/market_research/03-report-результат/seo_pages.csv');
  
  // Select priority 1-2 pages (~18 pages)
  const selected = rows.filter(r => {
    const p = parseInt(r.priority || '0', 10);
    return p === 1 || p === 2;
  });
  console.log(`Selected ${selected.length} SEO pages from ${rows.length} total`);

  for (const row of selected) {
    const slug = cleanText(row.url_slug) || `/${row.page_id}`;
    const locale = cleanText(row.lang) || 'th';
    
    // Build content from SEO fields
    const contentParts = [];
    if (cleanText(row.h1)) contentParts.push(`# ${cleanText(row.h1)}`);
    if (cleanText(row.meta_description)) contentParts.push(`\n${cleanText(row.meta_description)}`);
    if (cleanText(row.notes)) contentParts.push(`\n\n${cleanText(row.notes)}`);
    if (cleanText(row.cta)) contentParts.push(`\n\n**CTA:** ${cleanText(row.cta)}`);
    if (cleanText(row.internal_links)) contentParts.push(`\n**Внутренние ссылки:** ${cleanText(row.internal_links)}`);
    
    const content = contentParts.join('\n') || cleanText(row.description) || '';
    
    const { data, error } = await supabase
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
    } else {
      console.log(`  OK ${row.page_id} — ${cleanText(row.primary_keyword)} (${slug})`);
    }
  }
}

async function importLeadMagnets() {
  console.log('\n=== Importing lead magnets into ejjimmy_content_keys ===');
  const rows = readCSV('K:/workspaces/workspaces/solar_/market_research/03-report-результат/lead_magnets.csv');
  
  // Select ~8 lead magnets: priority 1-2 first, then fit_score
  const ranked = [...rows].sort((a, b) => {
    const pa = parseInt(a.priority || '0', 10);
    const pb = parseInt(b.priority || '0', 10);
    if (pb !== pa) return pb - pa;
    return (parseInt(b.fit_score_1_5 || '0', 10)) - (parseInt(a.fit_score_1_5 || '0', 10));
  });
  
  const selected = ranked.slice(0, 8);
  console.log(`Selected ${selected.length} lead magnets from ${rows.length} total`);

  for (const row of selected) {
    const key = `lead_magnet_${row.magnet_id}`;
    
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

    const { data, error } = await supabase
      .from('ejjimmy_content_keys')
      .upsert({
        key: key,
        value: value,
        locale: 'th',
        site_id: 'ejjimmy',
      }, { onConflict: 'key,locale,site_id' });

    if (error) {
      console.error(`  ERROR ${row.magnet_id}:`, error.message);
    } else {
      console.log(`  OK ${row.magnet_id} — ${cleanText(row.title_th)}`);
    }
  }
}

async function main() {
  await importSEOPages();
  await importLeadMagnets();
  console.log('\n=== SEO + Lead magnet import complete ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});