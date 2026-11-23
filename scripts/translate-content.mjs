// Translate catalog + case rows to English and insert them as sibling rows.
// Usage: node scripts/translate-content.mjs [--dry]
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'K:/code/tawanpower';
const DRY = process.argv.includes('--dry');

function readEnv() {
  const txt = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
  const get = (key) => {
    const m = txt.match(new RegExp('^' + key + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^"|"$/g, '') : '';
  };
  return {
    url: get('NEXT_PUBLIC_SUPABASE_URL'),
    key: get('SUPABASE_SERVICE_ROLE_KEY'),
    google: get('GOOGLE_GENERATIVE_AI_API_KEY'),
    groq: get('GROQ_API_KEY'),
  };
}

const ENV = readEnv();
if (!ENV.url || !ENV.key || !ENV.google) {
  console.error('Missing env vars');
  process.exit(1);
}

const H = { apikey: ENV.key, Authorization: `Bearer ${ENV.key}`, 'Content-Type': 'application/json' };

async function api(pathname, method = 'GET', body) {
  const res = await fetch(`${ENV.url}/rest/v1/${pathname}`, {
    method,
    headers: { ...H, Prefer: method === 'POST' ? 'return=representation' : undefined },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${pathname}: ${res.status} ${await res.text()}`);
  return method === 'GET' ? res.json() : res.status === 204 ? null : res.json();
}

const GLOSSARY = `Glossary (keep exactly): Tawan Power, GoodWe, Sigenergy, Deye, Huawei, Jinko, LONGi, Dyness, LVTOPSUN, PEA, MEA, kWh, kWp, ROI, BOI, PDPA, 3-phase, 1-phase, On-Grid, Hybrid, PPA. Do not translate model codes. Thai baht stays as ฿. Keep technical specs identical.`;

async function translate(text, tries = 6) {
  if (!text || !text.trim()) return text;
  for (let attempt = 0; attempt < tries; attempt++) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENV.groq}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a technical translator for a Thai solar installer. Translate Thai to natural, sales-grade English. Output ONLY the translated text - no preamble, no quotes, no glossary echo, no commentary. ${GLOSSARY}`,
          },
          { role: 'user', content: text },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return (data?.choices?.[0]?.message?.content || '').trim().replace(/^```[\s\S]*?\n|```$/g, '').trim();
    }
    if (res.status === 429 && attempt < tries - 1) {
      const wait = 4000 * (attempt + 1);
      console.log(`    429, waiting ${wait / 1000}s`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateProducts() {
  const rows = await api('solar_products?select=*&locale=eq.th&order=id');
  console.log(`PRODUCTS th=${rows.length}`);
  let done = 0;
  for (const row of rows) {
    const id = row.id.endsWith('-en') ? row.id : `${row.id}-en`;
    const exists = await api(`solar_products?select=id&id=eq.${encodeURIComponent(id)}`);
    if (exists.length) { console.log(`  skip ${id}`); continue; }
    const [name, description] = [await translate(row.name), await translate(row.description)];
    await sleep(1500);
    const payload = { ...row, id, locale: 'en', name, description };
    delete payload.embedding;
    if (!DRY) await api('solar_products', 'POST', [payload]);
    done++;
    console.log(`  ${DRY ? 'dry' : 'ok'} ${id} :: ${name}`);
  }
  return done;
}

async function translateCases() {
  const rows = await api('solar_cases?select=*&locale=eq.th');
  console.log(`CASES th=${rows.length}`);
  let done = 0;
  for (const row of rows) {
    const slug = `${row.slug}-en`;
    const exists = await api(`solar_cases?select=slug&slug=eq.${encodeURIComponent(slug)}`);
    if (exists.length) { console.log(`  skip ${slug}`); continue; }
    const payload = {
      ...row,
      slug,
      locale: 'en',
      customer_name: await translate(row.customer_name),
      case_description: await translate(row.case_description),
      customer_quote: await translate(row.customer_quote),
    };
    if (payload.location_name) payload.location_name = await translate(row.location_name);
    delete payload.id;
    delete payload.embedding;
    await sleep(1500);
    if (!DRY) await api('solar_cases', 'POST', [payload]);
    done++;
    console.log(`  ${DRY ? 'dry' : 'ok'} ${slug}`);
  }
  return done;
}

const p = await translateProducts();
const c = await translateCases();
console.log(`DONE products=${p} cases=${c}${DRY ? ' (dry run)' : ''}`);
