import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { siteFromHost } from './site.config';

/**
 * Sanitize environment variables used in HTTP headers.
 * Removes invisible non-ISO characters (zero-width spaces, etc.) that
 * trigger the "String contains non ISO-8859-1 code point" TypeError.
 */
export const sanitizeHeaderValue = (val: string | undefined): string => {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/[^\u0000-\u00FF]/g, '')
    .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '')
    .replace(/[\r\n]/g, '')
    .trim();
};

export const SUPABASE_URL = sanitizeHeaderValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
export const SUPABASE_ANON_KEY = sanitizeHeaderValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
export const SUPABASE_SERVICE_ROLE_KEY = sanitizeHeaderValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

// ---- План «Б»: изоляция данных tawanpower в собственной схеме общего проекта Supabase ----
// Если SUPABASE_SCHEMA задан (напр. "tawanpower"), все клиенты создаются с db.schema = схемой
// (документированный способ: "each client connection can only access a single schema").
// Код вызовов (.from/.rpc/.scope) остаётся прежним.
// Живой Solar-проект не задаёт эти переменные и продолжает работать в public без изменений.
export const SUPABASE_SCHEMA = (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || process.env.SUPABASE_SCHEMA) || '').trim();
export const SUPABASE_STORAGE_PREFIX = (typeof process !== 'undefined' && process.env.SUPABASE_STORAGE_PREFIX || '').trim();
export const sbBucket = (name: string) => (SUPABASE_STORAGE_PREFIX ? `${SUPABASE_STORAGE_PREFIX}-${name}` : name);

const schemaOptions = (): Partial<SupabaseClientOptions<any>> =>
  SUPABASE_SCHEMA ? { db: { schema: SUPABASE_SCHEMA } } : {};

/**
 * Обёртка для прямых вызовов createClient(url, key, opts) в API-роутах и серверных скриптах.
 * Поведение полностью повторяет @supabase/supabase-js createClient, плюс привязка к SUPABASE_SCHEMA.
 */
export function createScopedClient(
  url: string,
  key: string,
  options?: SupabaseClientOptions<any>
) {
  if (options) {
    return createClient(url, key, {
      ...options,
      db: SUPABASE_SCHEMA ? { ...(options.db || {}), schema: SUPABASE_SCHEMA } : options.db,
    });
  }
  return createClient(url, key, schemaOptions());
}

// The browser talks to PostgREST directly with the anon key, so RLS is the only guard it has: the
// request's hostname rides along as `x-site` and the policies in the tenant migration read it. On the
// server there is no hostname to read here, and the server clients scope themselves (`tenant.ts`).
const siteHeader =
  typeof window !== 'undefined'
    ? { headers: { 'x-site': siteFromHost(window.location.host).id } }
    : undefined;

// Browser client — stores session in COOKIES (not localStorage)
// null fallback is only for build-time when env vars are not yet available
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, { ...schemaOptions(), ...(siteHeader ? { global: siteHeader } : {}) })
  : null as any;

// Admin client (bypasses RLS - ONLY FOR SERVER SIDE)
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      ...schemaOptions(),
    })
  : null;
