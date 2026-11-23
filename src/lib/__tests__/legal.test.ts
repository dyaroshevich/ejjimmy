import { isPlaceholder, legal, missingLegalFields } from '@/lib/legal';

// The two legal documents are publishable only when the owner's registration data is real. These tests
// name that rule: a placeholder is recognised in every shape it has appeared in, and a complete profile
// reports nothing missing — which is the condition that flips `noindex` off and puts the pages back in
// the sitemap.

describe('isPlaceholder', () => {
  it.each([
    ['๐-๐๐๐๐๐-๐๐๐๐๐-๐๐-๐ (รอระบุ)'],
    ['081-XXX-XXXX'],
    ['0-0000-00000-00-0 (to be completed)'],
    [''],
    ['   '],
  ])('treats %p as not filled in', (value) => {
    expect(isPlaceholder(value)).toBe(true);
  });

  it.each(['บริษัท ทาวเวอร์ จำกัด', '0-1234-56789-01-2', '081-234-5678', '1 Moo 2, Krabi'])(
    'accepts %p as real',
    (value) => {
      expect(isPlaceholder(value)).toBe(false);
    },
  );
});

describe('missingLegalFields', () => {
  it('lists every absent field, in the order the documents use them', () => {
    const missing = missingLegalFields({ entityName: '', taxId: '', address: '', phone: '', effective: '', version: '' });
    expect(missing).toEqual([
      'legal entity name',
      'tax identification number',
      'registered address',
      'contact phone',
    ]);
  });

  it('reports nothing once all four are real', () => {
    expect(
      missingLegalFields({
        entityName: 'Example Solar Co., Ltd.',
        taxId: '0-1234-56789-01-2',
        address: '1 Moo 2, Krabi',
        phone: '081-234-5678',
        effective: '2026-10-20',
        version: '1.0',
      }),
    ).toEqual([]);
  });

  it('keeps the live profile a draft, because the owner has not supplied the entity yet', () => {
    // If this ever fails, the owner filled `brand.legal` — then /privacy and /terms became indexable and
    // the legal:check gate will say so. That is the intended way for this to change, not an accident.
    expect(missingLegalFields(legal).length).toBeGreaterThan(0);
  });
});
