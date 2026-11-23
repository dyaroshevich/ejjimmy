// Ingest markdown/text sources into knowledge table (chunked + embedded).
// Usage (env via shell, never commit keys):
//   $env:GOOGLE_AI_KEY="..."; $env:SB_URL="https://..."; $env:SB_SRV="..."
//   node scripts/ingest-knowledge.mjs
// Sources controlled by SOURCES array below.
import fs from 'node:fs';
import path from 'node:path';

const SB_URL = process.env.SB_URL;
const SB_SRV = process.env.SB_SRV;
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
if (!SB_URL || !SB_SRV || !GOOGLE_AI_KEY) {
  console.error('Missing SB_URL / SB_SRV / GOOGLE_AI_KEY env vars');
  process.exit(1);
}

const ROOT = path.resolve(process.argv[2] || '.');

const SOURCES = [
  { file: 'docs/seller-scripts-integration/01-database-foundation.md', category: 'seller_scripts', title: 'Seller scripts: database foundation' },
  { file: 'docs/seller-scripts-integration/02-seller-scripts-engine.md', category: 'seller_scripts', title: 'Seller scripts engine' },
  { file: 'docs/seller-scripts-integration/03-knowledge-enrichment.md', category: 'seller_scripts', title: 'Knowledge enrichment' },
  { file: 'docs/seller-scripts-integration/04-recommendation-engine.md', category: 'seller_scripts', title: 'Recommendation engine' },
  { file: 'docs/seller-scripts-integration/05-automation-integration.md', category: 'seller_scripts', title: 'Automation integration' },
  { file: 'data/this systems/1.md', category: 'systems', title: 'System guide 1' },
  { file: 'data/this systems/2.md', category: 'systems', title: 'System guide 2' },
  { file: 'data/this systems/3.md', category: 'systems', title: 'System guide 3' },
  { file: 'data/this systems/synergy-allinone.md', category: 'systems', title: 'Synergy all-in-one' },
  { file: 'data/solar-products/PRICE_LIST_2026.md', category: 'pricing', title: 'Price list 2026' },
  { file: 'data/solar-products/PRICE_LIST_SIMPLE.txt', category: 'pricing', title: 'Price list simple' },
  { file: 'docs/research/03_permits_regulations_thailand.md', category: 'regulations', title: 'Permits and regulations TH' },
  { file: 'docs/research/05_customer_financing_thailand.md', category: 'regulations', title: 'Customer financing TH' },
  { file: 'docs/research/06_certifications_standards_thailand.md', category: 'regulations', title: 'Certifications and standards TH' },
];

function chunkWords(text, maxWords = 400, overlap = 80) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [text];
  const out = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    out.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
    start += maxWords - overlap;
  }
  return out;
}

async function sb(pathname, method = 'GET', body) {
  const res = await fetch(`${SB_URL}/rest/v1/${pathname}`, {
    method,
    headers: {
      apikey: SB_SRV,
      Authorization: `Bearer ${SB_SRV}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : undefined,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`SB ${method} ${pathname}: ${res.status} ${await res.text()}`);
  return method === 'GET' || res.status !== 204 ? res.json() : null;
}

async function embed(text, tries = 8) {
  for (let attempt = 0; attempt < tries; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_AI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { parts: [{ text: text.slice(0, 20000) }] } }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.embedding.values.slice(0, 768);
    }
    if (res.status === 429 && attempt < tries - 1) {
      const wait = Math.min(15000 * 2 ** attempt, 180000);
      console.log(`429 quota, waiting ${Math.round(wait / 1000)}s (attempt ${attempt + 1})`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Embed ${res.status}: ${await res.text()}`);
  }
}

async function existingIndexes(sourceFile) {
  const rows = await sb(
    `knowledge?select=metadata&metadata->>source_file=eq.${encodeURIComponent(sourceFile)}`
  );
  const set = new Set();
  for (const r of rows || []) {
    const i = r?.metadata?.chunk_index;
    if (typeof i === 'number') set.add(i);
  }
  return set;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let inserted = 0, skipped = 0;
for (const src of SOURCES) {
  const abs = path.join(ROOT, src.file);
  if (!fs.existsSync(abs)) {
    console.log(`SKIP missing: ${src.file}`);
    continue;
  }
  // Dedup: skip source already ingested
  const existing = await sb(
    `knowledge?select=id&metadata->>source_file=eq.${encodeURIComponent(src.file)}&limit=1`
  );
  if (existing && existing.length > 0) {
    console.log(`SKIP done: ${src.file}`);
    skipped++;
    continue;
  }
  const text = fs.readFileSync(abs, 'utf8');
  const chunks = chunkWords(text);
  const done = await existingIndexes(src.file);
  const todo = chunks.map((c, i) => [c, i]).filter(([, i]) => !done.has(i));
  if (todo.length === 0) {
    console.log(`SKIP done: ${src.file} (${chunks.length} chunks)`);
    skipped++;
    continue;
  }
  console.log(`INGEST ${src.file}: ${todo.length}/${chunks.length} chunks`);
  for (const [chunk, i] of todo) {
    const emb = await embed(chunks[i]);
    await sb('knowledge', 'POST', {
      content: chunks[i],
      embedding: `[${emb.join(',')}]`,
      metadata: {
        category: src.category,
        title: src.title,
        source_file: src.file,
        chunk_index: i,
        total_chunks: chunks.length,
        locale: 'th',
      },
    });
    inserted++;
    await sleep(500);
  }
}
console.log(`DONE inserted=${inserted} skipped_sources=${skipped}`);
