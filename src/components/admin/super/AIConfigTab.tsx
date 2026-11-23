'use client';

import { Button } from '@/components/ui/button';
import { Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

type ModelKey = 'groq' | 'gemini' | 'openai' | 'zai';

const models = [
  { key: 'groq' as const, name: 'Groq', label: 'Llama 3.3 70B', badge: 'FREE', descKey: 'aiDescGroq' },
  { key: 'gemini' as const, name: 'Gemini', label: 'Flash 2.0', badge: 'FREE', descKey: 'aiDescGemini' },
  { key: 'openai' as const, name: 'OpenRouter', label: 'Llama 3.3 70B Free', badge: 'FREE', descKey: 'aiDescOpenai' },
  { key: 'zai' as const, name: 'Z.AI', label: 'GLM-4.7 Flash', badge: 'FREE', descKey: 'aiDescZai' },
];

export default function AIConfigTab() {
  const t = useTranslations('admin');
  const [active, setActive] = useState<ModelKey>('gemini');
  const [temperature, setTemperature] = useState(0.7);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase.from('system_config').select('value').eq('key', 'ai_model').single();
      const { data: t } = await supabase.from('system_config').select('value').eq('key', 'ai_temperature').single();
      if (m?.value) {
        try { setActive(JSON.parse(m.value)); } catch { setActive(m.value as ModelKey); }
      }
      if (t?.value) {
        try { setTemperature(parseFloat(t.value)); } catch { setTemperature(0.7); }
      }
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    await supabase.from('system_config').upsert({ key: 'ai_model', value: JSON.stringify(active) });
    await supabase.from('system_config').upsert({ key: 'ai_temperature', value: JSON.stringify(temperature) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">{t('aiModelTitle')}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {models.map((m) => (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                active === m.key
                  ? 'bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-600'
                  : 'bg-slate-50 dark:bg-orange-900/20 border-slate-100 dark:border-orangeNoir-border hover:border-slate-200 dark:hover:border-orange-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-orangeNoir-text">{m.name}</span>
                {active === m.key ? (
                  <CheckCircle2 size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-orange-900/40 shrink-0" />
                )}
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-orangeNoir-textMuted">{t(m.descKey)}</p>
              {active === m.key && (
                <span className="inline-block mt-2 text-[8px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50 px-1.5 py-0.5 rounded-full">
                  กำลังใช้งาน
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">{t('aiTemp')}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted w-12 shrink-0">{t('aiTempLow')}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-100 dark:bg-orange-900/40 rounded-full appearance-none cursor-pointer accent-orange-600 dark:accent-orange-500"
          />
          <span className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted w-12 shrink-0 text-right">{t('aiTempHigh')}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-orangeNoir-text w-8 text-right">{temperature.toFixed(1)}</span>
        </div>
      </div>

      <Button
        onClick={save}
        disabled={saving}
        className="w-full h-11 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-orange-600/20"
      >
        {saving ? <Loader2 className="animate-spin mx-auto" size={16} /> : saved ? t('aiSaved') : t('setSave')}
      </Button>
    </div>
  );
}