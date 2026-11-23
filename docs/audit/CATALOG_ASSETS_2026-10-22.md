# Catalog image inventory — 2026-10-22

Status: **inventory only. Nothing was deleted.** The owner keeps these files as
source material for content and video work and will review the list in later
sessions. Do not remove catalog files without the owner's explicit decision.

Snapshot against the live Supabase project (dev and prod share it): 35
`solar_products` rows, 2 `solar_cases` rows.

## What the counters say

`node scripts/asset-usage.mjs` compares `image_url` + `gallery` (products) and
`media_assets` (cases) with `public/content/products`:

| Measure | Value |
|---|---:|
| Files on disk | 208 |
| Paths referenced by a row | 89 |
| Referenced but missing on disk | 0 |
| On disk, referenced by no row | **119 (12 577 770 B)** |

The 119 break down as:

| Kind | Files | Bytes | What it is |
|---|---:|---:|---|
| `.png` | 99 | 12 222 108 | PNG twins of photos the rows serve as `.webp` (systems, inverters, batteries, panels, parts). Not "parts only". |
| `.webp` | 20 | 355 662 | `gallery/image-N.webp` alternates in `goodwe-5kw-inverter`, `goodwe-10kw-inverter`, `huawei-100kw-inverter`, plus the whole removed-SKU sets `sigen-battery-5kwh` (5), `sigen-battery-6kwh` (1) and `sigen-battery-stack-{10,16,20,30}kwh` (4). |

They sit in 41 SKU folders. Six folders have no product row at all
(`sigen-battery-5kwh`, `sigen-battery-6kwh`, `sigen-battery-stack-{10,16,20,30}kwh`);
the rest are live SKUs with unused PNG twins and/or alternates.

## References outside the database

The DB-only counter cannot see files used as content material. Known live ones:

- `src/video/compositions/KineticStory15s.tsx`,
  `KineticStory20s.tsx`, `KineticStory20s-Case2.tsx`,
  `KineticStory20sParametric.tsx` — `staticFile("content/products/sigen-battery-5kwh/main.webp")`.
  This file is one of the 119; deleting it breaks four Remotion compositions.
- `docs/design/opendesign/tawanpower-landing-unified.html` (frozen mock) shows
  `sigen-battery-5kwh/main.webp` as reference content.
- `public/sw.js` still lists many of these paths, but it is generated build
  output (gitignored, rewritten by `@ducanh2912/next-pwa`); not a source
  reference.

## Duplicates

`node scripts/dup-assets.mjs`: 208 product images, 16 624 552 B, **27
byte-identical groups**, 692 780 B reclaimable if rows were repointed. 24 of
those groups are among the PNG twins above; consolidating them means editing
`image_url`/`gallery` in the shared production table, so it is not a code-only
change. No action taken.

## Regenerate this inventory

```bash
node scripts/asset-usage.mjs   # referenced vs on disk, unused list + bytes
node scripts/dup-assets.mjs    # byte-identical groups
```

## Why the files stay

- They are the PNG originals behind the served `.webp` files and the raw
  material for future content and video edits.
- `public/` is deployed wholesale, so they cost deploy weight (~12.6 MB), not
  page weight: the site never requests them. That is a trade the owner accepted
  for now.
- Removal, archiving outside `public/`, and deduplication are all owner
  decisions. Revisit only on his word.
