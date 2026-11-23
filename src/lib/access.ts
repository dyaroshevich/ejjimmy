/**
 * Who may open which staff area, in one decision.
 *
 * Before this, the rule was written twice and differently: `middleware.ts` decided whether a request to
 * `/admin` or `/partner` may pass, and `/login` decided where to send a user after signing in — with
 * `role === 'partner' ? '/partner' : '/admin'`. That last branch sent an account with **no role at all**
 * to `/admin`, where the middleware bounced it back to `/login`: a sign-in that looks broken and says
 * nothing. Both sides now call this file, so "can they get in" and "where do they land" cannot disagree.
 *
 * The roles are the ones Supabase carries in `app_metadata.role`; anything else (including a missing
 * value) is treated as a customer, never as staff.
 */

export type StaffRole = string | null | undefined;

export type AccessDecision =
  | { action: 'allow' }
  /** Send to `/login` — no session, or a session without the role this area needs. */
  | { action: 'login' }
  /** Send somewhere else the account *is* allowed to be. */
  | { action: 'redirect'; to: string };

const STAFF = ['admin', 'super_admin'];
const PARTNER = ['partner'];

export function isStaff(role: StaffRole): boolean {
  return !!role && STAFF.includes(role);
}

export function isPartner(role: StaffRole): boolean {
  return !!role && PARTNER.includes(role);
}

/** The one place a role decides "may this account open /admin". */
export function resolveAccess(pathname: string, role: StaffRole): AccessDecision {
  const path = pathname || '/';

  if (path === '/admin' || path.startsWith('/admin/')) {
    if (isStaff(role)) return { action: 'allow' };
    // A partner is a legitimate account with no business in the staff shell: send them to their own area
    // rather than to a login form they have already completed.
    if (isPartner(role)) return { action: 'redirect', to: '/partner' };
    return { action: 'login' };
  }

  if (path === '/partner' || path.startsWith('/partner/')) {
    if (isPartner(role) || isStaff(role)) return { action: 'allow' };
    return { action: 'login' };
  }

  return { action: 'allow' };
}

/**
 * Where a freshly signed-in account belongs, or `null` when it may not sign in to anything here.
 *
 * `null` is what `/login` renders as an error instead of bouncing the visitor into a redirect it will
 * lose. Staff and partners are the only two audiences this form serves.
 */
export function homeForRole(role: StaffRole): string | null {
  if (isStaff(role)) return '/admin';
  if (isPartner(role)) return '/partner';
  return null;
}
