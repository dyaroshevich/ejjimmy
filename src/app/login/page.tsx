'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Zap, Loader2 } from 'lucide-react';
import { useSite } from '@/lib/site-context';
import { homeForRole } from '@/lib/access';

export default function LoginPage() {
  const { brand } = useSite();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error('Configuration missing: Supabase is not configured. Check environment variables.');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Route by role, and refuse politely when the account has none: sending a customer to `/admin`
      // meant the middleware bounced them straight back here, so signing in looked broken.
      const { data: { user } } = await supabase.auth.getUser();
      const home = homeForRole(user?.app_metadata?.role);
      if (!home) {
        await supabase.auth.signOut();
        throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน · This account has no staff or partner access.');
      }
      // Force full page reload to ensure middleware detects the session cookie
      window.location.href = home;
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase text-center">
            {brand.name} ADMIN
          </h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">
            Secure Login
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="loginEmail" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">
              Email Address
            </label>
            <input
              id="loginEmail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-orange-500 focus:outline-none transition-all"
              placeholder="admin@tawanpower.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="loginPassword" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">
              Password
            </label>
            <input
              id="loginPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-orange-500 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full h-16 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} aria-hidden="true" />
                <span className="sr-only">Signing in…</span>
              </>
            ) : (
              'Enter Admin Panel'
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
        © 2026 {brand.nameTh} ({brand.name})
      </p>
    </div>
  );
}
