#!/usr/bin/env node
/**
 * Setup LINE Rich Menu
 * Run: npx tsx scripts/setup-rich-menu.ts
 * Or: node scripts/setup-rich-menu.js (if using tsx)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { setupRichMenu } from '../src/lib/line-rich-menu.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_PATH = path.join(__dirname, '../public/assets/line-rich-menu.png');

console.log('📋 LINE Rich Menu Setup');
console.log('========================');
console.log('Image:', IMAGE_PATH);
console.log('');

setupRichMenu(IMAGE_PATH)
  .then(menuId => {
    console.log('\n✅ Rich menu setup complete!');
    console.log('Menu ID:', menuId);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });