import { DEFAULT_SITE } from './site.config';
import { getSite } from './site-server';
import { scopeTenant, type TableClient } from './tenant';

/**
 * The request's own storefront — the only thing `scopeTenant()` needs to know.
 *
 * Kept apart from `tenant.ts` on purpose: that module is a pure proxy over a client and can be imported
 * anywhere, while this one reads `next/headers` and therefore must never reach a browser bundle (the same
 * split as `site.config.ts` / `site-server.ts`).
 *
 * Outside a request (a build step, a script) there is no host to read, and the flagship is the only
 * honest answer; the warning makes such a caller visible rather than silently unscoped.
 */
let warned = false;
export function requestSiteId(): string {
  try {
    return getSite().id;
  } catch {
    if (!warned) {
      warned = true;
      console.warn(`[tenant] no request context — scoping to ${DEFAULT_SITE}`);
    }
    return DEFAULT_SITE;
  }
}

/** A server client scoped to the request's storefront; pass a function when the client outlives a request. */
export function tenantClient<T extends TableClient>(client: T, site: string | (() => string) = requestSiteId): T {
  return scopeTenant(client, site);
}
