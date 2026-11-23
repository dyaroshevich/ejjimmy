'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Lock,
  Facebook,
  Instagram,
  Sparkles,
  CheckCircle,
  Link2,
  FileText
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('content');
  const [primaryColor, setPrimaryColor] = useState('#FF8A00');
  const [secondaryColor, setSecondaryColor] = useState('#f59e0b');
  const [toneOfVoice, setToneOfVoice] = useState('professional');
  const [aiPrompt, setAiPrompt] = useState(
    'คุณคือที่ปรึกษา AI ชั้นนำของ ทีมงาน Tawan Power กระบี่ (Tawan Power) ผู้เชี่ยวชาญด้านพลังงานแสงอาทิตย์ในจังหวัดกระบี่ ประเทศไทย เนื้อหาของคุณต้องมีความถูกต้องทางเทคนิค เป็นมืออาชีพ เข้าใจง่ายสำหรับเจ้าของวิลล่า และเหมาะสมกับสภาพอากาศเขตร้อน...'
  );

  const inputCls =
    'w-full bg-orangeLight-input dark:bg-orangeNoir-input border border-orangeLight-border dark:border-orangeNoir-border rounded-lg px-3 py-2.5 text-xs text-orangeLight-text dark:text-orangeNoir-text focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors';

  const selectCls =
    'w-full bg-orangeLight-input dark:bg-orangeNoir-input border border-orangeLight-border dark:border-orangeNoir-border rounded-lg px-3 py-2.5 text-xs text-orangeLight-text dark:text-orangeNoir-text focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors';

  const labelCls =
    'block text-[10px] font-mono font-bold tracking-wider text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase mb-1.5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 font-sans select-none"
    >
      {/* Card 1: Brand Settings */}
      <div className="rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm p-6 space-y-4 relative">
        <div className="flex items-center gap-2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
          <Lock size={14} className="text-amber-500" />
          <h3 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
            {t('setBrand')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-text">
          {/* Primary Color Swatch */}
          <div>
            <label htmlFor="setPrimary" className={labelCls}>{t('setPrimary')}</label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              <input
                id="setPrimary"
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Secondary Color Swatch */}
          <div>
            <label htmlFor="setSecondary" className={labelCls}>{t('setSecondary')}</label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border flex-shrink-0"
                style={{ backgroundColor: secondaryColor }}
              />
              <input
                id="setSecondary"
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Tone of Voice */}
        <div className="select-text">
          <label htmlFor="toneOfVoice" className={labelCls}>Tone of Voice</label>
          <select id="toneOfVoice"
            value={toneOfVoice}
            onChange={(e) => setToneOfVoice(e.target.value)}
            className={selectCls}
          >
            <option value="professional">
              {t('setTonePro')}
            </option>
            <option value="friendly">{t('setToneFriendly')}</option>
            <option value="expert">{t('setToneExpert')}</option>
          </select>
        </div>
      </div>

      {/* Card 2: Platform Integrations */}
      <div className="rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-orange-500" />
          <h3 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
            {t('setPlatforms')}
          </h3>
        </div>

        <div className="space-y-3">
          {/* Facebook page */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-orangeLight-border/60 dark:border-orangeNoir-border/20 bg-orangeLight-bg/40 dark:bg-orangeNoir-bg/10 hover:bg-orange-500/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Facebook size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-orangeLight-text dark:text-orangeNoir-text">
                  Facebook Pages
                </h4>
                <p className="text-[10px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-mono">
                  @tawanpower
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 font-mono">
              <CheckCircle size={12} />
                             {t('setConnected')}
            </span>
          </div>

          {/* Instagram business */
        }
          <div className="flex items-center justify-between p-3 rounded-lg border border-orangeLight-border/60 dark:border-orangeNoir-border/20 bg-orangeLight-bg/40 dark:bg-orangeNoir-bg/10 hover:bg-orange-500/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Instagram size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-orangeLight-text dark:text-orangeNoir-text">
                  Instagram Business
                </h4>
                <p className="text-[10px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-mono">
                  @tawanpower
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 font-mono">
              <CheckCircle size={12} />
              {t('setConnected')}
            </span>
          </div>

          {/* TikTok */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-orangeLight-border/60 dark:border-orangeNoir-border/20 bg-orangeLight-bg/40 dark:bg-orangeNoir-bg/10 hover:bg-orange-500/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-500/10 text-orangeLight-text dark:text-orangeNoir-text flex items-center justify-center">
                {/* Custom SVG path for TikTok */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.43-.45-.62-.69-.09 1.61-.07 3.23-.07 4.85 0 2.22-.38 4.49-1.63 6.32-1.45 2.14-4.06 3.4-6.66 3.25-2.92-.09-5.74-2.1-6.73-4.88-.95-2.58-.33-5.69 1.58-7.66C5.9 7.78 8.16 6.8 10.51 6.85c.61.02 1.22.12 1.8.31V11.3c-.67-.29-1.42-.4-2.14-.32-1.32.1-2.57.88-3.19 2.05-.69 1.25-.63 2.92.17 4.07.72 1.09 2.05 1.72 3.37 1.62 1.34-.05 2.6-.96 3.05-2.22.3-.82.26-1.73.27-2.6-.01-5.4-.01-10.79.01-16.19-.01-.01-.02-.01-.03-.02z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-orangeLight-text dark:text-orangeNoir-text">
                  TikTok for Business
                </h4>
                <p className="text-[10px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-mono">
                   {t('setNotConnected')}
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-[10px] transition-colors select-none">
              {t('setConnect')}
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: AI Prompt */}
      <div className="rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 select-none">
          <Sparkles size={16} className="text-orange-500" />
          <h3 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
            {t('setAiPrompt')}
          </h3>
        </div>

        <div className="select-text">
          <label htmlFor="setAiPromptLabel" className={labelCls}>{t('setAiPromptLabel')}</label>
          <textarea id="setAiPromptLabel"
            rows={5}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className={`${inputCls} resize-none font-mono text-[10px] leading-relaxed`}
            placeholder={t('setAiPromptPh')}
          />
        </div>

        <div className="flex justify-end pt-2 select-none">
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs shadow-sm transition-colors">
            {t('setSave')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
