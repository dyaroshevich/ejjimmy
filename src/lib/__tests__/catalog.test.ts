import { categoryOfRow } from '@/lib/domain.config';
import {
  categoryFromRow,
  filterByCategory,
  firstImage,
  groupRows,
  type ImportedRow,
} from '@/lib/catalog';

// The Ejjimmy import carries `kind`/`category` as Russian labels and a `spec` string where the template's
// card expects `type`/`image_url`. These are the rules the storefront must apply before a card is drawn,
// otherwise the pills filter by "Панель"/"BOS" and every photo is missing.

const row = (patch: Partial<ImportedRow> = {}): ImportedRow => ({
  id: 'x',
  name: 'x',
  type: 'part',
  ...patch,
});

describe('categoryFromRow', () => {
  it('uses the same category rule as the landing grid, from kind and power', () => {
    expect(categoryFromRow(row({ kind: 'system', power_kw: 5 }))).toBe('home');
    expect(categoryFromRow(row({ kind: 'system', power_kw: 20 }))).toBe('business');
    expect(categoryFromRow(row({ kind: 'part', category: 'Панель' }))).toBe('parts');
    // A row without `kind` is identified by `type` — the shape the imported JSON actually has.
    expect(categoryFromRow(row({ kind: undefined, type: 'system', power_kw: 5 }))).toBe('home');
  });

  it('recognises a hybrid by its name even without a type field', () => {
    expect(categoryFromRow(row({ kind: 'system', name: 'Гибрид 5 кВт', power_kw: 5 }))).toBe('hybrid');
  });
});

describe('filterByCategory', () => {
  const rows = [
    row({ id: 'a', kind: 'system', power_kw: 3 }),
    row({ id: 'b', kind: 'system', power_kw: 15 }),
    row({ id: 'c', kind: 'part', category: 'Панель' }),
  ];

  it('returns every row for all, and only the matching rows otherwise', () => {
    expect(filterByCategory(rows, 'all').map((r) => r.id)).toEqual(['a', 'b', 'c']);
    expect(filterByCategory(rows, 'home').map((r) => r.id)).toEqual(['a']);
    expect(filterByCategory(rows, 'business').map((r) => r.id)).toEqual(['b']);
    expect(filterByCategory(rows, 'parts').map((r) => r.id)).toEqual(['c']);
    expect(filterByCategory(rows, 'hybrid')).toEqual([]);
  });
});

describe('firstImage', () => {
  it('reads the first URL out of an images array', () => {
    expect(firstImage(row({ images: ['/a.webp', '/b.webp'] }))).toBe('/a.webp');
  });

  it('falls back to image_url, and returns null when neither is set', () => {
    expect(firstImage(row({ image_url: '/legacy.webp' }))).toBe('/legacy.webp');
    expect(firstImage(row())).toBeNull();
  });
});

describe('groupRows', () => {
  it('sorts systems by kW and parts by price, systems first', () => {
    const rows = [
      row({ id: 'p2', kind: 'part', price_thb_median: 900 }),
      row({ id: 's2', kind: 'system', power_kw: 10 }),
      row({ id: 'p1', kind: 'part', price_thb_median: 100 }),
      row({ id: 's1', kind: 'system', power_kw: 5 }),
    ];
    expect(groupRows(rows).map((r) => r.id)).toEqual(['s1', 's2', 'p1', 'p2']);
  });
});
