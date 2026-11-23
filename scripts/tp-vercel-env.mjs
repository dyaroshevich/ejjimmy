// tp-vercel-env.mjs — загрузка env из .env.local в linked Vercel-проект (production).
// Значения не печатаются. Overrides для прода копии. Запуск: node scripts/tp-vercel-env.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const log = (...a) => console.log(...a);

function envOf(file) {
  const out = {};
  for (const line of readFileSync(join(ROOT, file), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}
const env = envOf('.env.local');

// Override'ы прода копии (план «Б»)
env.NEXT_PUBLIC_SITE_URL = 'https://tawanpower.vercel.app';
env.LANDING_URL = 'https://tawanpower.vercel.app';

// Ключи-мусор локальной dev-системы и пустые значения не отправляем
const SKIP = [/^NX_|^TURBO_|^VERCEL$/, /^NEXT_PUBLIC_APP_MODE$/];
let sent = 0, skipped = 0;
for (const [key, value] of Object.entries(env)) {
  if (SKIP.some(re => re.test(key))) { log('skip', key); skipped++; continue; }
  if (!value) { log('skip(empty)', key); skipped++; continue; }
  const r = spawnSync('cmd', ['/c', 'vercel', 'env', 'add', key, 'production', '--force'], { input: value + '\n', encoding: 'utf8', shell: false, timeout: 90000 });
  const out = String(r.stdout || '') + String(r.stderr || '');
  if (r.status === 0) { sent++; log(`added  ${key}`); }
  else log(`FAIL   ${key}: ${out.split('\n')[0].slice(0, 120)} (rc=${r.status})`);
}
log(`\nsent: ${sent}, skipped: ${skipped}`);
