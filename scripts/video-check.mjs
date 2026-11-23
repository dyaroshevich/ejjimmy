// Video under config gate.
// usage: node scripts/video-check.mjs
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const brand = JSON.parse(readFileSync(`${ROOT}/brand.json`, 'utf8'));

// 1. video section exists and is populated
const v = brand.video;
const required = ['name', 'domain', 'tagline', 'frame'];
const missing = required.filter((k) => !v || v[k] == null || v[k] === '');
if (missing.length) {
  console.error(`video-check · brand.json is missing video fields: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`video-check · brand.json video section OK (${v.name} · ${v.domain})`);

// 2. key compositions must not contain brand literals outside the config
const KEY = [
  'src/video/compositions/BrandStory.tsx',
  'src/video/compositions/AIConsultStory.tsx',
  'src/video/compositions/ProductEcosystemStory.tsx',
  'src/video/compositions/ROICalculatorStory.tsx',
  'src/video/compositions/KrabiCaseStory.tsx',
];
const LITERALS = [
  /\btawan\b/i,
  /tawanpower/i,
  /Krabi,\s*Thailand/i,
  /พลังงานสะอาดสำหรับกระบี่/,
];
let literalHits = 0;
for (const rel of KEY) {
  const src = readFileSync(`${ROOT}/${rel}`, 'utf8');
  for (const re of LITERALS) {
    const m = src.match(re);
    if (m) {
      console.error(`  LITERAL  ${rel} — ${re}`);
      literalHits += m.length;
    }
  }
}
console.log(`video-check · ${KEY.length} key compositions scanned · brand literals: ${literalHits} (must be 0)`);
if (literalHits > 0) process.exit(1);

// 3. build with the config
console.log('video-check · bundling Remotion...');
const r = spawnSync('npx', ['remotion', 'bundle', 'src/video/Root.tsx', '--out-dir', '.tmp/video-bundle'], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
});
if (r.status !== 0) {
  console.error(`video-check · bundle failed (exit ${r.status})`);
  process.exit(r.status ?? 1);
}
console.log('GATE - video:check: 0 (must be 0)');
