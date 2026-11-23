// tp-code-patch.mjs — кодовая изоляция плана «Б»:
//  1) центральный клиент src/lib/supabase.ts привязывается к SUPABASE_SCHEMA,
//  2) все inline import { createClient } from '@supabase/supabase-js' → createScopedClient из '@/lib/supabase',
//  3) .storage.from('proposals'|'products') → sbBucket(...),
//  4) env-дополнения (.env.local): SUPABASE_SCHEMA, SUPABASE_STORAGE_PREFIX
// Идемпотентно: повторный запуск ничего не меняет. Запуск: node scripts/tp-code-patch.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const log = (...a) => console.log(...a);
let changed = 0;

// ---------- 0. Центральный lib/supabase.ts ----------
{
  const f = join(ROOT, 'src', 'lib', 'supabase.ts');
  let t = readFileSync(f, 'utf8');
  if (!t.includes('SUPABASE_SCHEMA')) {
    t = t.replace(
      /export const SUPABASE_SERVICE_ROLE_KEY[^\n]*\n/,
      (m) => m + `
// ---- План «Б»: изоляция данных tawanpower в собственной схеме общего проекта Supabase ----
// Если SUPABASE_SCHEMA задан (напр. "tawanpower"), все клиенты привязываются к этому профилю
// (Accept-Profile/Content-Profile) — код вызовов (.from/.rpc) остаётся прежним.
// Живой Solar-проект не задаёт эти переменные и продолжает работать в public без изменений.
export const SUPABASE_SCHEMA = (typeof process !== 'undefined' && process.env.SUPABASE_SCHEMA || '').trim();
export const SUPABASE_STORAGE_PREFIX = (typeof process !== 'undefined' && process.env.SUPABASE_STORAGE_PREFIX || '').trim();
export const sbBucket = (name: string) => (SUPABASE_STORAGE_PREFIX ? \`\${SUPABASE_STORAGE_PREFIX}-\${name}\` : name);

function withSchema<T extends { schema: (name: string) => T }>(client: T): T {
  return SUPABASE_SCHEMA ? client.schema(SUPABASE_SCHEMA) : client;
}

/**
 * Обёртка для прямых вызовов createClient(url, key, opts) в API-роутах и серверных скриптах.
 * Имя createScopedClient — по смыслу; вызов не отличается от @supabase/supabase-js createClient.
 */
export function createScopedClient(url: string, key: string, options?: Parameters<typeof import('@supabase/supabase-js').createClient>[2]) {
  return withSchema(createClient(url, key, options));
}
`
    );
    // оборачиваем browser и admin клиентов
    t = t.replace(
      'export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY\n  ? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)\n  : null as any;',
      'export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY\n  ? withSchema(createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY))\n  : null as any;'
    );
    t = t.replace(
      'export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY\n  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {',
      'export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY\n  ? withSchema(createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {'
    );
    writeFileSync(f, t);
    changed++;
    log('patched src/lib/supabase.ts (central schema binding)');
  } else log('src/lib/supabase.ts already patched');
}

// ---------- 1. inline createClient из supabase-js → createScopedClient ----------
const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const full = join(d, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.next', '.git'].includes(e.name)) walk(full); }
    else if (/\.(ts|tsx|mts)$/.test(e.name)) files.push(full);
  }
})(join(ROOT, 'src'));

for (const f of files) {
  const rel = relative(ROOT, f).split('\\').join('/');
  if (rel === 'src/lib/supabase.ts') continue;
  let t = readFileSync(f, 'utf8');
  const re = /import\s*\{([^}]*)\}\s*from\s*['"]@supabase\/supabase-js['"]\s*;?/;
  const m = t.match(re);
  if (!m) continue;
  const names = m[1].split(',').map(s => s.trim()).filter(Boolean);
  if (!names.includes('createClient')) continue;
  const rest = names.filter(n => n !== 'createClient');
  const addLines = [`import { createScopedClient as createClient } from '@/lib/supabase';`];
  if (rest.length) addLines.unshift(`import { ${rest.join(', ')} } from '@supabase/supabase-js';`);
  t = t.replace(m[0], addLines.join('\n'));
  writeFileSync(f, t);
  changed++;
  log(`patched ${rel} (inline client → scoped)`);
}

// ---------- 2. бакеты продуктов/пропозлов ----------
for (const f of files) {
  const rel = relative(ROOT, f).split('\\').join('/');
  if (rel === 'src/lib/supabase.ts') continue;
  let t = readFileSync(f, 'utf8');
  if (!/storage\.from\(['"](proposals|products)['"]\)/.test(t)) continue;
  t = t.replace(/storage\.from\(['"](proposals|products)['"]\)/g, (mm, b) => `storage.from(sbBucket('${b}'))`);
  // импорт sbBucket рядом с существующим импортом из '@/lib/supabase'
  if (/from ['"]@\/lib\/supabase['"]/.test(t)) {
    t = t.replace(/import\s*\{([^}]*)\}\s*from(['"]@\/lib\/supabase['"])/, (mm, names, from) =>
      names.includes('sbBucket') ? mm : `import { [SPEC] } ${from.replace(from, from)}`.replace('[SPEC]', [names.trim(), 'sbBucket'].filter(Boolean).join(', '))
    );
  } else {
    t = `import { sbBucket } from '@/lib/supabase';\n` + t;
  }
  writeFileSync(f, t);
  changed++;
  log(`patched ${rel} (bucket isolation)`);
}

// ---------- 3. env ----------
{
  const f = join(ROOT, '.env.local');
  let t = '';
  try { t = readFileSync(f, 'utf8'); } catch { t = ''; }
  const add = [];
  if (!/^SUPABASE_SCHEMA=/m.test(t)) add.push(`SUPABASE_SCHEMA=tawanpower`);
  if (!/^SUPABASE_STORAGE_PREFIX=/m.test(t)) add.push(`SUPABASE_STORAGE_PREFIX=tp`);
  if (add.length) { writeFileSync(f, t + (t && !t.endsWith('\n') ? '\n' : '') + add.join('\n') + '\n'); changed++; log('env appended:', add.join(', ')); }
}

log(`\n== done, ${changed} шаг(ов) ==`);
