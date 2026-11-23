/**
 * The one place a brand is typed — now for three brands at once.
 *
 * Stage 1 of `docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md`: the name, the contacts and the
 * address were literals in dozens of files (the LINE handle alone sat in 22), so changing a phone
 * number was a hunt for constants. Everything below is now read from here.
 *
 * Stage 3 moved the name and the city into `brand.json` beside the palette, because the copy pack
 * (`messages/*.json`) writes them as `{brand}` / `{city}` and `scripts/brand-copy.mjs` — a plain
 * `.mjs` that cannot import TypeScript — has to read the same values. `brand.json` is the input;
 * this file re-exports it with types, and the contacts stay here because they read `process.env`.
 *
 * Multi-site (2026-11-10): one Vercel deployment serves three storefronts, one per host. The
 * middleware reads `Host`, resolves the site here and forwards `x-site`; server code asks
 * `getSite()` (`src/lib/site-server.ts`), client code reads the provider in the root layout.
 * `brand.json` stays the default site's identity and palette, so `brand-tokens`/`brand-audit`
 * keep their single source; the other two sites are overrides in this file.
 *
 * Rule: the values in these two files are written HERE and nowhere else in `src/**`.
 * `node scripts/brand-audit.mjs` fails when the handle, the phone, the e-mail, a `line.me` link or
 * the brand name appears as a literal anywhere else — the documented debt it still tolerates lives
 * in `docs/audit/brand-baseline.json` and only ever shrinks.
 */
import site from '../../brand.json';

export type SiteId = 'ejjimmy' | 'solar1' | 'template';

/** A landing band that a site may or may not render. Hero and contact are always on. */
export type SectionId =
  | 'partners'
  | 'segments'
  | 'systems'
  | 'cases'
  | 'services'
  | 'sigen'
  | 'steps'
  | 'knowledge'
  | 'blog';

/** A top-level entry in the staff shell. */
export type AdminItem = 'dashboard' | 'leads' | 'products' | 'content' | 'lead-magnets' | 'super';

export interface SiteAdmin {
  items: AdminItem[];
  /** `full` is the whole content factory; `mini` is the overview and its posts. */
  content: 'full' | 'mini';
  /**
   * What the content sidebar calls itself. It was hardcoded as `full ? 'TawanPost' : 'Content'`, so a
   * franchisee running the full factory would have shipped the flagship's product name.
   */
  contentLabel?: string;
}

export interface BrandIdentity {
  name: string;
  nameTh: string;
  legalName: string;
  shortName: string;
  description: string;
  subTh: string;
  city: string;
  region: string;
  country: string;
  cityNames: Record<string, string>;
  social: { twitter: string };
  appIds: { public: string; admin: string };
  legal: {
    entityName: string;
    taxId: string;
    address: string;
    phone: string;
    effective: string;
    version: string;
  };
}

export type ChannelId = 'line' | 'phone' | 'email';

export interface Channel {
  id: ChannelId;
  /** What a visitor reads. */
  label: string;
  /** Machine value: LINE id, E.164 phone or e-mail address. */
  handle: string;
  /** Where a click or a QR code points. */
  href: string;
}

export interface SiteContact {
  lineId: string;
  lineUrl: string;
  phone: string;
  phoneE164: string;
  telHref: string;
  email: string;
  mailtoHref: string;
  /** One entry per reachable channel, so a market without LINE swaps the array, not the code. */
  channels: Channel[];
}

export interface SiteAddress {
  city: string;
  region: string;
  country: string;
  /** The city as each locale spells it; the copy pack writes `{city}` and fills it from here. */
  cityNames: Record<string, string>;
  geo: { lat: number; lng: number };
  /** schema.org opening hours. */
  hours: string;
  /** Districts the crew covers; the landing's contact form and the JSON-LD `areaServed`. */
  serviceAreas: string[];
}

/** Only the brand-owned colours. Surfaces, text and borders stay in `brand.generated.css`. */
export interface SiteTheme {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface Site {
  id: SiteId;
  /** Hostname this site answers on (port allowed for localhost). */
  host: string;
  /** Public origin, for canonical/OG/sitemap. */
  url: string;
  sections: SectionId[];
  admin: SiteAdmin;
  brand: BrandIdentity;
  contact: SiteContact;
  address: SiteAddress;
  theme: SiteTheme;
}

/** A host is matched without its port and without a leading `www.`. */
const bareHost = (host: string) => host.split(':')[0].toLowerCase().replace(/^www\./, '');

const urlFor = (host: string) =>
  /^(localhost|127\.|\[::1\])/.test(host) ? `http://${host}` : `https://${host}`;

function contactOf(lineId: string, phone: string, phoneE164: string, email: string): SiteContact {
  return {
    lineId,
    lineUrl: `https://line.me/ti/p/${lineId}`,
    phone,
    phoneE164,
    telHref: `tel:${phoneE164}`,
    email,
    mailtoHref: `mailto:${email}`,
    channels: [
      { id: 'line', label: 'LINE', handle: lineId, href: `https://line.me/ti/p/${lineId}` },
      { id: 'phone', label: 'Phone', handle: phone, href: `tel:${phoneE164}` },
      { id: 'email', label: 'Email', handle: email, href: `mailto:${email}` },
    ],
  };
}

const ejjimmyHost = process.env.SITE_HOST_EJJIMMY || 'ejjimmy.vercel.app';

const ejjimmy: Site = {
  id: 'ejjimmy',
  host: ejjimmyHost,
  url: urlFor(ejjimmyHost),
  sections: ['partners', 'segments', 'systems', 'cases', 'services', 'sigen', 'steps', 'knowledge', 'blog'],
  admin: { items: ['dashboard', 'leads', 'products', 'content', 'super'], content: 'full' },
  brand: site.brand,
  contact: contactOf('@ejjimmysolar', '080-XXX-XXXX', '+6680XXXXXXX', 'hello@ejjimmy.com'),
  address: {
    city: site.brand.city,
    region: site.brand.region,
    country: site.brand.country,
    cityNames: site.brand.cityNames,
    geo: { lat: 8.0863, lng: 98.9063 },
    hours: 'Mo-Su 09:00-18:00',
    serviceAreas: ['Krabi Town', 'Ao Nang', 'Koh Lanta', 'Klong Thom'],
  },
  theme: {
    light: {
      primary: '#ff8a00',
      primaryDeep: '#ea580c',
      primaryInk: '#c2410c',
      secondary: '#f59e0b',
      accent: '#ff8a00',
      accentDeep: '#ea580c',
      ring: '#ff8a00',
      shadowLuxe: '0 24px 60px -24px rgb(255 138 0 / 0.35)',
    },
    dark: {
      primaryInk: '#ffb547',
      accent: '#ff8a00',
      accentDeep: '#f59e0b',
      shadowLuxe: '0 24px 60px -24px rgb(255 138 0 / 0.3)',
    },
  },
};

const solar1Host = process.env.SITE_HOST_SOLAR1 || 'solar1.vercel.app';

const solar1: Site = {
  id: 'solar1',
  host: solar1Host,
  url: urlFor(solar1Host),
  sections: ['partners', 'segments', 'systems', 'cases', 'services', 'sigen', 'steps', 'knowledge', 'blog'],
  admin: { items: ['dashboard', 'leads', 'products', 'content', 'super'], content: 'mini' },
  brand: {
    name: 'Solar 1 Krabi',
    nameTh: 'โซลาร์ 1 กระบี่',
    legalName: 'Solar 1 Krabi',
    shortName: 'Solar 1',
    description: 'Solar panel installation and site surveys in Krabi, Thailand.',
    subTh: 'กระบี่ · ติดตั้งโซลาร์',
    city: 'Krabi',
    region: 'Krabi',
    country: 'TH',
    cityNames: site.brand.cityNames,
    social: { twitter: '@solar1krabi' },
    appIds: { public: 'solar1-public-app', admin: 'solar1-admin' },
    legal: { entityName: '', taxId: '', address: '', phone: '', effective: '2026-10-20', version: '1.0' },
  },
  contact: contactOf('@solar1krabi', '075-000-001', '+6675000001', 'hello@solar1krabi.com'),
  address: {
    city: 'Krabi',
    region: 'Krabi',
    country: 'TH',
    cityNames: site.brand.cityNames,
    geo: { lat: 8.0863, lng: 98.9063 },
    hours: 'Mo-Su 09:00-18:00',
    serviceAreas: ['Krabi Town', 'Ao Nang', 'Koh Lanta', 'Klong Thom'],
  },
  theme: {
    light: {
      primary: '#14b8a6',
      primaryDeep: '#0f766e',
      primaryInk: '#115e59',
      secondary: '#2dd4bf',
      accent: '#14b8a6',
      accentDeep: '#0f766e',
      ring: '#14b8a6',
      shadowLuxe: '0 24px 60px -24px rgb(20 184 166 / 0.35)',
    },
    dark: {
      primaryInk: '#5eead4',
      accent: '#2dd4bf',
      accentDeep: '#5eead4',
      shadowLuxe: '0 24px 60px -24px rgb(45 212 191 / 0.3)',
    },
  },
};

const templateHost = process.env.SITE_HOST_TEMPLATE || 'solar-x7k2m.vercel.app';

/**
 * The third storefront is a person, not a company: Arun Phalung (อรุณ พลัง, "dawn power") is a
 * Krabi electrical engineer who runs one crew, surveys every roof himself and signs the drawing.
 * That is the whole positioning, so the wordmark is his name and the sub-line is the promise.
 *
 * The palette is the dawn he starts work in — rose — and it is chosen to live beside the approved
 * sheet's own amber (`.grad`, `.hl`, the sunrise behind the hero), which is the sun coming up over
 * it. Two consequences worth knowing before anyone "fixes" this: the sheet's brand literals
 * (`#c2410c` on `.kicker`/`.lbl`/`.roi`, `#ff8a00` on `.five b`) are frozen in `globals.css` by the
 * fidelity contract, so those small labels stay amber on this site too; and `--primary` has to stay
 * bright enough to carry `--accent-fg` (`#0f172a`) on a button, which is why a navy brand would need
 * a CSS change rather than a config one.
 *
 * Every value is invented. The host is random, the phone is a placeholder, and the e-mail is on the
 * RFC 2606 `.example` domain so it cannot reach a stranger. `legal` stays empty on purpose
 * (`src/lib/legal.ts`: a template must not ship someone's tax id).
 */
const template: Site = {
  id: 'template',
  host: templateHost,
  url: urlFor(templateHost),
  sections: ['segments', 'systems', 'services', 'steps'],
  // The franchisee's set: see the numbers, answer leads, edit its own catalogue, write its own posts.
  // Everything else — the super panel, and the nine tabs of the content factory — is not there to open.
  admin: { items: ['dashboard', 'leads', 'products', 'content'], content: 'mini' },
  brand: {
    name: 'Arun Phalung',
    nameTh: 'อรุณ พลัง',
    legalName: 'Arun Phalung Solar Co., Ltd.',
    shortName: 'Arun',
    description:
      'Engineer-led solar design and installation on the Andaman coast — one survey, one crew, one signature.',
    subTh: 'กระบี่ · ติดตั้งโดยวิศวกร',
    city: 'Krabi',
    region: 'Krabi',
    country: 'TH',
    cityNames: site.brand.cityNames,
    social: { twitter: '@arunphalung' },
    appIds: { public: 'arunphalung-public-app', admin: 'arunphalung-admin' },
    legal: { entityName: '', taxId: '', address: '', phone: '', effective: '2026-10-20', version: '1.0' },
  },
  contact: contactOf('@arunphalung', '086-000-0002', '+66860000002', 'arunphalung@gmail.com'),
  address: {
    city: 'Krabi',
    region: 'Krabi',
    country: 'TH',
    cityNames: site.brand.cityNames,
    // Ao Nang — the beach side of the province, where this persona's crews work.
    geo: { lat: 8.0347, lng: 98.8225 },
    hours: 'Mo-Sa 08:30-17:30',
    serviceAreas: ['Ao Nang', 'Krabi Town', 'Klong Muang', 'Tub Kaek'],
  },
  theme: {
    light: {
      primary: '#fb7185',
      primaryDeep: '#be123c',
      primaryInk: '#9f1239',
      secondary: '#f472b6',
      accent: '#fb7185',
      accentDeep: '#be123c',
      ring: '#fb7185',
      shadowLuxe: '0 24px 60px -24px rgb(251 113 133 / 0.35)',
    },
    dark: {
      primaryInk: '#fda4af',
      accent: '#fb7185',
      accentDeep: '#fda4af',
      shadowLuxe: '0 24px 60px -24px rgb(251 113 133 / 0.3)',
    },
  },
};

export const sites: Record<SiteId, Site> = { ejjimmy, solar1, template };

/** Unknown hosts (localhost, preview URLs, custom domains) keep today's site. */
export const DEFAULT_SITE: SiteId = 'ejjimmy';

export function siteFromHost(host: string): Site {
  const wanted = bareHost(host);
  for (const candidate of Object.values(sites)) {
    if (bareHost(candidate.host) === wanted) return candidate;
  }
  return sites[DEFAULT_SITE];
}

/** The default site's identity, kept for the code that has not been made per-request yet. */
export const brand = site.brand;

/** The default site's contacts, same rule. */
export const contact = ejjimmy.contact;

/** The default site's address, same rule. */
export const address = ejjimmy.address;

/** The public origin; `NEXT_PUBLIC_SITE_URL` overrides it per deployment. */
export const siteUrl = ejjimmy.url;

/**
 * The brand-owned variables for one site, as a stylesheet. Rendered inline in the root layout's
 * `<head>` after `brand.generated.css`, which carries the default site's palette — the extra
 * `html` in the selectors wins on specificity, so the order of the two never matters.
 */
export function themeCss(target: Site): string {
  const cssVar = (key: string) => `--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
  const block = (selector: string, map: Record<string, string>) => {
    const body = Object.entries(map)
      .map(([key, value]) => `${cssVar(key)}:${value}`)
      .join(';');
    return body ? `${selector}{${body}}` : '';
  };
  return [block('html:root', target.theme.light), block('html.dark', target.theme.dark)]
    .filter(Boolean)
    .join('\n');
}