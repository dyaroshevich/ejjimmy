# PDF Proposal — Полное описание системы

> Документация генерации PDF-предложений. Двойной движок: Browserless.io → PDFSpark.
> Формат: A4 (210×297mm portrait), Chrome Headless рендер.

---

## 1. Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    PDF ENGINE                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  POST /api/pdf/proposal ←────── Admin CustomOfferHub    │
│       │                                                 │
│       ├── 1. Atomic Lock (UPDATE ... WHERE id = N)      │
│       ├── 2. Build PDF Data (buildPDFData)              │
│       ├── 3. Render HTML (ProposalDocument.tsx)         │
│       ├── 4. Browserless.io (primary)                   │
│       │    └── fallback → PDFSpark (secondary)          │
│       ├── 5. Upload to Supabase Storage                 │
│       ├── 6. Save Snapshot (JSONB)                      │
│       └── 7. Update lead.proposal_url                   │
│                                                         │
│  GET  /api/pdf/status?id=N  ←── Polling (client)        │
│  GET  /api/pdf/download?leadId=N  ←── Proxy download    │
│  GET  /api/pdf/spec  ←── Spec sheet image gen            │
│  GET  /api/pdf/snapshots/[id]  ←── Snapshot list        │
│  GET  /api/pdf/proposal-html/[id]  ←── Rendered HTML    │
│  GET  /api/pdf/preview-html/[id]  ←── Preview HTML      │
│  POST /api/pdf/proposal/link  ←── Share link            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Файловая структура

| Файл | Назначение |
|------|-----------|
| `src/app/api/pdf/proposal/route.ts` | **Главный API**: генерация PDF |
| `src/app/api/pdf/status/route.ts` | **API**: статус генерации |
| `src/app/api/pdf/download/route.ts` | **API**: прокси-скачивание (SSRF-safe) |
| `src/app/api/pdf/spec/route.ts` | **API**: PDF спецификации |
| `src/app/api/pdf/snapshots/[id]/route.ts` | **API**: список снапшотов |
| `src/app/api/pdf/proposal-html/[id]/route.ts` | **API**: HTML билда для генерации |
| `src/app/api/pdf/preview-html/[id]/route.ts` | **API**: превью HTML |
| `src/app/api/pdf/proposal/link/route.ts` | **API**: генерация ссылки |
| `src/lib/pdf/browserless-generator.ts` | **Движок #1**: Browserless.io |
| `src/lib/pdf/generator.ts` | **Движок #2**: PDFSpark (fallback) + `PDFData` interface |
| `src/lib/pdf/build-data.ts` | Билд данных для PDF из лида |
| `src/components/ProposalDocument.tsx` | React-компонент → HTML → PDF |
| `src/lib/proposal-html.tsx` | `renderToStaticMarkup()` обёртка |

---

## 2. Двойной движок генерации

### Primary: Browserless.io

| Параметр | Значение |
|----------|---------|
| Endpoint | `https://chrome.browserless.io/pdf?token={BROWSERLESS_API_KEY}` |
| Метод | POST, JSON (`{ html, options }`) |
| Таймаут | 30s (`AbortSignal.timeout(30000)`) |
| Размер | `format: 'A4'` |
| Поля | `printBackground: true`, `margin: 0` |
| Retry | Нет — 1 попытка, при ошибке → fallback |
| Ключ | `BROWSERLESS_API_KEY` env var |

**Файл:** `src/lib/pdf/browserless-generator.ts:1-40`

```typescript
const response = await fetch(
  `https://chrome.browserless.io/pdf?token=${apiKey}`,
  { method: 'POST', body: JSON.stringify({ html, options: { format: 'A4', printBackground: true } }),
    signal: AbortSignal.timeout(30000) }
);
```

Возвращает `Buffer` или `null` (при любой ошибке → fallback).

### Fallback: PDFSpark

| Параметр | Значение |
|----------|---------|
| Endpoint | `https://pdfspark.dev/api/v1/pdf/from-html` |
| Ретраи | 2 попытки (всего) |
| Задержки | 3s, 6s (между попытками) |
| Таймаут | 25s на попытку |
| Retry trigger | 503, 429, AbortError |

**Файл:** `src/lib/pdf/generator.ts:64-117`

```typescript
for (let attempt = 1; attempt <= 2; attempt++) {
  const response = await fetch(pdfsparkUrl, { body: JSON.stringify({ html }),
    signal: AbortSignal.timeout(25000) });
  if (response.ok) return Buffer.from(await response.arrayBuffer());
  if (isRetryable(response.status) && attempt < 2) await delay(3000);
}
return null;
```

### Почему Browserless.io — primary

PDFSpark (pdfspark.dev) **ненадёжен**: /status возвращает "operational", но Chromium внутри не работает — все запросы к /from-html и /from-url падают с 503. Browserless.io стабилен, 30s timeout, рендерит через реальный Chrome Headless.

---

## 3. Атомарный лок (Race Condition Fix)

### Проблема

При concurrent запросах (быстрое двойное нажатие "Generate"):
1. Запрос A читает `proposal_url = null`
2. Запрос B читает `proposal_url = null`
3. A пишет `proposal_url = '__generating__'`
4. B пишет `proposal_url = '__generating__'` (затирает A)
5. A заканчивает, пишет `proposal_url = 'storage://...'`
6. B заканчивает, пишет `proposal_url = 'storage://...'` (затирает A)

### Решение: TOCTOU → Atomic UPDATE

```typescript
// Было (TOCTOU — read-then-write с .or()):
await supabase.from('leads').update({ proposal_url: '__generating__' })
  .eq('id', leadId)
  .or(`proposal_url.is.null,proposal_url.eq.__generating__,proposal_url.like./proposal/%`);

// Стало (атомарный UPDATE только по id):
const { data: locked } = await supabase
  .from('leads')
  .update({ proposal_url: '__generating__', ...offerFields })
  .eq('id', leadId)
  .select('id')
  .single();

if (!locked) {
  return { status: 'generating' }; // другой процесс уже занят
}
```

**Ключевой момент:** Убран `.or()` на `proposal_url`. Старое условие не матчило существующие storage URL (`https://xxx.supabase.co/...`), поэтому `force: true` всегда возвращал `{status: 'generating'}` — клиент видел "Unknown error". Теперь UPDATE матчится только по `id`.

### Stale Lock Detection

Если `proposal_url === '__generating__'` но прошло > 60s, лок считается stale:

```typescript
const stale = Date.now() - updatedAt.getTime() > TTL_MS; // 60 000ms
if (!stale) return { status: 'generating' };
// stale → продолжаем
```

---

## 4. Полный пайплайн генерации

### Шаг 1: Auth & Validation

- `leadId` → decode hashid or parse numeric (`route.ts:24-36`)
- `requestUserId` vs `lead.line_id` — проверка владельца (403 при несовпадении)
- `force: true` — регенерация, даже если PDF уже есть
- Cache hit: если `proposal_url` существует и не `__generating__` → возврат сразу

### Шаг 2: Field Map

Поля из тела запроса мержатся в лид in-memory перед билдом:

```typescript
const fieldMap = {
  selected_product_id, system_size, base_price, manpower,
  discount_percent, installation_days, maintenance_visits,
  system_warranty, inverter_warranty, panel_warranty,
  panel_product_warranty, panel_performance_warranty,
  equipment_tier
};
```

### Шаг 3: Atomic Lock

```sql
UPDATE leads SET proposal_url = '__generating__', ...offerFields WHERE id = $leadId
```

### Шаг 4: Build PDF Data

`buildPDFData(lead)` в `src/lib/pdf/build-data.ts`:

| Path | Условие | Что делает |
|------|---------|-----------|
| A (sample) | Нет `bill_amount`, нет `base_price` | Хардкод 5kW, 200k THB |
| B (custom) | Нет `bill_amount`, есть `base_price` | `estimatedBill = systemKw × 800` THB/мес |
| C (full) | Есть `bill_amount` | Полный расчёт: 25-year projection, ROI, payback |

### Шаг 5: Render HTML

```typescript
const html = await renderProposalHtml(pdfData);
// → ProposalDocument.tsx → renderToStaticMarkup()
```

`ProposalDocument.tsx` — React-компонент с Tailwind CSS inline (для рендера в PDF). Использует `<img>` вместо `<Image />` (renderToString контекст).

### Шаг 6: PDF Generation

```typescript
let pdfBuffer = await BrowserlessGenerator.generateFromHtml(html);
if (!pdfBuffer) {
  pdfBuffer = await PDFGenerator.generateProposal(html); // PDFSpark fallback
}
if (!pdfBuffer) {
  // Оба движка упали → fallback
  await supabase.from('leads').update({ proposal_url: null }).eq('id', leadId);
  return { status: 'fallback', interactiveUrl: `/proposal/${encodeId(leadId)}` };
}
```

### Шаг 7: Upload

- File: `TawanPower_Proposal_{leadId}_v{timestamp}.pdf`
- Bucket: `proposals` (Supabase Storage)
- 2 retries с задержкой 1s
- Upsert: true

### Шаг 8: Save Snapshot (JSONB)

```typescript
await supabase.from('proposal_snapshots').insert({
  lead_id: leadId,
  label: label, // v{YYYY-MM-DD}
  snapshot_data: { ...pdfData, pdf_url: publicUrl },
});
```

**Снапшот создаётся ТОЛЬКО после подтверждения загрузки PDF.** Раньше — орфан-снапшоты при падении генерации.

### Шаг 9: Update Lead

```typescript
await supabase.from('leads').update({ proposal_url: publicUrl }).eq('id', leadId);
```

---

## 5. API Endpoints

### POST `/api/pdf/proposal`

Тело запроса:

```json
{
  "leadId": 42,
  "force": false,
  "label": "v2026-06-30",
  "system_size": 5.0,
  "base_price": 200000,
  "manpower": 15000,
  "discount_percent": 10,
  "equipment_tier": "eco"
}
```

**Ответы:**

| HTTP | JSON | Когда |
|------|------|-------|
| 200 | `{status:'ready', url:'https://...', snapshot_id: 7}` | PDF готов |
| 200 | `{status:'generating'}` | Уже генерируется |
| 200 | `{status:'fallback', interactiveUrl:'/proposal/abc'}` | Оба движка упали |
| 403 | `{error:'Unauthorized'}` | Чужой лид |
| 500 | `{error:'Upload failed'}` | Ошибка Storage |

### GET `/api/pdf/status?id=N`

```json
{
  "status": "ready" | "generating" | "pending",
  "url": "https://..." | null
}
```

- `'__generating__'` → `"generating"`
- `null` → `"pending"`
- любой другой URL → `"ready"`

### GET `/api/pdf/download?leadId=N&snapshotId=N&mode=download|view`

SSRF-safe прокси. **Никогда не грузит PDF напрямую из браузера** — только через same-origin.

| Параметр | Описание |
|----------|----------|
| `leadId` | ID лида (numeric или hashid) |
| `snapshotId` | (опц.) ID снапшота |
| `mode` | `download` (attachment) или `view` (inline) |

**SSRF Protection** (`route.ts:8-15`):
```typescript
const ALLOWED_HOSTS = ['storage.googleapis.com', supabase_url.hostname];
// Блокирует любые URL не из Supabase Storage
```

Sanitizes filename: `replace(/[^a-zA-Z0-9\s_-]/g, '')`.

### POST `/api/pdf/proposal/link`

Генерирует share link для LINE.

---

## 6. Hashid Support

Во всех API эндпоинтах `leadId` может быть numeric (`42`) или hashid (`"abcXYZ"`):

```typescript
if (isNaN(Number(rawId))) {
  leadId = decodeId(rawId); // hashid → number
} else {
  leadId = Number(rawId);
}
```

Используется в:
- `POST /api/pdf/proposal`
- `GET /api/pdf/status`
- `GET /api/pdf/download`
- `GET /api/pdf/proposal-html/[id]`
- `GET /api/pdf/preview-html/[id]`

---

## 7. Status API Semantics

| `proposal_url` в БД | Статус | Что значит |
|---------------------|--------|-----------|
| `null` | `pending` | PDF никогда не генерировался |
| `'__generating__'` | `generating` | Генерация в процессе |
| `https://xxx.supabase.co/...` | `ready` | PDF готов |
| `null` (после ошибки) | `pending` | Сброс после `fallback` |

---

## 8. Proposal Page (Client-Facing)

Страница `/proposal/[id]` — **download-only**. PDF не генерируется с клиента.

- Если `proposal_url` существует → зелёная gradient кнопка "ดาวน์โหลด"
- Если `proposal_url = null` → серая disabled кнопка
- Кнопка "จองคิวติดตั้ง" → `<a href="tel:{phone}">`
- ROI bar: `(solarTotal / peaTotal) * 100` (динамическая ширина)
- Brand/model/tier — из данных продукта (не хардкод)
- PDF через same-origin прокси: `/api/pdf/download?leadId=N&mode=view`
- Снапшоты: `snapshot_data.pdf_url` включён в ответ API

---

## 9. Data Calculations

### TotalCost

```
totalCost = basePrice + manpower - (basePrice * discountPercent / 100)
```

### 25-Year Projection

```
totalWithoutSolar = monthlyBill * 12 * 25
totalWithSolar    = totalCost + (monthlyBill - monthlySavings) * 12 * 25
netSave           = totalWithoutSolar - totalWithSolar
```

### ROI (% годовых)

```
roiPercent = (netSave / totalCost * 100 / 25)
```

### Payback (лет)

```
paybackYears = totalCost / (monthlySavings * 12)
```

### Estimated Bill (Path B — без bill_amount)

```
estimatedBill   = systemKw * 800       -- THB/мес
monthlySavings  = estimatedBill * 0.5   -- 50% экономия
```

---

## 10. Snapshots

Таблица `proposal_snapshots`:

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | int8 | PK |
| `lead_id` | int8 | FK → leads.id |
| `label` | text | Метка (e.g. "v2026-06-30") |
| `snapshot_data` | jsonb | Полный `PDFData` + `pdf_url` |
| `created_at` | timestamptz | Когда создан |

---

## 11. Обработка ошибок

```typescript
catch (error: unknown) {
  // Пытаемся сбросить proposal_url
  await sb.from('leads').update({ proposal_url: null }).eq('id', leadId);
  return NextResponse.json({ error: message }, { status: 500 });
}
```

- При любой ошибке: `proposal_url → null` (чтобы клиент видел `pending`)
- Если ошибка после загрузки в Storage — URL теряется (файл остаётся в бакете)
- Логи с префиксом `[PDF]`

---

## 12. Environment Variables

| Переменная | Где используется | Обязательна |
|-----------|-----------------|-------------|
| `BROWSERLESS_API_KEY` | Browserless.io | ✅ Да |
| `NEXT_PUBLIC_SUPABASE_URL` | Storage upload | ✅ Да |
| `SUPABASE_SERVICE_ROLE_KEY` | DB операции | ✅ Да |
| `HASHIDS_SALT` | Hashid encode/decode | ✅ Да |

---

## 13. Как устроены страницы PDF (`ProposalDocument.tsx`)

### Общая архитектура компонента

`ProposalDocument.tsx` — это React-компонент, который рендерится в HTML через `renderToStaticMarkup()` (см. `src/lib/proposal-html.tsx`). Полученный HTML отправляется в Browserless.io (или PDFSpark), который конвертирует его в PDF через Chrome Headless.

**Ключевое ограничение:** компонент работает вне контекста Next.js — нет `next/image`, нет хуков, нет роутинга. Только чистая вёрстка + Tailwind CDN.

### Структура компонента

```tsx
export default function ProposalDocument({ data }: { data: PDFData }) {
  return (
    <html lang="th">
      <head>
        <script src="https://cdn.tailwindcss.com" />   {/* Tailwind CDN */}
        <link href={FONT_HREF} rel="stylesheet" />      {/* Inter + JetBrains Mono */}
        <style>{`
          @page { size: A4 landscape; margin: 0; }
          body { font-family: 'Inter', sans-serif; }
        `}</style>
      </head>
      <body>
        <Page> ... </Page>   {/* P1: COVER */}
        <Page> ... </Page>   {/* P2: ROI ANALYSIS */}
        <Page> ... </Page>   {/* P3: PACKAGE SUMMARY (выбранный продукт) */}
        <Page> ... </Page>   /* P4: PRODUCT COMPARISON (3 тарифа) */
        {FEATURES.sofin && <Page> ... </Page>} /* P5: SOFIN FINANCING */
      </body>
    </html>
  );
}
```

### Компонент `Page`

Каждая страница — это `<div>` формата A4 landscape (297×210mm):

```tsx
function Page({ children, className = '' }) {
  return (
    <div className="proposal-page w-[297mm] h-[210mm] bg-white relative overflow-hidden"
      style={{ pageBreakAfter: 'always', breakAfter: 'page' }}>
      {children}
    </div>
  );
}
```

**Важно:** `pageBreakAfter: 'always'` — каждая страница гарантированно начинается с новой страницы при печати.

### P1 — COVER (строки 83-151)

```
┌──────────────────────────────────────────────────────┐
│  w-[35%] bg-emerald-950  │     flex-1 (white)       │
│                           │                          │
│  TAWAN POWER           │  "ข้อเสนอเฉพาะสำหรับ"     │
│  Solar Engineering · Krabi│                          │
│                           │    {customerName}        │
│  {coverBadge}             │                          │
│  "เอกสารนำเสนอ"           │    ─── {location} ───    │
│                           │                          │
│  {coverTagline}           │  ☀️ X KWP │ 💰 Y/yr │ 📅 Zyr │
│                           │                          │
│  {engineerName}           │  🌱 CO₂ · 🌳 trees       │
│  {engineerTitle}          │                          │
└──────────────────────────────────────────────────────┘
```

**Как это влияет на вёрстку:**
- Левая панель 35% — тёмно-зелёный градиент с декоративными blur-кругами
- Правая панель 65% — белая, информация по центру
- Внизу: три карточки в `grid grid-cols-3 gap-5`
- Engineer имя/должность — из `data.engineerName`/`data.engineerTitle`

**Что можно менять:**
- Ширину левой панели (`w-[35%]`)
- Цветовую схему (`bg-emerald-950`, blur-круги)
- Количество/состав карточек внизу
- Текст `coverBadge` (зависит от `scenario`)
- Отображаемые данные engineer

### P2 — ROI ANALYSIS (строки 153-256)

Сетка 2×2: 4 карточки KPI сверху, сравнение 25 лет + "почему TAWAN POWER" снизу.

```
┌──────────────────────────────────────────────────────┐
│  02 / การวิเคราะห์ผลตอบแทน                           │
│                                                      │
│ ┌──ประหยัด/ปี──┐ ┌──คืนทุน──┐ ┌──กำไร 25 ปี──┐ ┌──CO₂──┐│
│ │  {yearly}    │ │ {pay}  │ │  {netSave}   │ │{co2}t ││
│ │  X% บิล     │ │        │ │  Y%/ปี       │ │{trees}││
│ └──────────────┘ └──────────┘ └──────────────┘ └──────┘│
│                                                      │
│ ┌─── Сравнение 25 лет ───┐ ┌─── ทำไม TAWAN POWER ──┐ │
│ │ PEA: rose bar (100%)   │ │ ✦ premium.brand       │ │
│ │ TP: emerald bar (N%)   │ │ ✦ 6005-T5             │ │
│ │                        │ │ ✦ บริการครบวงจร       │ │
│ │ "คุณประหยัดได้ {N}"    │ │                       │ │
│ └────────────────────────┘ └───────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Как это работает:**
- `totalWithoutSolar = monthlyBill * 12 * 25` — полная стоимость без солнечных панелей
- `totalWithSolar = totalCost + (monthlyBill - monthlySavings) * 12 * 25`
- Ширина бара: `(totalWithSolar / totalWithoutSolar) * 100`%
- ROI: `(netSave / totalCost * 100 / 25)` % годовых
- Нижняя панель — градиент `from-emerald-500 to-emerald-600`
- Правая колонка: блок "ทำไม TAWAN POWER" + блок "สำหรับบ้าน" или "สำหรับธุรกิจ" в зависимости от `data.location`

**Что можно менять:**
- Количество KPI (сейчас 4)
- Цвета карточек (`bg-emerald-50`, `bg-amber-50`, `bg-blue-50`, `bg-green-50`)
- Текст преимуществ (статический список из 3 пунктов)
- Формула ширины бара
- Блок business/home (выбор по `location === 'business'`)

### P3 — PACKAGE SUMMARY (строки 258-369)

Показывает выбранный продукт (selectedTier) с деталями и комплектацией.

```
┌──────────────────────────────────────────────────────┐
│  03 / สรุปแพ็กเกจของคุณ                              │
│  {selectedProduct.name}                              │
├──────────────────────────────────────────────────────┤
│ [220px] img     │  Таблица компонентов               │
│ description     │  ┌─── ─── ──── ───┐               │
│ гарантии:       │  │ ×2  Panel X  12yr│               │
│  🔧 ระบบ: 3 ปี  │  │ ×1  Inverter 10yr│               │
│  ☀️ แผง: 30 ปี │  └─── ─── ──── ───┘               │
│                 │                                    │
│                 │  Сводка расходов (если custom)     │
│                 │  ✅ บริการรวม                     │
└──────────────────────────────────────────────────────┘
```

**Как это работает:**
- `selectedProduct` = `data.tiers[data.selectedTier || 'premium']`
- `system_components` — массив `{ qty, item, warranty }` из БД
- Гарантии выводятся только если они есть в `selectedProduct`
- Сводка расходов показывается только при `data.customFields && data.totalCost > 0`
- "บริการรวม" — `included_services` массив

**Что можно менять:**
- Набор гарантий для отображения (сейчас: system, panel_product, panel_performance, inverter, battery)
- Дизайн таблицы компонентов
- Формат сводки расходов
- Иконки и цвета

### P4 — PRODUCT COMPARISON (строки 371-434)

Три колонки: ECO / PREMIUM / ULTRA.

```
┌──────────────────────────────────────────────────────┐
│  04 / เปรียบเทียบแพ็กเกจ                             │
│                                                      │
│ ┌── ECO ──┐  ┌── PREMIUM ──┐  ┌── ULTRA ──┐       │
│ │[img]    │  │[img]        │  │[img]      │       │
│ │Jinko    │  │Longi        │  │Sigenergy  │       │
│ │☀️ 12/30 │  │☀️ 12/30    │  │☀️ 12/30   │       │
│ │🔧 5yr   │  │🔧 10yr     │  │🔧 10yr    │       │
│ │💰 N/mo  │  │💰 N/mo     │  │💰 N/mo    │       │
│ │🛡️ 3yr   │  │🛡️ 10yr    │  │🛡️ 10yr    │       │
│ │         │  │✅ services  │  │✅ services│       │
│ │{price}  │  │{price}     │  │{price}    │       │
│ └─────────┘  └─────────────┘  └───────────┘       │
└──────────────────────────────────────────────────────┘
```

**Как это работает:**
- `tierMeta` — массив из 3 объектов с настройками отображения каждого тарифа
- Badge "✓ ที่คุณเลือก" появляется при `scenario === 'selected'` и совпадении `selectedTier`
- Выбранный тариф получает `ring-2 ring-emerald-200` и большую тень
- `specSafely(p, 'panel_warranty', '12/30 ปี')` — безопасное чтение спецификаций с fallback
- `getImg(p)` — подставляет правильный URL картинки (или placeholder)

**Что можно менять:**
- Количество тарифов (сейчас 3: eco, premium, ultra)
- Какие спецификации показывать в каждой колонке
- Дизайн выбранного тарифа (кольцо, тень, badge)
- Список услуг под каждым тарифом

### P5 — SOFIN FINANCING (строки 437-549)

Условная страница — рендерится только при `FEATURES.sofin === true`.

```
┌──────────────────────────────────────────────────────┐
│  05 / สินเชื่อ Sofin Solar                            │
│                                                      │
│ ┌──── кол-3 ────┐  ┌── кол-2 ──┐                   │
│ │ 10/90/85      │  │ downPayment│                   │
│ │ механизм      │  │ monthly36  │                   │
│ │               │  │ monthly60  │                   │
│ │ Сравнение     │  │ monthly48  │                   │
│ │ PEA vs Sofin  │  │           │                   │
│ │               │  │ ✓ преимущества │                │
│ │               │  │ QR код    │                   │
│ └───────────────┘  └───────────┘                   │
└──────────────────────────────────────────────────────┘
```

**Что можно менять:**
- Полное отключение через `FEATURES.sofin` (feature flag)
- Механизм финансирования (сейчас 10/90/85)
- Количество вариантов рассрочки (сейчас 3: 36, 60, 48 месяцев)
- Текст преимуществ (статический массив из 4 пунктов)
- QR-код (сейчас `api.qrserver.com`)

---

## 14. PDFData — контракт между компонентом и данными

### Интерфейс (src/lib/pdf/generator.ts:6-43)

```typescript
export interface PDFData {
  // Обязательные поля
  customerName: string;          // Имя клиента для PDF
  systemKw: number;              // Мощность системы (кВт)
  location: string;              // Локация (для cover + business/home)
  monthlyBill: number;           // Текущий счёт (THB/мес)
  monthlySavings: number;        // Экономия (THB/мес)
  paybackYears: number;          // Срок окупаемости (лет)
  totalCost: number;             // Полная стоимость системы (THB)
  tiers: {                       // 3 тарифа для сравнения
    eco: SolarProduct;
    premium: SolarProduct;
    ultra: SolarProduct;
  };
  installmentCalculation: {       // Расчёт рассрочки
    downPayment: number;
    monthly36: number;
    monthly60: number;
  };

  // Опциональные поля
  co2Year?: number;              // CO₂ экономия (тонн/год)
  treesYear?: number;            // Эквивалент деревьев
  scenario?: 'sample' | 'personal' | 'selected';  // Тип предложения
  selectedTier?: 'eco' | 'premium' | 'ultra';      // Выбранный тариф
  phone?: string;                // Контактный телефон
  email?: string;                // Email
  lineId?: string;               // LINE ID
  createdAt?: string;            // Дата создания
  roofType?: string;             // Тип крыши
  customFields?: {               // Кастомные поля (из админки)
    basePrice: number;
    manpower: number;
    discountPercent: number;
    installationDays: number;
    maintenanceVisits: number;
  };
  engineerName?: string;         // Имя инженера
  engineerTitle?: string;        // Должность инженера
}
```

### Как `SolarProduct` используется в `tiers`

Каждый объект тарифа может содержать (из таблицы `solar_products`):

| Поле | Откуда | Используется в PDF |
|------|--------|-------------------|
| `name` | product.name | Заголовок тарифа |
| `price_thb` | product.price_thb | Цена в колонке |
| `brand` | product.brand | Название бренда |
| `image_url` | product.image_url | Картинка продукта |
| `description` | product.description | Описание под именем |
| `specifications` | JSONB | Гарантии, модель инвертора |
| `included_services` | string[] | Список услуг |
| `system_components` | `{qty, item, warranty}[]` | Таблица компонентов |
| `system_warranty` | field | Гарантия на систему |
| `panel_product_warranty` / `panel_performance_warranty` | field | Гарантия на панели |
| `inverter_warranty` | field | Гарантия на инвертор |
| `battery_warranty` | field | Гарантия на батарею |

### Как данные попадают в PDF

```
Admin (CustomOfferHub)
  → POST /api/pdf/proposal (leadId + fields)
    → route.ts (fieldMap → merge в lead)
      → buildPDFData(lead)
        → Path A/B/C (в зависимости от bill_amount)
          → возвращает PDFData
        → renderProposalHtml(pdfData)
          → ProposalDocument({ data: pdfData })
            → renderToStaticMarkup() → HTML string
          → Browserless.io → PDF Buffer
```

---

## 15. Как влиять на дизайн PDF (рекомендации по улучшению)

### Принцип: данные отдельно, вёрстка отдельно

**Важнейшее правило:** `ProposalDocument.tsx` получает **готовые данные** через `PDFData`. Компонент не должен:
- Ходить в БД
- Считать сложные формулы (кроме визуальных — ширины баров, проценты)
- Принимать решения на основе необработанных данных лида

Это позволяет менять дизайн PDF без изменений в бэкенде, и наоборот.

### Что можно менять без изменений в API/БД

| Что изменить | Где править | Риск |
|-------------|-------------|------|
| Цветовую схему (emerald → blue) | `ProposalDocument.tsx` — Tailwind классы | Низкий |
| Шрифты, размеры | `ProposalDocument.tsx` — CSS/Tailwind | Низкий |
| Порядок страниц | `ProposalDocument.tsx` — JSX порядок | Низкий |
| Текст заголовков | `ProposalDocument.tsx` — строки | Низкий |
| Количество карточек KPI | `ProposalDocument.tsx` — grid | Средний |
| Ширину панелей (cover) | `ProposalDocument.tsx` — `w-[35%]` | Низкий |
| Иконки/эмодзи | `ProposalDocument.tsx` | Низкий |
| Формат валюты | `fmtTHB()` в `ProposalDocument.tsx` | Низкий |
| Текст engineer name/title | `data.engineerName` / `data.engineerTitle` | Низкий |
| QR-код | `ProposalDocument.tsx:539` | Низкий |

### Что требует изменений в API/БД

| Что изменить | Где править |
|-------------|-------------|
| Добавить новое поле в PDF | 1. `PDFData` interface (generator.ts) + 2. `buildPDFData()` (build-data.ts) + 3. ProposalDocument.tsx |
| Изменить расчёт ROI | `build-data.ts` (все 3 Path) |
| Изменить механизм финансирования | 1. `ProposalDocument.tsx` (P5) + 2. `build-data.ts` (installmentCalculation) |
| Добавить новую страницу | 1. `ProposalDocument.tsx` (новый `<Page>`) + 2. `PDFData` (новые поля) |
| Убрать страницу Sofin | `FEATURES.sofin` в feature-flags (или удалить JSX) |
| Изменить tiers (добавить 4-й тариф) | 1. `build-data.ts` (buildDefaultTiers) + 2. `ProposalDocument.tsx` (tierMeta, P4 сетка) |
| Добавить данные о клиенте (email, LINE) | Уже есть в `PDFData` — только добавить в JSX |
| Логотип компании | 1. `ProposalDocument.tsx` (заменить текстовый `TAWAN POWER` на `img`) |

### Как давать рекомендации дизайнеру

Для предложений по улучшению PDF используйте эту схему:

1. **Определите, что меняем:**
   - Визуал (цвета, шрифты, отступы, расположение) — только `ProposalDocument.tsx`
   - Данные (новые поля, расчёты) — `PDFData` + `build-data.ts` + `ProposalDocument.tsx`
   - Контент (текст, иконки) — только `ProposalDocument.tsx`

2. **Проверьте, не сломается ли бэкенд:**
   - Новые поля в `PDFData` → добавить в `build-data.ts` (все 3 Path: A, B, C)
   - Новые поля в БД → добавить в `leads` таблицу + `fieldMap` в `route.ts`
   - Изменение логики тарифов → `PDFGenerator.getProductTiers()` + `buildDefaultTiers()`

3. **Примеры рекомендаций с оценкой сложности:**

   | Идея | Файлы | Сложность |
   |------|-------|-----------|
   | "Сделать cover с фото клиента" | + поле в БД + `PDFData` + JSX | 🟡 Средняя |
   | "Добавить QR-ссылку на оплату" | Только JSX (заменить URL QR) | 🟢 Простая |
   | "Показать breakdown ежемесячной экономии" | + `build-data.ts` (расчёт) + `PDFData` + JSX | 🟡 Средняя |
   | "Добавить страницу с ссылками/контактами" | Только JSX (новый `<Page>`) | 🟢 Простая |
   | "Сделать 3D-сцену системы" | Невозможно в PDF (HTML → Chrome → PDF) | 🔴 Невозможно |
   | "Добавить гарантийные условия" | Только JSX (текст) | 🟢 Простая |
   | "Переключиться на portrait A4" | `ProposalDocument.tsx` (CSS) + `Size` в генераторе | 🟢 Простая |
   | "Добавить график экономии по годам" | + `build-data.ts` (массив) + `PDFData` + JSX | 🟡 Средняя |
   | "Убрать финансирование Sofin" | `FEATURES.sofin = false` | 🟢 Простая |
   | "Brand-specific PDF (лого, цвета)" | + `PDFData` (brand) + JSX (условные цвета) | 🟢 Простая |

### Проверка после изменений

После любых изменений в PDF система проверьте:

1. **Локальная генерация:** `POST /api/pdf/proposal` с `leadId`
2. **Все 3 Path A/B/C:** без bill_amount + без custom / без bill_amount + custom / с bill_amount
3. **Retry logic:** Если Browserless.io недоступен, падает ли на PDFSpark?
4. **Snapshot:** Создаётся ли после загрузки PDF?
5. **Download:** Работает ли прокси (`/api/pdf/download`)?
6. **Размер PDF:** Не превышает ли Vercel limit (4.5MB на response)?

---

## Appendix A: Структура PDF-документа

### P1 — COVER

```
┌──────────────────────────────────────────────────────┐
│  [35% dark panel]           │  [65% white panel]     │
│                            │                        │
│  TAWAN POWER            │  "ข้อเสนอเฉพาะสำหรับ"    │
│  Solar Engineering · Krabi │                        │
│                            │    {customerName}      │
│  {coverBadge}              │                        │
│  "เอกสารนำเสนอ...โซลาร์"    │    ─── {location} ───  │
│                            │                        │
│  ─────────────────────     │  ┌─────┐ ┌─────┐ ┌───┐ │
│  {coverTagline}            │  │☀️   │ │💰   │ │📅 │ │
│                            │  │X KWP│ │Y/yr │ │Zyr│ │
│  {engineerName}            │  └─────┘ └─────┘ └───┘ │
│  {engineerTitle}           │                        │
│                            │  {co2}t CO₂ · {trees}  │
└──────────────────────────────────────────────────────┘
```

| Элемент | Источник |
|---------|----------|
| `coverBadge` | `data.scenario` → `'sample'` / `'selected'` / `'personal'` |
| `coverTagline` | `data.systemKw` + `data.location` |
| `customerName` | `data.customerName` |
| `systemKw` | `lead.system_size` (default 5) |
| `yearlySave` | `data.monthlySavings × 12` |
| `paybackYears` | `data.paybackYears` |
| `co2Year` | `data.systemKw × 1.1` |
| `treesYear` | `data.systemKw × 0.3` |
| `engineerName` | `data.engineerName` (fallback, не хардкод) |
| `engineerTitle` | `data.engineerTitle` (fallback, не хардкод) |

### P2 — ROI ANALYSIS

```
┌──────────────────────────────────────────────────────┐
│  02 / การวิเคราะห์ผลตอบแทน                          │
│  "ความคุ้มค่าทางการเงิน"                              │
├──────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ประหยัด/ปี │ │คืนทุน    │ │กำไร 25ปี │ │ลด CO₂   │ │
│ │ {yearly} │ │ {pay} ปี │ │{netSave} │ │{co2} t  │ │
│ │  X% บิล  │ │          │ │  Y%/ปี   │ │{trees}  │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                      │
│ ┌────────────────────┐ ┌────────────────────────────┐│
│ │ Сравнение 25 лет   │ │  "ทำไม TAWAN POWER"      ││
│ │                    │ │  ✦ แผง Jinko N-Type        ││
│ │ อยู่กับ PEA  $$$ ←─┤ │  ✦ โครงสร้าง 6005-T5      ││
│ │                    │ │  ✦ บริการครบวงจร           ││
│ │ TAWAN POWER  $$  ←─┤                            │                            ││
│ │                    │ │ 🔒 สำหรับบ้าน               ││
│ │ "คุณประหยัดได้    │ │ หรือ 🏭 สำหรับธุรกิจ         ││
│ │  {netSave}"       │ │                            ││
│ └────────────────────┘ └────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### P3 — PRODUCT COMPARISON

```
┌──────────────────────────────────────────────────────┐
│  03 / เปรียบเทียบแพ็กเกจ                             │
│  "เลือกระบบที่ใช่สำหรับคุณ"                           │
├──────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│ │   ECO    │ │ PREMIUM  │ │  ULTRA   │              │
│ │          │ │ ✓ที่คุณ   │ │          │              │
│ │ [img]    │ │ เลือก    │ │ [img]    │              │
│ │          │ │ [img]    │ │          │              │
│ │ Jinko    │ │ Longi    │ │ Sigenergy│              │
│ │ System   │ │ Premium  │ │ Hybrid   │              │
│ │ ☀️ 12/30 │ │ ☀️ 12/30 │ │ ☀️ 12/30 │              │
│ │ 🔧 10yr  │ │ 🔧 10yr  │ │ 🔧 10yr  │              │
│ │ {price}  │ │ {price}  │ │ {price}  │              │
│ │ เริ่มต้น  │ │ คุ้มค่า   │ │ เทคโน.. │              │
│ └──────────┘ └──────────┘ └──────────┘              │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ค่าติดตั้ง │ ส่วนลด │ ติดตั้ง │ บำรุงรักษา │     │
│ │ {manpower}│ -{disc}%│ {days}d │ {visits}x/yr │     │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### P4 — SOFIN FINANCING

```
┌──────────────────────────────────────────────────────┐
│  04 / สินเชื่อ Sofin Solar                            │
│  "เริ่มติดตั้งได้ทันที ด้วยเงินดาวน์เพียง 10%"         │
├──────────────────────────────────────────────────────┤
│ ┌────────────────────────┐ ┌────────────────────────┐│
│ │ Механизм 10/90/85     │ │ "ข้อเสนอพิเศษของคุณ"    ││
│ │                        │ │                        ││
│ │  10% ─── 85% ─── 5%   │ │   {downPayment}        ││
│ │  down  asset  reserve │ │   ดาวน์ 10%             ││
│ │                        │ │                        ││
│ │ Сравнение 25 лет:     │ │ ┌────┐ ┌────┐ ┌────┐  ││
│ │  อยู่กับ PEA   {total} │ │ │36m │ │60m │ │48m │  ││
│ │  Sofin+solar  {total} │ │ │ $$$│ │$$$ │ │$$$ │  ││
│ │  ───────────────────  │ │ └────┘ └────┘ └────┘  ││
│ │  ประหยัดรวม  {total}  │ │                        ││
│ └────────────────────────┘ │  ✓ Не нужен крупный кэш││
│                            │  ✓ Одобрение 3-5 дней ││
│                            │  ┌──── QR ────────────┐ ││
│                            │  │ LINE: @103nrwnu    │ ││
│                            │  └────────────────────┘ ││
│ └────────────────────────┘ └────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

---

## Appendix B: Schema & Migration

### Leads table (relevant columns)

```sql
CREATE TABLE leads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  proposal_url TEXT DEFAULT NULL,
  proposal_images JSONB DEFAULT NULL,
  system_size DECIMAL DEFAULT 5.0,
  equipment_tier TEXT DEFAULT 'eco',
  base_price DECIMAL,
  manpower DECIMAL,
  discount_percent DECIMAL DEFAULT 0,
  installation_days INT DEFAULT 1,
  maintenance_visits INT DEFAULT 1,
  system_warranty TEXT,
  inverter_warranty TEXT,
  panel_warranty TEXT,
  panel_product_warranty TEXT,
  panel_performance_warranty TEXT,
  selected_product_id INT,
  bill_amount DECIMAL,
  location TEXT,
  name TEXT,
  line_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Proposal snapshots table

```sql
CREATE TABLE proposal_snapshots (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lead_id BIGINT REFERENCES leads(id),
  label TEXT,
  snapshot_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Proposals bucket

- Supabase Storage, bucket `proposals`
- Path format: `{leadId}/TawanPower_Proposal_{leadId}_v{timestamp}.pdf`
- Public read (для доступа через прокси)
- Upload via service role key