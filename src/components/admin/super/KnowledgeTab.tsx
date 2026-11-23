'use client';

import { Button } from '@/components/ui/button';
import { Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

type ConnStatus = 'idle' | 'testing' | 'ok' | 'fail';

export default function KnowledgeTab() {
  const t = useTranslations('admin');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('system_config').select('value').eq('key', 'rag_endpoint').single();
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          setEndpoint(parsed.url || '');
          setApiKey(parsed.apiKey || '');
          if (parsed.url) setCurrentStatus('configured');
          else setCurrentStatus(null);
        } catch {
          if (typeof data.value === 'string' && data.value !== 'null') {
            setEndpoint(data.value);
            setCurrentStatus('configured');
          }
        }
      }
    }
    load();
  }, []);

  async function testConnection() {
    if (!endpoint) return;
    setConnStatus('testing');
    try {
      const res = await fetch(endpoint + '/health', {
        method: 'GET',
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        signal: AbortSignal.timeout(5000),
      });
      setConnStatus(res.ok ? 'ok' : 'fail');
    } catch {
      setConnStatus('fail');
    }
    setTimeout(() => setConnStatus('idle'), 4000);
  }

  async function save() {
    setSaving(true);
    await supabase.from('system_config').upsert({
      key: 'rag_endpoint',
      value: JSON.stringify({ url: endpoint, apiKey }),
    });
    setCurrentStatus(endpoint ? 'configured' : null);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isConfigured = !!endpoint;

  return (
    <div className="space-y-4">
      {!isConfigured ? (
        <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-8 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
            <Database size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-orangeNoir-text">{t('kbTitle')}</h3>
          <p className="text-[11px] font-medium text-slate-400 dark:text-orangeNoir-textMuted max-w-xs">
            {t('kbSub')}
          </p>
        </div>
      ) : null}

      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">{t('kbExtTitle')}</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="kbUrl" className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted mb-1 block">{t('kbUrl')}</label>
            <input id="kbUrl"
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/v1/retrieval"
              className="w-full h-11 bg-slate-50 dark:bg-orange-900/20 border border-slate-100 dark:border-orangeNoir-border rounded-xl px-4 text-xs text-slate-900 dark:text-orangeNoir-text outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 dark:focus:ring-orange-900/30 transition-all placeholder:text-slate-300 dark:placeholder:text-orange-900/40"
            />
          </div>
          <div>
            <label htmlFor="kbKey" className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted mb-1 block">{t('kbKey')}</label>
            <input id="kbKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full h-11 bg-slate-50 dark:bg-orange-900/20 border border-slate-100 dark:border-orangeNoir-border rounded-xl px-4 text-xs text-slate-900 dark:text-orangeNoir-text outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 dark:focus:ring-orange-900/30 transition-all placeholder:text-slate-300 dark:placeholder:text-orange-900/40"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={!endpoint || connStatus === 'testing'}
              className="flex-1 h-11 rounded-xl text-xs font-medium bg-transparent border-slate-100 dark:border-orangeNoir-border text-slate-500 dark:text-orangeNoir-textMuted hover:bg-slate-50 dark:hover:bg-orange-900/20 hover:text-slate-700 dark:hover:text-orangeNoir-text"
            >
              {connStatus === 'testing' ? (
                <Loader2 className="animate-spin mx-auto" size={14} />
              ) : connStatus === 'ok' ? (
                <CheckCircle2 size={14} className="text-orange-600 dark:text-orange-400" />
              ) : connStatus === 'fail' ? (
                <XCircle size={14} className="text-red-500 dark:text-red-400" />
              ) : null}
              {connStatus === 'idle' ? t('kbTest') : connStatus === 'testing' ? t('kbTesting') : connStatus === 'ok' ? t('kbOk') : t('kbFail')}
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="flex-1 h-11 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-orange-600/20"
            >
              {saving ? <Loader2 className="animate-spin mx-auto" size={14} /> : saved ? t('kbSaved') : t('kbSave')}
            </Button>
          </div>
        </div>
      </div>

      {currentStatus && (
        <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-4 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-orange-500 dark:bg-orange-400' : 'bg-slate-300 dark:bg-orange-900/40'}`} />
          <span className="text-xs font-medium text-slate-500 dark:text-orangeNoir-textMuted">
            {isConfigured ? t('kbConfigured') : t('kbNotConfigured')}
          </span>
        </div>
      )}
    </div>
  );
}