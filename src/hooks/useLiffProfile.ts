'use client';

import { useState, useEffect } from 'react';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
}

interface UseLiffProfileReturn {
  profile: LiffProfile | null;
  loading: boolean;
  error: string | null;
  isInClient: boolean;
}

interface WindowWithLiff {
  liff?: {
    init(config: { liffId: string; withTokenForBrowserAccess?: boolean }): Promise<void>;
    getAccessToken(): string | null;
    isInClient(): boolean;
    getProfile(): Promise<{ userId: string; displayName: string; pictureUrl?: string; email?: string }>;
  };
}

export function useLiffProfile(): UseLiffProfileReturn {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInClient, setIsInClient] = useState(false);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
    if (!liffId) {
      setError('LIFF ID not configured');
      return;
    }

    const initLiff = async () => {
      try {
        setLoading(true);

        const w = typeof window !== 'undefined' ? window as WindowWithLiff : null;
        if (!w || !w.liff) {
          setError('LIFF SDK not loaded');
          setLoading(false);
          return;
        }

        const isInClient = w.liff.isInClient();
        setIsInClient(isInClient);

        if (!isInClient) {
          setError('Not in LINE app');
          setLoading(false);
          return;
        }

        await w.liff.init({ liffId, withTokenForBrowserAccess: true });

        const token = w.liff.getAccessToken();
        if (!token) {
          setError('No access token');
          setLoading(false);
          return;
        }

        const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!verifyRes.ok) {
          setError('Token verification failed');
          setLoading(false);
          return;
        }

        const verifyData = await verifyRes.json();
        setProfile({
          userId: verifyData.sub || '',
          displayName: 'LINE User',
          pictureUrl: undefined,
          email: verifyData.email || undefined
        });

        setLoading(false);
      } catch (err: any) {
        console.error('[useLiffProfile] Error:', err);
        setError(err.message || 'Failed to get profile');
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  return { profile, loading, error, isInClient };
}