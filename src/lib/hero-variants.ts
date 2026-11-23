/**
 * Hero A/B variants — the offer copy above the fold.
 *
 * One visitor sees one variant: the middleware pins a `hero_v` cookie on the first landing visit and
 * the server renders that variant, so the copy never flickers and a reload keeps the same promise.
 *
 * `weight` is the traffic share. Variant 4 ("free survey, clear quote, no hidden costs") is the live
 * offer; the others are kept with weight 0 so a test is one number away. The owner's rule for this
 * file: no invented figures — only prices that exist in the catalogue and statements we can prove.
 * A visitor pinned to a variant that has since been parked is moved to the live one (see
 * `activeHeroVariant`), so a retired headline cannot survive in a year-old cookie.
 *
 * Copy is Thai + English only: Thai is the market these hooks were written for, English is the
 * mirror. Other locales fall back to the approved `hero.*` messages.
 */
export type HeroVariantId = '1' | '2' | '3' | '4';

export type HeroCopy = {
  kicker: string;
  h1a: string;
  h1b: string;
  h1c: string;
  sub: string;
};

type Variant = {
  id: HeroVariantId;
  weight: number;
  copy: { th: HeroCopy; en: HeroCopy };
};

export const HERO_COOKIE = 'hero_v';
export const DEFAULT_HERO_VARIANT: HeroVariantId = '4';

export const HERO_VARIANTS: Variant[] = [
  {
    id: '1',
    weight: 0,
    copy: {
      th: {
        kicker: 'ทีมท้องถิ่นกระบี่',
        h1a: 'ค่าไฟลดลง',
        h1b: 'เริ่ม 120,000฿',
        h1c: 'จบพร้อมใช้',
        sub: 'สำรวจหลังคาฟรีถึงบ้าน รับประกันหลังการขาย ติดตั้งให้บ้านและธุรกิจในกระบี่ อ่าวนาง ลันตา คลองท่อม',
      },
      en: {
        kicker: 'Local Krabi crew',
        h1a: 'A smaller bill',
        h1b: 'from ฿120,000',
        h1c: 'ready to use',
        sub: 'Free roof survey at your home, after-sales warranty. Homes and businesses in Krabi, Ao Nang, Lanta and Klong Thom.',
      },
    },
  },
  {
    id: '2',
    weight: 0,
    copy: {
      th: {
        kicker: 'ทีมท้องถิ่นกระบี่',
        h1a: 'คนกระบี่ไว้ใจเรา',
        h1b: 'ติดโซลาร์แล้ว',
        h1c: 'บ้านในกระบี่',
        sub: 'ช่างใกล้บ้าน ดูแลไว เคลมง่าย ไม่ทิ้งงาน ฟรีประเมิน + ดูหน้างาน',
      },
      en: {
        kicker: 'Local Krabi crew',
        h1a: 'Krabi trusts us',
        h1b: 'solar installed',
        h1c: 'across the province',
        sub: 'Technicians nearby, fast service, easy warranty claims — we do not disappear. Free assessment and site survey.',
      },
    },
  },
  {
    id: '3',
    weight: 0,
    copy: {
      th: {
        kicker: 'ทีมท้องถิ่นกระบี่',
        h1a: 'จ่ายสบาย',
        h1b: 'ผ่อนได้',
        h1c: 'หรือจ่ายเต็ม',
        sub: 'เลือกผ่อนหรือจ่ายเต็มได้ ค่าไฟที่ลดลงทุกเดือนช่วยให้คืนทุนไวขึ้น ฟรีคำนวณจุดคุ้มทุน + สำรวจหน้างาน',
      },
      en: {
        kicker: 'Local Krabi crew',
        h1a: 'Easy on the wallet',
        h1b: 'instalments available',
        h1c: 'or pay in full',
        sub: 'Finance it or pay in full — the lower monthly bill pays it back sooner. Free break-even calculation and site survey.',
      },
    },
  },
  {
    id: '4',
    weight: 100,
    copy: {
      th: {
        kicker: 'ติดตั้งโดยทีมกระบี่\nไม่ใช่ช่างต่างถิ่น',
        h1a: 'สำรวจหลังคาฟรี',
        h1b: 'ราคาชัดเจน',
        h1c: 'ไม่มีค่าแอบแฝง',
        sub: 'เข้ามาดูหน้างานจริง วัดหลังคา เช็คระบบไฟ แล้วสรุปราคาให้ก่อนตัดสินใจ',
      },
      en: {
        kicker: 'Installed by a Krabi crew\nnot outside contractors',
        h1a: 'Free roof survey',
        h1b: 'a clear quote',
        h1c: 'no hidden costs',
        sub: 'We visit the site, measure the roof, check your electrics and give you the price before you decide.',
      },
    },
  },
];

export function isHeroVariantId(value: unknown): value is HeroVariantId {
  return HERO_VARIANTS.some((v) => v.id === value);
}

/**
 * A variant that is still in the test: it exists AND carries traffic. A visitor pinned to a variant
 * the owner has since parked is moved to the live one on their next request — otherwise the old
 * cookie would keep showing a retired offer for a year.
 */
export function activeHeroVariant(value: unknown): HeroVariantId | null {
  const variant = HERO_VARIANTS.find((v) => v.id === value);
  return variant && variant.weight > 0 ? variant.id : null;
}

/** Weighted pick; variants with weight 0 never win. Deterministic when `random` is supplied. */
export function pickHeroVariant(random: number = Math.random()): HeroVariantId {
  const pool = HERO_VARIANTS.filter((v) => v.weight > 0);
  if (!pool.length) return DEFAULT_HERO_VARIANT;
  const total = pool.reduce((sum, v) => sum + v.weight, 0);
  let ticket = random * total;
  for (const v of pool) {
    if (ticket < v.weight) return v.id;
    ticket -= v.weight;
  }
  return pool[pool.length - 1].id;
}

/** Copy for this variant in this locale, or null when the locale keeps the approved messages copy. */
export function heroCopy(id: string | undefined, locale: string): HeroCopy | null {
  const variant = HERO_VARIANTS.find((v) => v.id === id);
  if (!variant) return null;
  const lang = locale.split('-')[0];
  if (lang === 'th') return variant.copy.th;
  if (lang === 'en') return variant.copy.en;
  return null;
}
