import { homeForRole, isPartner, isStaff, resolveAccess } from '@/lib/access';

// The admin shell must be reachable by exactly two roles and by nobody else. These tests walk the whole
// matrix — anonymous, customer, partner, admin, super_admin — because the bug they were written after was
// a *wrong branch* in `/login` (a roleless account sent to `/admin`, then bounced back), which no
// sign-in test in a browser would have called a failure.

describe('resolveAccess · /admin', () => {
  it.each(['admin', 'super_admin'])('lets %s in', (role) => {
    expect(resolveAccess('/admin', role)).toEqual({ action: 'allow' });
    expect(resolveAccess('/admin/leads', role)).toEqual({ action: 'allow' });
    expect(resolveAccess('/admin/super', role)).toEqual({ action: 'allow' });
  });

  it('sends a partner to their own dashboard instead of a login form they finished', () => {
    expect(resolveAccess('/admin', 'partner')).toEqual({ action: 'redirect', to: '/partner' });
  });

  it.each([undefined, null, '', 'customer', 'staff', 'ADMIN', 'superadmin'])(
    'denies %p — the role must be exactly one of the two staff values',
    (role) => {
      expect(resolveAccess('/admin', role as string | null | undefined)).toEqual({ action: 'login' });
    },
  );
});

describe('resolveAccess · /partner', () => {
  it('lets partners and staff in', () => {
    for (const role of ['partner', 'admin', 'super_admin']) {
      expect(resolveAccess('/partner/leads', role)).toEqual({ action: 'allow' });
    }
  });

  it.each([undefined, 'customer', ''])('denies %p', (role) => {
    expect(resolveAccess('/partner', role as string | undefined)).toEqual({ action: 'login' });
  });
});

describe('resolveAccess · everything else', () => {
  it('does not touch the storefront', () => {
    for (const role of [undefined, 'customer', 'partner', 'admin']) {
      expect(resolveAccess('/', role)).toEqual({ action: 'allow' });
      expect(resolveAccess('/blog/solar-2569', role)).toEqual({ action: 'allow' });
    }
  });

  it('is not fooled by a path that merely contains the word', () => {
    // `/administrator` is not `/admin`; prefix matching a bare string would have granted it.
    expect(resolveAccess('/administrator', undefined)).toEqual({ action: 'allow' });
  });
});

describe('homeForRole', () => {
  it('matches the middleware: staff to /admin, partners to /partner', () => {
    expect(homeForRole('admin')).toBe('/admin');
    expect(homeForRole('super_admin')).toBe('/admin');
    expect(homeForRole('partner')).toBe('/partner');
  });

  it('returns null for an account with no role, so /login can say so', () => {
    expect(homeForRole(undefined)).toBeNull();
    expect(homeForRole('customer')).toBeNull();
    expect(homeForRole('')).toBeNull();
  });

  it('agrees with resolveAccess for every role it accepts', () => {
    for (const role of ['admin', 'super_admin', 'partner']) {
      const home = homeForRole(role);
      expect(home).not.toBeNull();
      expect(resolveAccess(home as string, role)).toEqual({ action: 'allow' });
    }
  });
});

describe('isStaff / isPartner', () => {
  it('are strict about the exact role values', () => {
    expect(isStaff('admin')).toBe(true);
    expect(isStaff('Admin')).toBe(false);
    expect(isStaff(undefined)).toBe(false);
    expect(isPartner('partner')).toBe(true);
    expect(isPartner('partners')).toBe(false);
  });
});
