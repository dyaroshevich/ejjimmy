'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function PushSubscriptionManager() {
  const [status, setStatus] = useState<'loading' | 'unsubscribed' | 'subscribed' | 'error' | 'unsupported'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    console.log('[PUSH] Manager Initializing. VAPID Key status:', !!VAPID_PUBLIC_KEY);
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      console.log('[PUSH] Current subscription:', subscription ? 'active' : 'none');
      setStatus(subscription ? 'subscribed' : 'unsubscribed');
    } catch (err) {
      console.error('[PUSH] Check error:', err);
      setStatus('error');
    }
  };

  const subscribe = async () => {
    setStatus('loading');
    setErrorMsg(null);

    try {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID_PUBLIC_KEY_MISSING');
      }

      console.log('[PUSH] Requesting subscription with key:', VAPID_PUBLIC_KEY.substring(0, 10) + '...');
      
      // Wait for any existing SW to be ready, with retry logic
      let registration: ServiceWorkerRegistration | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          registration = regs.find(r => r.active?.scriptURL?.includes('custom-sw')) || null;
          
          if (!registration) {
            // Register if not found
            try {
              registration = await navigator.serviceWorker.register('/custom-sw.js', { scope: '/admin' });
            } catch (regErr: any) {
              // Storage error - retry with delay
              if (attempt < 2 && (regErr.name === 'SecurityError' || regErr.message?.includes('storage'))) {
                console.warn(`[PUSH] SW register attempt ${attempt + 1} failed, retrying...`);
                await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                continue;
              }
              throw regErr;
            }
          }
          
          await navigator.serviceWorker.ready;
          break;
        } catch (err: any) {
          if (attempt === 2) throw err;
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      
      if (!registration) throw new Error('ServiceWorker registration failed');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission denied');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('[PUSH] Subscription successful. Saving to DB...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Auth session missing');

      const subData = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      
      const { error: upsertError } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subData.endpoint,
        p256dh: subData.keys.p256dh,
        auth: subData.keys.auth,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      console.log('[PUSH] Sub saved to DB.');
      setStatus('subscribed');
    } catch (err: any) {
      console.error('[PUSH] Subscribe error:', err);
      setStatus('error');
      setErrorMsg(err.message === 'VAPID_PUBLIC_KEY_MISSING' ? 'Server Config Error' : err.message);
    }
  };

  const unsubscribe = async () => {
    setStatus('loading');
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
      }
      
      setStatus('unsubscribed');
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Checking...</span>
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-amber-500">
        <AlertCircle size={16} />
        <span className="text-xs">Push not supported</span>
      </div>
    );
  }

  return (
    <div className="px-4">
      {status === 'subscribed' ? (
        <button
          onClick={unsubscribe}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <BellOff size={16} />
          ปิดการแจ้งเตือน
        </button>
      ) : (
        <button
          onClick={subscribe}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-200 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <Bell size={16} />
          เปิดการแจ้งเตือน
        </button>
      )}
      {errorMsg && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-[10px] text-red-600 dark:text-red-400 font-bold text-center leading-tight">
            {errorMsg}
          </p>
          {status === 'error' && (
            <p className="text-[8px] text-slate-400 mt-1 text-center italic">
              Try clearing browser cache or re-installing PWA
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}