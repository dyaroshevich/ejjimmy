/**
 * LINE Rich Menu Management
 * Creates, uploads, and sets default rich menu
 */

import * as fs from 'fs';
import * as path from 'path';
import { brand } from './site.config';

const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_API_BASE = 'https://api.line.me/v2/bot';
const LINE_DATA_API_BASE = 'https://api-data.line.me/v2/bot';

export interface RichMenuZone {
  index: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  actionData: string;
  uri?: string;
}

const LIFF_URL = process.env.NEXT_PUBLIC_LINE_LIFF_URL || 'https://liff.line.me/2010020881-koR53fSr';

const getLiffUri = (url: string) => {
  if (url.startsWith('https://liff.line.me/')) return url;
  if (url.startsWith('https://')) return url; // Direct URL
  return `https://liff.line.me/${url}`; // It's just an ID
};

export const RICH_MENU_ZONES: RichMenuZone[] = [
  { index: 0, label: 'AI ปรึกษา', x: 0, y: 0, width: 833, height: 843, actionData: 'action=ai_chat' },
  { index: 1, label: 'แพ็กเกจ', x: 833, y: 0, width: 833, height: 843, actionData: 'action=catalog' },
  { index: 2, label: '🎁 โปรโมชั่น', x: 1666, y: 0, width: 833, height: 843, actionData: 'action=promotion' },
  { index: 3, label: 'คำนวณ', x: 0, y: 843, width: 833, height: 843, actionData: 'action=calculator' },
  { index: 4, label: 'ขอใบเสนอ', x: 833, y: 843, width: 833, height: 843, actionData: 'action=lead_solar' },
  { index: 5, label: 'เปิดแอป', x: 1666, y: 843, width: 833, height: 843, actionData: 'action=liff', uri: getLiffUri(LIFF_URL) }
];

async function lineFetch(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`LINE API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

export async function createRichMenu(): Promise<string> {
  const areas = RICH_MENU_ZONES.map(zone => {
    if (zone.uri) {
      return {
        bounds: {
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height
        },
        action: {
          type: 'uri' as const,
          label: zone.label,
          uri: zone.uri
        }
      };
    }
    return {
      bounds: {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height
      },
      action: {
        type: 'postback' as const,
        label: zone.label,
        data: zone.actionData,
        displayText: zone.label
      }
    };
  });

  const richMenu = {
    size: { width: 2500, height: 1686 },
    selected: true,
    name: `${brand.name} Menu`,
    chatBarText: 'เมนูหลัก',
    areas
  };

  const result = await lineFetch(`${LINE_API_BASE}/richmenu`, {
    method: 'POST',
    body: JSON.stringify(richMenu)
  });

  console.log('[LINE] Rich menu created:', result.richMenuId);
  return result.richMenuId;
}

export async function uploadRichMenuImage(richMenuId: string, imagePath: string): Promise<void> {
  const imageBuffer = fs.readFileSync(imagePath);

  const response = await fetch(`${LINE_DATA_API_BASE}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
      'Content-Type': 'image/png'
    },
    body: imageBuffer
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload rich menu image: ${error}`);
  }

  console.log('[LINE] Rich menu image uploaded:', richMenuId);
}

export async function setDefaultRichMenu(richMenuId: string): Promise<void> {
  await lineFetch(`${LINE_API_BASE}/user/all/richmenu/${richMenuId}`, {
    method: 'POST'
  });

  console.log('[LINE] Rich menu set as default:', richMenuId);
}

export async function getRichMenuList(): Promise<any[]> {
  const result = await lineFetch(`${LINE_API_BASE}/richmenu/list`, {
    method: 'GET'
  });

  return result.richmenus || [];
}

export async function deleteRichMenu(richMenuId: string): Promise<void> {
  await lineFetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
    method: 'DELETE'
  });

  console.log('[LINE] Rich menu deleted:', richMenuId);
}

export async function getDefaultRichMenuId(): Promise<string | null> {
  const result = await lineFetch(`${LINE_API_BASE}/user/all/richmenu`, {
    method: 'GET'
  });

  return result.richMenuId || null;
}

export async function cleanupOldRichMenus(): Promise<void> {
  const menus = await getRichMenuList();

  if (menus.length > 3) {
    const sorted = menus.sort((a, b) =>
      new Date(a.created).getTime() - new Date(b.created).getTime()
    );

    const toDelete = sorted.slice(0, -3);
    for (const menu of toDelete) {
      try {
        await deleteRichMenu(menu.richMenuId);
      } catch (e) {
        console.error(`[LINE] Failed to delete old menu ${menu.richMenuId}:`, e);
      }
    }
  }
}

export async function setupRichMenu(imagePath: string): Promise<string> {
  console.log('[LINE] Starting rich menu setup...');

  await cleanupOldRichMenus();

  const richMenuId = await createRichMenu();
  await uploadRichMenuImage(richMenuId, imagePath);
  await setDefaultRichMenu(richMenuId);

  console.log('[LINE] Rich menu setup complete!');

  return richMenuId;
}

if (require.main === module) {
  const imagePath = process.argv[2] || path.join(process.cwd(), 'public/assets/line-rich-menu.png');

  console.log('Setting up LINE Rich Menu...');
  console.log('Image path:', imagePath);

  setupRichMenu(imagePath)
    .then(menuId => {
      console.log('\n✅ SUCCESS! Rich menu ID:', menuId);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ FAILED:', error.message);
      process.exit(1);
    });
}