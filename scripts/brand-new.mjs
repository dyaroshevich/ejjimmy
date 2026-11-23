// Does the template fit a different shop in one command?
// usage: node scripts/brand-new.mjs --name "Krabi Solar" --name-th "ทีมงาน Krabi Solar" \
//          --line @abc1234 --phone 081-234-5678 --email hi@example.com \
//          --city Krabi --city-th กระบี่ [--site https://krabi-solar.example] [--dry-run]
//
// Stage 4 of docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md. Stages 1–3 moved the brand out of the
// components into `brand.json` and `site.config.ts`; this script is the proof that the move worked, or it
// is a report of where it did not. It rewrites exactly those two files, then regenerates the manifests.
//
// What it deliberately does NOT touch: the copy pack (`messages/*.json` writes `{brand}` / `{city}`, so it
// follows on its own), the palette in `brand.json` (`theme` — a new brand gets the same colours until
// someone chooses otherwise), the icon PNGs and the og image (raster art, not text), the Supabase project,
// and the catalogue rows in the database.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Thai numbers written with Thai digits are a typo in a phone field, not a localisation. */
export function digitsOnly(phone) {
  return String(phone).replace(/[^\d]/g, '');
}

/**
 * `081-234-5678` → `+66812345678`.
 *
 * Thai mobile numbers are ten digits starting with 0; the E.164 form drops the 0 and adds the country
 * code. Anything longer is assumed to carry its own country code already, so the script does not invent
 * one — a wrong `tel:` is a dead link for every visitor.
 */
export function toE164(phone, countryCode = '66') {
  const digits = digitsOnly(phone);
  if (digits.startsWith(countryCode) && digits.length > 9) return `+${digits}`;
  if (digits.startsWith('0')) return `+${countryCode}${digits.slice(1)}`;
  return `+${digits}`;
}

/** Display form, left as the operator typed it: the visitor dials what they see. */
export function displayPhone(phone) {
  const digits = digitsOnly(phone);
  if (digits.length !== 10) return String(phone);
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function slugOf(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * The two files, edited in place rather than re-serialised from scratch: `site.config.ts` also holds the
 * contact helpers a human reads, and a rewrite would throw that away.
 */
export function planBrandUpdate(brandJson, siteConfigText, input) {
  const brand = JSON.parse(JSON.stringify(brandJson));
  const b = brand.brand;

  b.name = input.name;
  b.legalName = input.name;
  b.shortName = input.name;
  b.nameTh = input.nameTh ?? input.name;
  if (input.description) b.description = input.description;
  b.subTh = input.subTh ?? b.subTh;
  if (input.city) {
    b.city = input.city;
    b.region = input.city;
    b.cityNames = { ...b.cityNames, ...(input.cityNames ?? {}), en: input.city };
  }
  if (input.twitter) b.social = { ...(b.social ?? {}), twitter: input.twitter };
  // A new brand is a new installed app: the ids must not be inherited, or the template's installs and
  // the client's would be the same app to the browser.
  b.appIds = { public: `${slugOf(input.name)}-public-app`, admin: `${slugOf(input.name)}-admin` };

  const lineId = input.line?.startsWith('@') ? input.line : `@${input.line}`;
  const phoneDisplay = displayPhone(input.phone);
  const phoneE164 = toE164(input.phone);

  const constants = [
    ['LINE_ID', `'${lineId}'`],
    ['PHONE_DISPLAY', `'${phoneDisplay}'`],
    ['PHONE_E164', `'${phoneE164}'`],
  ];
  if (input.email) constants.push(['EMAIL', `'${input.email}'`]);
  if (input.site) constants.push(['siteUrl', `process.env.NEXT_PUBLIC_SITE_URL || '${input.site}'`]);

  let site = siteConfigText;
  for (const [name, value] of constants) {
    const re = new RegExp(`(const ${name} = )[^;]+;`);
    if (!re.test(site)) {
      throw new Error(`site.config.ts no longer declares \`${name}\` — update scripts/brand-new.mjs`);
    }
    site = site.replace(re, `$1${value};`);
  }

  return {
    brandJson: `${JSON.stringify(brand, null, 2)}\n`,
    siteConfig: site,
    values: { lineId, phoneDisplay, phoneE164, site: input.site, email: input.email },
  };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'dry-run') out.dryRun = true;
    else out[key] = argv[++i];
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const missing = ['name', 'line', 'phone'].filter((k) => !args[k]);
  if (missing.length) {
    console.error(`brand-new · missing --${missing.join(', --')}`);
    console.error('  usage: node scripts/brand-new.mjs --name "Shop" --line @handle --phone 081-234-5678');
    console.error('         [--name-th "ทีมงาน …"] [--email a@b.c] [--city Krabi] [--site https://…] [--dry-run]');
    process.exit(1);
  }

  const brandPath = join(ROOT, 'brand.json');
  const sitePath = join(ROOT, 'src/lib/site.config.ts');
  const brandJson = JSON.parse(readFileSync(brandPath, 'utf8'));
  const plan = planBrandUpdate(brandJson, readFileSync(sitePath, 'utf8'), args);

  console.log(`brand   ${brandJson.brand.name} → ${args.name}`);
  console.log(`line    ${plan.values.lineId}`);
  console.log(`phone   ${plan.values.phoneDisplay} · ${plan.values.phoneE164}`);
  if (plan.values.email) console.log(`email   ${plan.values.email}`);
  if (plan.values.site) console.log(`site    ${plan.values.site}`);

  if (args.dryRun) {
    console.log('dry-run · nothing written');
    return;
  }

  writeFileSync(brandPath, plan.brandJson);
  writeFileSync(sitePath, plan.siteConfig);
  execFileSync(process.execPath, [join(ROOT, 'scripts/brand-generate-assets.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [join(ROOT, 'scripts/brand-assets.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  console.log(`
next:
  1. review the generated icon PNGs in public/icons and public/og-image.jpg, then \`npm run brand:assets\`
  2. set the Supabase + AI + LINE values in .env.local (see .env.example)
  3. run the gates:  npm run brand:check && npx tsc --noEmit && npx jest
  4. the catalogue, cases and articles are database rows — point the project at your own Supabase
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
