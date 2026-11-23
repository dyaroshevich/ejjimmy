import { address, brand } from '@/lib/site.config';
import { market } from '@/lib/domain.config';
import { SYSTEM_PROMPTS, EXTRACTION_INSTRUCTIONS } from '@/lib/ai-prompts';

// The prompts are prose in nine languages; the facts inside them are config. This test reads the
// rendered prompt, not the source, so it fails when a brand or a town is typed back in *anywhere* the
// config should have reached — including a locale nobody re-reads.

const LOCALES = Object.keys(SYSTEM_PROMPTS) as Array<keyof typeof SYSTEM_PROMPTS>;

describe('system prompts are built from config', () => {
  it('has one prompt per locale', () => {
    expect(LOCALES.sort()).toEqual(['de', 'en', 'fr', 'ja', 'ko', 'ru', 'th', 'uk', 'zh'].sort());
  });

  it('names the configured city in each locale, in that locale’s own spelling', () => {
    for (const locale of LOCALES) {
      const city = address.cityNames[locale] ?? address.city;
      expect(SYSTEM_PROMPTS[locale]).toContain(city);
      // The English spelling only appears where it is the same word.
      if (city !== address.city) expect(SYSTEM_PROMPTS[locale]).not.toContain(`in ${address.city}, Thailand`);
    }
  });

  it('quotes the brands from the catalogue config, not the founder’s', () => {
    for (const locale of LOCALES) {
      for (const panel of market.panels) expect(SYSTEM_PROMPTS[locale]).toContain(panel);
      for (const inverter of market.inverters) expect(SYSTEM_PROMPTS[locale]).toContain(inverter);
    }
  });

  it('introduces the configured brand, not a hard-coded one', () => {
    for (const locale of LOCALES) {
      expect(SYSTEM_PROMPTS[locale]).toContain(brand.name);
    }
  });

  it('keeps the protocol block free of the brand name', () => {
    // The internal-tag rules are about the protocol, not about who the shop is: a brand name in them is
    // a fact typed where the model does not need it. Its place examples are config-driven instead.
    expect(EXTRACTION_INSTRUCTIONS).not.toContain(brand.name);
    // The place example is the first configured district, not a town typed into the protocol.
    expect(EXTRACTION_INSTRUCTIONS).toContain(market.districts[0]);
  });
});
