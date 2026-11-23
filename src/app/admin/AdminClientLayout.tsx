'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Zap,
  LayoutDashboard,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  BellOff,
  FileEdit
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import PushSubscriptionManager from '@/components/PushSubscriptionManager';
import NotificationHandler from '@/components/admin/NotificationHandler';
import { useTranslations } from 'next-intl';
import { useSite } from '@/lib/site-context';
import { adminAllows } from '@/lib/admin-nav';
import type { AdminItem } from '@/lib/site.config';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMOvp5mdoVJtKnCBcFX72VO23TXLM0xGIltKi5GTjEh8jDS7TLPxxgW9Ba6hjr27K5jVhLYgJz7cJl8R_c4ZBMo';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminClientLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('admin');
  // The hostname decides how much admin this storefront gets: Solar 1 Krabi runs the whole panel,
  // the template runs a dashboard, leads and posts. Same build, one nav list.
  const site = useSite();
  const { brand, admin } = site;
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pushStatus, setPushStatus] = useState<'unknown' | 'subscribed' | 'unsubscribed'>('unknown');
  const [aiStatus, setAiStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // Fetch AI health status periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/admin/health');
        const data = await res.json();
        setAiStatus(data.gemini === 'ok' && data.groq === 'ok' ? 'ok' : 'error');
      } catch {
        setAiStatus('error');
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, []);

  // Auto-check push subscription status and Force Refresh SW
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const initSW = async (attempt = 0) => {
      if (!isMounted || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

      try {
        const existingRegs = await navigator.serviceWorker.getRegistrations();
        let reg = existingRegs.find(r => r.active?.scriptURL?.includes('custom-sw'));
        
        if (!reg) {
          for (const r of existingRegs) {
            if (r.active) {
              await r.unregister().catch(() => {});
            }
          }
          
          if (attempt === 0) {
            timeoutId = setTimeout(() => initSW(1), 3000);
            return;
          }
          
          try {
            reg = await navigator.serviceWorker.register('/custom-sw.js', { scope: '/admin' });
            await navigator.serviceWorker.ready;
          } catch (regErr) {
            if (attempt < 3) {
              timeoutId = setTimeout(() => initSW(attempt + 1), 3000 * (attempt + 1));
              return;
            } else {
              return;
            }
          }
        }
        
        const subscription = await reg.pushManager.getSubscription();
        if (isMounted) {
          setPushStatus(subscription ? 'subscribed' : 'unsubscribed');
        }
      } catch (err: any) {
        console.warn('[PUSH] SW init error:', err.name);
      }
    };
    
    timeoutId = setTimeout(initSW, 1500);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Auto-subscribe if not subscribed and user has granted permission previously
  useEffect(() => {
    const attemptSilentSubscribe = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }
      
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();
        
        if (existingSub) return;
        
        const permission = Notification.permission;
        if (permission !== 'granted') return;
        
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const keyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyArray as unknown as BufferSource,
        });
        
        const subData = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        
        if (!supabase) return;
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          endpoint: subData.endpoint,
          p256dh: subData.keys.p256dh,
          auth: subData.keys.auth,
          updated_at: new Date().toISOString(),
        });
        
        setPushStatus('subscribed');
      } catch (err) {
        console.error('[PUSH] Layout: Silent subscribe failed:', err);
      }
    };
    
    const timer = setTimeout(attemptSilentSubscribe, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const ALL_NAV: Array<{ id: AdminItem; name: string; href: string; icon: typeof Users }> = [
    { id: 'dashboard', name: t('navDashboard'), href: '/admin', icon: LayoutDashboard },
    { id: 'leads', name: t('navLeads'), href: '/admin/leads', icon: Users },
    { id: 'products', name: t('navProducts'), href: '/admin/products', icon: Package },
    { id: 'content', name: 'Content', href: '/admin/content', icon: FileEdit },
    { id: 'super', name: t('navSuper'), href: '/admin/super', icon: Settings },
  ];
  // The same question the layout asks before rendering, so a link never leads to a 404.
  const navItems = ALL_NAV.filter((item) => adminAllows(site, item.href, role));

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <>

      <div className="min-h-screen bg-orangeLight-bg dark:bg-orangeNoir-bg flex flex-col lg:flex-row font-sans text-orangeLight-text dark:text-orangeNoir-text transition-colors duration-500">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar border-r border-orangeLight-border dark:border-orangeNoir-border flex-col sticky top-0 h-screen shadow-sm shrink-0">
        <div className="p-8 border-b border-orangeLight-border dark:border-orangeNoir-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg animate-sun-glow">
              <svg width="18" height="18" viewBox="0 0 122 122" fill="currentColor">
                <g clipPath="url(#clip0_142_62)">
                  <path d="M55.4545 22.1818V0H66.5455V22.1818H55.4545ZM92.3318 37.4318L84.7068 29.8068L100.234 13.8636L107.998 21.7659L92.3318 37.4318ZM99.8182 66.5455V55.4545H122V66.5455H99.8182ZM55.4545 122V99.8182H66.5455V122H55.4545ZM29.6682 37.1545L13.8636 21.7659L21.7659 14.0023L37.4318 29.6682L29.6682 37.1545ZM100.095 108.136L84.7068 92.1932L92.1932 84.7068L107.998 99.9568L100.095 108.136ZM0 66.5455V55.4545H22.1818V66.5455H0ZM21.7659 108.136L14.0023 100.234L29.5295 84.7068L33.55 88.45L37.5705 92.3318L21.7659 108.136ZM37.4318 84.5682C30.9621 78.0985 27.7273 70.2424 27.7273 61C27.7273 51.7576 30.9621 43.9015 37.4318 37.4318C43.9015 30.9621 51.7576 27.7273 61 27.7273C70.2424 27.7273 78.0985 30.9621 84.5682 37.4318C91.0379 43.9015 94.2727 51.7576 94.2727 61C94.2727 70.2424 91.0379 78.0985 84.5682 84.5682C78.0985 91.0379 70.2424 94.2727 61 94.2727C51.7576 94.2727 43.9015 91.0379 37.4318 84.5682Z" fill="currentColor"/>
                </g>
                <defs>
                  <clipPath id="clip0_142_62">
                    <rect width="122" height="122" fill="currentColor"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold tracking-wide text-slate-400 dark:text-slate-400 normal-case">{t('adminPanel')}</span>
              <span className="text-sm font-black tracking-[0.12em] text-slate-900 dark:text-white uppercase">{brand.name}</span>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-orangeNoir-card text-slate-500 dark:text-orangeNoir-accent hover:bg-slate-200 dark:hover:bg-orangeNoir-cardHover transition-all"
            title={t('toggleTheme')}
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                isActive(item.href) 
                  ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-black' 
                  : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} strokeWidth={isActive(item.href) ? 3 : 2} />
                <span className="text-sm font-black uppercase tracking-widest">{item.name}</span>
              </div>
              {isActive(item.href) && <ChevronRight size={16} />}
            </Link>
          ))}
          
          <div className={`mt-4 px-4 py-3 rounded-2xl border flex items-center gap-3 transition-colors ${
            aiStatus === 'ok' ? 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100/50 dark:border-orange-900/20' :
            aiStatus === 'error' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100/50 dark:border-red-900/20' :
            'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100/50 dark:border-slate-900/20'
          }`}>
             <div className="relative">
               <div className={`w-2 h-2 rounded-full absolute opacity-75 ${
                 aiStatus === 'ok' ? 'bg-orange-500 animate-ping' : 
                 aiStatus === 'error' ? 'bg-red-500' : 'bg-slate-300'
               }`} />
               <div className={`w-2 h-2 rounded-full relative ${
                 aiStatus === 'ok' ? 'bg-orange-500' : 
                 aiStatus === 'error' ? 'bg-red-500' : 'bg-slate-300'
               }`} />
             </div>
             <span className={`text-[10px] font-black uppercase tracking-widest ${
               aiStatus === 'ok' ? 'text-orange-600 dark:text-orange-400' : 
               aiStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-400'
             }`}>
                {aiStatus === 'ok' ? t('aiOk') : aiStatus === 'error' ? t('aiError') : t('aiChecking')}
             </span>
          </div>
        </nav>

        <div className="p-6 border-t border-orangeLight-border dark:border-orangeNoir-border space-y-4">
          <div className="flex gap-2">
            <NotificationHandler />
            <div className="flex-1">
              <PushSubscriptionManager />
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
          <Link 
            href="/" 
            className="flex items-center gap-4 p-4 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LayoutDashboard size={18} />
            <span>{t('backToSite')}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar text-orangeLight-text dark:text-orange-50 p-6 sticky top-0 z-50 flex items-center justify-between border-b border-orangeLight-border dark:border-orangeNoir-border shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg animate-sun-glow">
            <Zap size={16} fill="currentColor" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-bold tracking-wide text-slate-400 dark:text-slate-400 normal-case">{t('adminPanel')}</span>
            <span className="text-xs font-black tracking-[0.12em] text-slate-900 dark:text-white uppercase">{brand.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-orangeLight-textMuted dark:text-orange-400"
          >
            {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {adminAllows(site, '/admin/super', role) && (
            <Link href="/admin/super" className="p-2 text-orangeLight-textMuted dark:text-orange-400">
              <Settings size={24} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-orangeLight-bg dark:bg-orangeNoir-bg pb-20 lg:pb-0 overflow-hidden">
        <div className="w-full h-full overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar border-t border-orangeLight-border dark:border-orangeNoir-border px-6 pt-4 pb-3 z-50 flex justify-between items-center shadow-lg">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive(item.href) ? 'text-orange-600 dark:text-orange-400 scale-110' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted'
            }`}
          >
            <item.icon size={22} strokeWidth={isActive(item.href) ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
    </>
  );
}
