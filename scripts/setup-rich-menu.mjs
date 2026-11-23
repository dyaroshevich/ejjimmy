/**
 * Setup LINE Rich Menu - Standalone Script
 * Run: node scripts/setup-rich-menu.mjs
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_API_BASE = 'https://api.line.me/v2/bot';
const LINE_DATA_API_BASE = 'https://api-data.line.me/v2/bot';

const IMAGE_PATH = path.join(__dirname, '../public/assets/line-rich-menu.png');

const LIFF_URL = 'https://liff.line.me/2010020881-koR53fSr';

const ZONES = [
  { label: 'AI ปรึกษา', x: 0, y: 0, width: 833, height: 843, data: 'action=ai_chat' },
  { label: 'แพ็กเกจ', x: 833, y: 0, width: 833, height: 843, data: 'action=catalog' },
  { label: '🎁 โปรโมชั่น', x: 1666, y: 0, width: 833, height: 843, data: 'action=promotion' },
  { label: 'คำนวณ', x: 0, y: 843, width: 833, height: 843, data: 'action=calculator' },
  { label: 'ขอใบเสนอ', x: 833, y: 843, width: 833, height: 843, data: 'action=lead_solar' },
  { label: 'เปิดแอป', x: 1666, y: 843, width: 833, height: 843, data: 'action=liff', uri: LIFF_URL }
];

async function lineFetch(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
      ...options.headers
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function getExistingMenus() {
  try {
    const result = await lineFetch(`${LINE_API_BASE}/richmenu/list`, { method: 'GET' });
    return result.richmenus || [];
  } catch {
    return [];
  }
}

async function deleteMenu(richMenuId) {
  try {
    await lineFetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, { method: 'DELETE' });
    console.log(`  Deleted: ${richMenuId}`);
  } catch (e) {
    console.log(`  Skip delete: ${e.message}`);
  }
}

async function createRichMenu() {
  const areas = ZONES.map(zone => {
    if (zone.uri) {
      return {
        bounds: { x: zone.x, y: zone.y, width: zone.width, height: zone.height },
        action: { type: 'uri', label: zone.label, uri: zone.uri }
      };
    }
    return {
      bounds: { x: zone.x, y: zone.y, width: zone.width, height: zone.height },
      action: { type: 'postback', label: zone.label, data: zone.data, displayText: zone.label }
    };
  });

  const result = await lineFetch(`${LINE_API_BASE}/richmenu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      size: { width: 2500, height: 1686 },
      selected: true,
      name: 'Tawan Power Menu',
      chatBarText: 'เมนูหลัก',
      areas
    })
  });
  return result.richMenuId;
}

async function uploadImage(richMenuId, imageBuffer, contentType) {
  const response = await fetch(`${LINE_DATA_API_BASE}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`, 'Content-Type': contentType },
    body: imageBuffer
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }
}

async function setDefault(richMenuId) {
  await lineFetch(`${LINE_API_BASE}/user/all/richmenu/${richMenuId}`, { method: 'POST' });
}

console.log('📋 LINE Rich Menu Setup (with LIFF)');
console.log('====================================');
console.log('Image:', IMAGE_PATH);
console.log('LIFF:', LIFF_URL);
console.log('');

if (!LINE_ACCESS_TOKEN) {
  console.error('❌ LINE_CHANNEL_ACCESS_TOKEN not set in .env.local');
  process.exit(1);
}

if (!fs.existsSync(IMAGE_PATH)) {
  console.error('❌ Image not found:', IMAGE_PATH);
  process.exit(1);
}

async function setup() {
  try {
    // Cleanup old menus
    console.log('Cleaning up old rich menus...');
    const oldMenus = await getExistingMenus();
    for (const menu of oldMenus) {
      await deleteMenu(menu.richMenuId);
    }
    console.log(`  Cleaned ${oldMenus.length} old menu(s)`);

    console.log('\nCreating rich menu...');
    const menuId = await createRichMenu();
    console.log('✅ Created:', menuId);

    console.log('Processing image...');
    const originalSize = fs.statSync(IMAGE_PATH).size;
    // JPEG: the 2500x1686 PNG blows past LINE's 1MB upload limit (413)
    const optimizedBuffer = await sharp(IMAGE_PATH)
      .resize(2500, 1686, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 72 })
      .toBuffer();
    console.log(`  Original: ${(originalSize / 1024).toFixed(1)} KB → Optimized: ${(optimizedBuffer.length / 1024).toFixed(1)} KB`);

    console.log('Uploading image...');
    await uploadImage(menuId, optimizedBuffer, 'image/jpeg');
    console.log('✅ Image uploaded');

    console.log('Setting as default...');
    await setDefault(menuId);
    console.log('✅ Set as default');

    console.log('\n====================================');
    console.log('✅ SUCCESS! Rich menu activated!');
    console.log('====================================');
    console.log('Menu ID:', menuId);
    console.log('\n📱 Кнопки меню:');
    ZONES.forEach((z, i) => {
      console.log(`   ${i + 1}. ${z.label} → ${z.uri || z.data}`);
    });
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    process.exit(1);
  }
}

setup();