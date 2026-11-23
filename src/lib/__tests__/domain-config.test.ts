import { categories, categoryOfRow, financing, isHybridSystem, monthlyInstalment } from '@/lib/domain.config';

// `domain.config.ts` is a business decision, so it gets a test that names the decision rather than the
// implementation: the instalment the shop quotes, the boundary between the home and business tiers, and
// which rows count as hybrid. A template edit that changes one of these should fail here first.

describe('monthlyInstalment', () => {
  it('quotes 10 % down over 24 months, in whole baht', () => {
    // ฿120 000 → ฿108 000 financed → ฿4 500 a month.
    expect(monthlyInstalment(120_000)).toBe(4_500);
    // ฿99 999 → 89 999.1 → 3 749.9625 → 3 750 (rounded, not truncated).
    expect(monthlyInstalment(99_999)).toBe(3_750);
  });

  it('is the same arithmetic the old inline copies used', () => {
    for (const price of [0, 1, 16_612.5, 89_000, 1_450_000]) {
      expect(monthlyInstalment(price)).toBe(Math.round((price * 0.9) / 24));
    }
  });

  it('returns null when there is no price to finance', () => {
    expect(monthlyInstalment(null)).toBeNull();
    expect(monthlyInstalment(undefined)).toBeNull();
    expect(monthlyInstalment(Number.NaN)).toBeNull();
  });

  it('reads the term from the config, not from the call site', () => {
    expect(financing.months).toBe(24);
    expect(financing.downPayment).toBe(0.1);
  });
});

describe('categoryOfRow', () => {
  it('splits systems at the configured kW boundary', () => {
    expect(categoryOfRow({ type: 'system', power_kw: categories.homeMaxKw, brand: 'GoodWe' })).toBe('home');
    expect(categoryOfRow({ type: 'system', power_kw: categories.homeMaxKw + 1, brand: 'GoodWe' })).toBe('business');
  });

  it('treats a row without a kW figure as business, not as a part', () => {
    expect(categoryOfRow({ type: 'system', power_kw: null, brand: 'Huawei' })).toBe('business');
  });

  it('classifies a hybrid by spec text or by brand', () => {
    expect(categoryOfRow({ type: 'system', power_kw: 10, brand: 'Huawei', typeText: 'Hybrid inverter' })).toBe('hybrid');
    expect(categoryOfRow({ type: 'system', power_kw: 5, brand: 'Sigenergy', typeText: '' })).toBe('hybrid');
  });

  it('puts everything that is not a system on the parts shelf', () => {
    expect(categoryOfRow({ type: 'inverter', power_kw: 10, brand: 'Huawei' })).toBe('parts');
    expect(categoryOfRow({ type: null, brand: 'Longi' })).toBe('parts');
  });

  it('drops the hybrid tier when the brand list is emptied', () => {
    // `isHybridSystem` reads the list at call time, so a template that sells no batteries gets the tier
    // out of the way without touching a component — this asserts the rule is data, not `sigenergy` in code.
    expect(isHybridSystem('', 'Sigenergy')).toBe(categories.hybridBrands.length > 0);
  });
});
