// Generate the raster brand assets (PWA icons + OG image) from brand.json.
//
// `brand:assets --check` only proves these files exist; this script is what actually paints
// them from the brand's name and palette, so a new brand does not ship Tawan Power's mark.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(readFileSync(join(ROOT, 'brand.json'), 'utf8')).brand;
const colors = JSON.parse(readFileSync(join(ROOT, 'brand.json'), 'utf8')).theme.colors.light;
const primary = colors.primary ?? '#ff8a00';
const deep = colors.primaryDeep ?? colors.accentDeep ?? primary;
const text = colors.text ?? '#0f172a';
const bg = colors.bg ?? '#f8fafc';
const darkBg = JSON.parse(readFileSync(join(ROOT, 'brand.json'), 'utf8')).theme.colors.dark.bg ?? '#0f172a';

const MARK_PATHS = 'M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7';

function markSvg(scale, color, stroke = 2.1) {
  const size = 24 * scale;
  return `<g transform="translate(${(512 - size) / 2},${(512 - size) / 2}) scale(${scale})">
    <circle cx="12" cy="12" r="4" fill="${color}" stroke="none"/>
    <path d="${MARK_PATHS}" fill="none" stroke="${color}" stroke-width="${stroke / scale}" stroke-linecap="round"/>
  </g>`;
}

function iconSvg(size, background, markColor, scale) {
  const r = Math.round(size * 0.1875);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${r}" fill="${background}"/>
    ${markSvgAt(size, background, markColor, scale)}
  </svg>`;
}

function markSvgAt(size, background, markColor, scale) {
  const markSize = 24 * scale;
  const offset = (size - markSize) / 2;
  return `<g transform="translate(${offset},${offset}) scale(${scale})">
    <circle cx="12" cy="12" r="4" fill="${markColor}" stroke="none"/>
    <path d="${MARK_PATHS}" fill="none" stroke="${markColor}" stroke-width="${2.1 / scale}" stroke-linecap="round"/>
  </g>`;
}

async function writePng(path, size, background, markColor, scale) {
  mkdirSync(dirname(path), { recursive: true });
  const svg = iconSvg(size, background, markColor, scale);
  await sharp(Buffer.from(svg)).png().toFile(path);
}

async function writeMaskable(path, size, background, markColor, scale) {
  mkdirSync(dirname(path), { recursive: true });
  // Full-bleed background; the mark stays inside the 80% safe zone.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${background}"/>
    ${markSvgAt(size, background, markColor, scale)}
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path);
}

async function writeOg(path) {
  mkdirSync(dirname(path), { recursive: true });
  const size = { w: 1200, h: 630 };
  const markScale = 6;
  const markSize = 24 * markScale;
  const markX = 96;
  const markY = (size.h - markSize) / 2;
  const title = escapeXml(brand.name);
  const descriptionLines = wrapText(brand.description ?? '', 46).map(escapeXml);
  const location = escapeXml(Array.from(new Set([brand.city, brand.region, brand.country].filter(Boolean))).join(' · '));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.w}" height="${size.h}" viewBox="0 0 ${size.w} ${size.h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${darkBg}"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="${size.w}" height="${size.h}" fill="url(#bg)"/>
    <rect x="0" y="0" width="12" height="${size.h}" fill="${primary}"/>
    <g transform="translate(${markX},${markY}) scale(${markScale})">
      <circle cx="12" cy="12" r="4" fill="${primary}" stroke="none"/>
      <path d="${MARK_PATHS}" fill="none" stroke="${primary}" stroke-width="${2.1 / markScale}" stroke-linecap="round"/>
    </g>
    <text x="360" y="230" font-size="72" font-weight="800" font-family="system-ui, sans-serif" fill="#f8fafc">${title}</text>
    ${descriptionLines.map((line, i) => `<text x="360" y="${300 + i * 36}" font-size="28" font-weight="500" font-family="system-ui, sans-serif" fill="#94a3b8">${line}</text>`).join('\n    ')}
    <text x="360" y="360" font-size="24" font-weight="600" font-family="system-ui, sans-serif" fill="${primary}">${location}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(path);
}

function wrapText(value, maxChars) {
  const words = String(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  const publicIcon = join(ROOT, 'public/icons/icon-192x192.png');
  await writePng(publicIcon, 192, primary, text, 5.333);
  await writePng(join(ROOT, 'public/icons/icon-512x512.png'), 512, primary, text, 14);
  await writeMaskable(join(ROOT, 'public/icons/icon-maskable-192x192.png'), 192, primary, text, 4);
  await writeMaskable(join(ROOT, 'public/icons/icon-maskable-512x512.png'), 512, primary, text, 10);
  await writePng(join(ROOT, 'public/admin/icons/icon-192x192.png'), 192, darkBg, primary, 5.333);
  await writePng(join(ROOT, 'public/admin/icons/icon-512x512.png'), 512, darkBg, primary, 14);
  await writeOg(join(ROOT, 'public/og-image.jpg'));
  console.log('brand-generate-assets · 7 files written');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
