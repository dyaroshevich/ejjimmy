import { adminAllows } from '../admin-nav';
import { sites } from '../site.config';

/**
 * The template shipped with three menu items and twenty-three reachable pages. These are the two halves of
 * the fix: what a franchisee's admin keeps, and that the flagship keeps everything it had.
 */
describe('adminAllows', () => {
  const franchisee = sites.template;
  const flagship = sites.ejjimmy;

  it('gives a franchisee its overview, leads, catalogue and posts', () => {
    expect(adminAllows(franchisee, '/admin', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/leads', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/leads/12', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/products', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/products/new', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/content', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/content/posts', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/content/posts/new', 'admin')).toBe(true);
    expect(adminAllows(franchisee, '/admin/content/posts/7/edit', 'admin')).toBe(true);
  });

  it('takes away the content factory and the super panel', () => {
    // The super panel is not even for a super admin: the config does not offer it.
    expect(adminAllows(franchisee, '/admin/super', 'super_admin')).toBe(false);
    // The content factory is `full`-only; `mini` keeps the overview and the posts.
    expect(adminAllows(franchisee, '/admin/content/generator', 'admin')).toBe(false);
    expect(adminAllows(franchisee, '/admin/content/brief', 'admin')).toBe(false);
    expect(adminAllows(franchisee, '/admin/content/calendar', 'admin')).toBe(false);
  });

  it('leaves the flagship with its whole factory', () => {
    expect(adminAllows(flagship, '/admin/products', 'admin')).toBe(true);
    expect(adminAllows(flagship, '/admin/content/generator', 'admin')).toBe(true);
    expect(adminAllows(flagship, '/admin/content/brief', 'admin')).toBe(true);
  });

  it('keeps the super panel to a super admin', () => {
    expect(adminAllows(flagship, '/admin/super', 'super_admin')).toBe(true);
    expect(adminAllows(flagship, '/admin/super', 'admin')).toBe(false);
    expect(adminAllows(flagship, '/admin/super', null)).toBe(false);
  });

  it('ignores a trailing slash and refuses an unknown admin path', () => {
    expect(adminAllows(franchisee, '/admin/leads/', 'admin')).toBe(true);
    expect(adminAllows(flagship, '/admin/whatever', 'super_admin')).toBe(false);
  });
});
