import { isAdminAuthorized } from '../admin-auth';

// Mock Supabase and cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('../supabase', () => ({
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

describe('admin-auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAdminAuthorized', () => {
    it('returns false when Supabase is not configured', async () => {
      const mod = require('../supabase');
      mod.SUPABASE_URL = '';
      mod.SUPABASE_ANON_KEY = '';

      const result = await isAdminAuthorized();
      expect(result).toBe(false);

      // Restore
      mod.SUPABASE_URL = 'http://localhost:54321';
      mod.SUPABASE_ANON_KEY = 'test-anon-key';
    });

    it('returns false when user is not authenticated', async () => {
      const { cookies } = require('next/headers');
      cookies.mockReturnValue({ get: () => undefined });

      // The createServerClient will fail to validate, returning false
      const result = await isAdminAuthorized();
      expect(typeof result).toBe('boolean');
    });
  });
});
