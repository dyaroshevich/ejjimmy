/**
 * Добавляет маркетинговые тайтлы (marketing_title_th) к существующим лид-магнитам
 * в таблицу ejjimmy_content_keys (поле value — JSONB).
 * 
 * Читает lead_magnets.csv, берёт title_th как базу, и добавляет marketing_title_th
 * в JSON value. Marketing title — это более продающее, клиентоориентированное название.
 * 
 * Run: node scripts/update-lead-magnets-marketing.js
 * Requires: SUPABASE_SERVICE_ROLE_KEY
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

/**
 * Преобразует техническое название из CSV в маркетинговое (пользовательское).
 * タイトル тайские, поэтому добавляем benefit-ориентированные prefiks/суффиксы.
 */
function toMarketingTitle(row) {
  const titleTh = cleanText(row.title_th) || '';
  const titleEn = cleanText(row.title_en) || '';
  const magnetType = cleanText(row.magnet_type) || '';
  const funnelStage = cleanText(row.funnel_stage) || '';
  const isTripwire = cleanText(row.is_tripwire) === 'yes';
  const tripwirePrice = cleanNumber(row.tripwire_price_thb);

  // Базовое название — берём тайское, если есть, иначе английское
  let marketing = titleTh || titleEn || 'Магнит';

  // Добавляем benefit-префикс в зависимости от типа и воронки
  if (funnelStage === 'TOFU') {
    // Верх воронки — обучение, осознание проблемы
    if (magnetType.includes('чек-лист') || magnetType.includes('Чек-лист')) {
      marketing = `Бесплатно: ${marketing}`;
    } else if (magnetType.includes('таблица') || magnetType.includes('Таблица')) {
      marketing = `Бесплатно: ${marketing}`;
    } else {
      marketing = `Бесплатно: ${marketing}`;
    }
  } else if (funnelStage === 'MOFU') {
    // Середина воронки — сравнение, расчёт
    marketing = `📊 ${marketing}`;
  } else if (funnelStage === 'BOFU') {
    // Низ воронки — готов к покупке
    marketing = `💰 ${marketing}`;
  }

  // Если tripwire — добавляем цену
  if (isTripwire && tripwirePrice) {
    marketing += ` — ${tripwirePrice}฿`;
  }

  return marketing;
}

function cleanNumber(val) {
  if (!val || val === 'n/a' || val === '0') return null;
  const n = parseFloat(val.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

async function main() {
  const rows = readCSV('lead_magnets.csv');
  console.log(`Найдено ${rows.length} лид-магнитов в CSV`);

  let updated = 0;
  let errors = 0;

  for (const row of rows) {
    const magnetId = cleanText(row.magnet_id);
    if (!magnetId) {
      console.warn('Пропуск строки без magnet_id:', row);
      continue;
    }

    const key = `lead_magnet_${magnetId}`;
    const marketingTitle = toMarketingTitle(row);

    // Получаем существующую запись
    const { data: existing, error: fetchError } = await supabase
      .from('ejjimmy_content_keys')
      .select('*')
      .eq('key', key)
      .eq('locale', 'th')
      .eq('site_id', 'ejjimmy')
      .single();

    if (fetchError || !existing) {
      console.error(`  ERROR ${key}: не найден в базе — ${fetchError?.message}`);
      errors++;
      continue;
    }

    const currentValue = existing.value || {};

    // Добавляем/обновляем marketing_title_th в JSON
    const newValue = {
      ...currentValue,
      marketing_title_th: marketingTitle,
      marketing_title_en: cleanText(row.title_en) || null,
      marketing_updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('ejjimmy_content_keys')
      .update({ value: newValue })
      .eq('key', key)
      .eq('locale', 'th')
      .eq('site_id', 'ejjimmy');

    if (error) {
      console.error(`  ERROR ${key}:`, error.message);
      errors++;
    } else {
      updated++;
      console.log(`  OK ${key} — "${marketingTitle}"`);
    }
  }

  console.log(`\nГотово: ${updated} обновлено, ${errors} ошибок`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});