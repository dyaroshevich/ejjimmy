import { categoryOfRow } from '@/lib/domain.config';

// The Ejjimmy import carries `kind`/`category` as Russian labels and a `spec` string where the template's
// card expects `type`/`image_url`. These are the rules the storefront must apply before a card is drawn,
// otherwise the pills filter by "Панель"/"BOS" and every photo is missing.
export interface ImportedRow {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  type?: string | null;
  kind?: string | null;
  category?: string | null;
  power_kw?: number | null;
  price_thb?: number | null;
  price_thb_median?: number | null;
  spec?: string | null;
  specifications?: Record<string, unknown> | null;
  images?: string[] | null;
  image_url?: string | null;
  description?: string | null;
  is_active?: boolean | null;
}

/** The imported row's own type, whichever column carries it. */
export const rowType = (row: ImportedRow) => row.kind ?? row.type ?? 'part';

/** The imported row's own price, whichever column carries it. */
export const rowPrice = (row: ImportedRow) => row.price_thb ?? row.price_thb_median ?? null;

/**
 * The row's category, by the landing's own rule — `kind`/`type` decides system vs part, the kW band
 * decides home vs business, and a hybrid is a system whose name or spec says so.
 */
export function categoryFromRow(row: ImportedRow) {
  return categoryOfRow({
    type: rowType(row),
    power_kw: row.power_kw,
    brand: row.brand,
    typeText: `${row.spec ?? ''} ${row.name ?? ''}`,
  });
}

export function filterByCategory(rows: ImportedRow[], category: 'all' | 'home' | 'business' | 'hybrid' | 'parts') {
  return category === 'all' ? rows : rows.filter((r) => categoryFromRow(r) === category);
}

/** The photo a card shows: the first of `images`, or the legacy single `image_url`. */
export function firstImage(row: ImportedRow): string | null {
  return row.images?.find(Boolean) ?? row.image_url ?? null;
}

const priceOf = (row: ImportedRow) => rowPrice(row) ?? 0;

/** Systems first by kW, then the parts shelf by price — the order the landing's grid paints. */
export function groupRows(rows: ImportedRow[]): ImportedRow[] {
  const isSystem = (r: ImportedRow) => rowType(r) === 'system';
  return [...rows].sort(
    (a, b) =>
      Number(isSystem(b)) - Number(isSystem(a)) ||
      (isSystem(a)
        ? (a.power_kw ?? 0) - (b.power_kw ?? 0) || priceOf(a) - priceOf(b)
        : priceOf(a) - priceOf(b)),
  );
}
