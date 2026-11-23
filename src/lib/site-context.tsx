'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Site } from './site.config';

const SiteContext = createContext<Site | null>(null);

/**
 * The site's brand, contacts and sections, for client components.
 *
 * The root layout resolves the site once per request (`getSite()`) and hands the object down, so a
 * client component never has to guess from `window.location` — which would render the default brand
 * on the server and swap it after hydration.
 */
export function SiteProvider({ site, children }: { site: Site; children: ReactNode }) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

/** Throws outside the provider on purpose: a page rendered without it would show the wrong brand. */
export function useSite(): Site {
  const site = useContext(SiteContext);
  if (!site) throw new Error('useSite() must be used inside <SiteProvider>');
  return site;
}
