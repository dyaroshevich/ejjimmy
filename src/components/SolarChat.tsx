'use client';

import { useChat, Message, UseChatHelpers } from '@ai-sdk/react';
import type { JSONValue } from '@ai-sdk/ui-utils';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { calculateSolarSystemV8, SolarCalculationResult, SolarCalculationInput } from '@/lib/solarCalculator';
import {
  Send, Calculator, Package, ArrowRight,
  ChevronRight, Home, Building2, Factory, Sparkles, Truck,
  Mic, MicOff, Info, PhoneCall, ArrowLeft,
  Share2, X, Check, RefreshCw, FileText,
  Loader2, Award
} from 'lucide-react';
import { useViewportVars } from '@/hooks/useViewportVars';
import { useLineBrowser } from '@/hooks/useLineBrowser';
import { supabase } from '@/lib/supabase';
// submitLead is called via API route to avoid server-only import issues in client components
import { createCalculatorResultShareCard } from '@/lib/line-messages';
import { brand } from '@/lib/site.config';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { encodeId } from '@/lib/hashid';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, detectMessageLocale, isStrongSwitch, type ChatLang } from '@/lib/chat-locale';

const ProductCard = dynamic(() => import('@/components/ProductCard').then(m => m.ProductCard), { ssr: false });
const LineLoginButton = dynamic(() => import('@/components/LineLoginButton').then(m => m.LineLoginButton), { ssr: false });
const SolarWebCalculator = dynamic(() => import('@/components/SolarWebCalculator'), { ssr: false });

interface ChatAnnotation { display: string; data: SolarCalculationResult & { equipmentTier?: string; location?: string; inputMode?: string; inputValue?: number } }
interface ChatMessage { id: string; role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool'; content: string; annotations?: ChatAnnotation[] }

// Helper: animated count-up that respects reduced-motion (returns final value instantly then)
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// Helper: Sanitize HTML to prevent XSS
function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags (client-side DOMPurify handles full sanitization)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*\/?>/gi, '')
      .replace(/<link\b[^>]*\/?>/gi, '')
      .replace(/<meta\b[^>]*\/?>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/data\s*:/gi, '');
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'br', 'b', 'i', 'em', 'u', 'span', 'a', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'class', 'style'],
  });
}

// Helper: Safely get text from message (backward compatible)
function getMessageText(m: Message): string {
  return m.content || '';
}

// Helper: Parse product tags and clean content safely
interface SolarSuggestion { label: string; query: string }
function renderContent(content: string, append: UseChatHelpers['append']) {
  if (!content) return null;

  // 1. Extract SUGGEST tags first
  const suggestRegex = /\[SUGGEST:([\s\S]*?)\]/g;
  const suggestions: SolarSuggestion[] = [];
  let m;
  while ((m = suggestRegex.exec(content)) !== null) {
    const [label, query] = m[1].split('|').map(s => s.trim());
    if (label && query) suggestions.push({ label, query });
  }

  // 2. Clean content from all internal tags
  const cleanContent = content
    .replace(suggestRegex, '')
    .replace(/\[AI_LEAD:[\s\S]*?\]/g, '') // Hide lead enrichment tags
    .replace(/\[ACTION:GENERATE_PDF\]/g, '') // Hide action tags
    .trim();

  // Split by product ID tags
  const parts = cleanContent.split(/(\[PRODUCT_ID:[\s\S]*?\])/);

  const elements: React.ReactNode[] = [];
  let currentProductIdGroup: string[] = [];

  parts.forEach((part, index) => {
    if (part.startsWith('[PRODUCT_ID:') && part.endsWith(']')) {
      const id = part.replace('[PRODUCT_ID:', '').replace(/\]$/, '').trim();
      currentProductIdGroup.push(id);
    } else {
      if (currentProductIdGroup.length > 0) {
        elements.push(<DynamicProductGroup key={`group-${index}`} ids={currentProductIdGroup} append={append} />);
        currentProductIdGroup = [];
      }

      // Clean the text part
      const trimmedPart = part.replace(/^(\s*<br\s*\/?>\s*)+/gi, '').trim();
      if (trimmedPart) {
        const cleanedText = sanitizeHtml(trimmedPart
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br />'));
        elements.push(
          <div key={index} className="max-w-[85%] px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 rounded-2xl rounded-bl-md border border-slate-200 dark:border-slate-700 shadow-sm mb-3 last:mb-0">
            <span dangerouslySetInnerHTML={{ __html: cleanedText }} />
          </div>
        );
      }
    }
  });
  if (currentProductIdGroup.length > 0) {
    elements.push(<DynamicProductGroup key="group-last" ids={currentProductIdGroup} append={append} />);
  }

  // 3. Add Suggestion Chips at the end
  if (suggestions.length > 0) {
    elements.push(
      <div key="suggestions" className="flex flex-wrap gap-2 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => append({ role: 'user', content: s.query })}
            className="px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 active:scale-95 transition-all shadow-sm"
          >
            {s.label}
          </button>
        ))}
      </div>
    );
  }

  return elements;
}

// Dynamic component to fetch and render products by ID
interface DBProduct { id: string; name: string; brand: string; type: string; power_kw: number; price_thb: number; description: string; image_url?: string; gallery?: string[] }
function DynamicProductGroup({ ids, append }: { ids: string[], append: UseChatHelpers['append'] }) {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('solar_products')
          .select('*')
          .in('id', ids);
        
        if (!error && data) {
          // Sort back to match the original ID order from AI
          const sorted = ids.map(id => data.find((p: any) => p.id === id)).filter(Boolean);
          setProducts(sorted);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [ids]);

  if (loading) {
    return (
      <div className="flex gap-3 my-2 overflow-x-auto pb-6 no-scrollbar">
        {ids.map(id => (
          <div key={id} className="w-[240px] h-[340px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] shrink-0" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 my-2 w-full items-start">
      <div className="flex overflow-x-auto gap-4 pb-8 w-full no-scrollbar snap-x touch-pan-x -mx-1 px-1" style={{ touchAction: 'pan-y' }}>
        {products.map((product, index) => (
          <div key={index} className="snap-start shrink-0 py-2">
            <ProductCard 
              product={product} 
              variant="chat"
              onChatClick={(msg) => {
                append({ role: 'user', content: msg });
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- UI: Typing Indicator ---
function TypingIndicator() {
  const t = useTranslations('chat');
  return (
    <div className="max-w-[85%] p-4 bg-white dark:bg-slate-800 rounded-xl rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 dark:text-slate-400 font-bold">{t('typing')}</span>
        <div className="flex gap-2">
          <span className="w-2 h-2 bg-orange-400 rounded-full motion-safe:animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-orange-400 rounded-full motion-safe:animate-pulse" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-orange-400 rounded-full motion-safe:animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}

// --- UI: Journey Step Indicator ---
function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex gap-3 justify-center mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`h-3 rounded-full transition-all duration-500 ${current === i ? 'w-10 bg-orange-500' : 'w-3 bg-slate-200 dark:bg-slate-700'}`} />
      ))}
    </div>
  );
}

// Global UI Constants
const PRIMARY_BTN = "w-full h-12 bg-orange-600 text-white rounded-full font-semibold text-sm shadow-sm hover:bg-orange-500 active:scale-[0.98] transition-all touch-manipulation";
const SELECT_BTN = "p-3 rounded-full border-2 font-semibold text-sm border-slate-200 hover:border-orange-300 active:scale-[0.98] transition-all touch-manipulation";
const STEP_TITLE = "text-2xl font-semibold text-slate-900 dark:text-white";
const STEP_SUBTITLE = "text-base font-medium text-slate-500 mt-2";

// --- UI: Advanced Result Dashboard ---
function ResultDashboard({ result, onAction, onNewCalc, generatingPdf }: { result: SolarCalculationResult & { equipmentTier?: string; location?: string }, onAction: (type: 'survey' | 'save' | 'consult' | 'proposal') => void, onNewCalc?: () => void, generatingPdf?: boolean }) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [view, setView] = useState<'savings' | 'payback' | 'overview'>('savings');
  const [isSaved, setIsSaved] = useState(false);

  const monthlySavings = result?.monthlySavingsThb || 0;
  const paybackYears = result?.paybackPeriodYears || 0;
  const yearlySavings = result?.yearlySavingsThb || 0;
  const systemKw = result?.recommendedSystemKw || 0;
  const tier = result?.equipmentTier || 'Premium';

  const animSavings = useCountUp(monthlySavings);
  const animPayback = useCountUp(paybackYears);
  const animTotal25 = useCountUp(yearlySavings * 25);

  const coffeePrice = 70;

  const handleAction = (type: 'survey' | 'save' | 'consult' | 'proposal') => {
    if (type === 'save' || type === 'consult') setIsSaved(true);
    onAction(type);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 my-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 px-4 py-3" role="tablist">
        {(['savings', 'payback', 'overview'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-3 px-4 text-[12px] font-semibold rounded-xl transition-all active:scale-[0.98] ${view === v ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {v === 'savings' ? t('tabSavings') : v === 'payback' ? t('tabPayback') : t('tabOverview')}
          </button>
        ))}
      </div>

      <div className="p-8 space-y-6 text-slate-900 dark:text-white">
        {view === 'savings' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-400 mb-2">{t('saveMax')}</p>
            <h2 className="text-5xl font-black text-orange-600 dark:text-orange-400">฿{Math.round(animSavings).toLocaleString(locale)} <span className="text-[18px] font-bold text-slate-400 dark:text-slate-400">{t('perMonth')}</span></h2>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-3">{t('coffeeEq', { n: Math.floor(animSavings / coffeePrice) })}</p>
          </div>
        )}
        {view === 'payback' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-400 mb-2">{t('paybackTime')}</p>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white">{Number.isInteger(paybackYears) ? Math.round(animPayback) : animPayback.toFixed(1)} <span className="text-[20px] font-bold text-orange-600 dark:text-orange-400 ml-2">{t('yearsUnit')}</span></h2>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-3">{t('freeAfter')}</p>
          </div>
        )}
        {view === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-400 mb-2">{t('longSave')}</p>
            <h2 className="text-5xl font-black text-orange-600 dark:text-orange-400">~ ฿{(animTotal25 / 1000000).toFixed(1)} <span className="text-[18px] font-bold text-slate-400 dark:text-slate-400 ml-2">{t('million')}</span></h2>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-3">{t('homeValueUp')}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="space-y-2">
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-400">{t('sysSize')}</p>
            <p className="text-[18px] font-black text-slate-900 dark:text-white">{systemKw} kW</p>
          </div>
          <div className="space-y-2">
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-400">{t('equipment')}</p>
            <p className="text-[18px] font-black text-slate-900 dark:text-white">{tier === 'Premium' ? t('tierPremium') : t('tierSaver')}</p>
          </div>
        </div>

        <div className="space-y-5 pt-6">
          <button onClick={() => handleAction('survey')} className={PRIMARY_BTN}>
            {t('bookSurvey')} <ArrowRight size={18} className="inline ml-2" />
          </button>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleAction('save')}
              disabled={isSaved}
              className={`flex items-center justify-center gap-3 h-14 rounded-full text-[12px] font-semibold border-2 transition-all active:scale-[0.98] ${isSaved ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400' : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-200 dark:hover:border-slate-500'}`}
            >
              {isSaved ? <Check size={16} /> : <Share2 size={16} />} {isSaved ? t('saved') : t('saveLine')}
            </button>
            <button onClick={() => handleAction('consult')} className="flex items-center justify-center gap-3 h-14 bg-amber-400 text-slate-950 rounded-full text-[12px] font-semibold hover:bg-amber-300 active:scale-[0.98] transition-all">
              <PhoneCall size={16} /> {t('consultEng')}
            </button>
          </div>

          <button 
            onClick={() => handleAction('proposal')} 
            disabled={generatingPdf}
            className="flex items-center justify-center gap-3 w-full h-16 rounded-[1.5rem] bg-orange-600 text-white font-black uppercase tracking-[0.15em] text-sm hover:bg-orange-500 shadow-2xl shadow-orange-600/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait"
          >
            {generatingPdf ? (
              <div className="flex items-center gap-3">
                <Loader2 size={24} className="animate-spin" />
                <span>{t('analyzing')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Award size={22} />
                <span>{t('openProposal')}</span>
              </div>
            )}
          </button>

          <button onClick={onNewCalc} className="w-full h-12 text-slate-400 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-bold text-[12px] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <RefreshCw size={14} /> {t('recalc')}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: SUGGESTION CHIP ---
interface SuggestionChipProps { icon: React.ReactNode; text: string; onClick: () => void }
function SuggestionChip({ icon, text, onClick }: SuggestionChipProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-full shadow-sm hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-600 dark:hover:text-orange-400 active:scale-[0.98] transition-all touch-manipulation text-slate-600 dark:text-slate-300 whitespace-nowrap animate-in fade-in zoom-in-95">
      <span aria-hidden="true">{icon}</span> <span className="text-xs font-semibold">{text}</span>
    </button>
  );
}

// --- SUB-COMPONENT: QUICK CARD ---
// Tailwind collects class names from source text, so `bg-${color}-600` never reaches the
// stylesheet. Measured on the served sheet: the hover fill existed for orange only — because it
// is spelled out literally somewhere else — and cards 2-4 (blue, amber, slate) kept their idle
// grey under the cursor. Every tone here is written whole.
const CARD_TONE: Record<string, string> = {
  orange: 'text-orange-500 group-hover:bg-orange-600',
  blue: 'text-blue-500 group-hover:bg-blue-600',
  amber: 'text-amber-500 group-hover:bg-amber-600',
  slate: 'text-slate-500 group-hover:bg-slate-600',
};
const toneFor = (color: string) => CARD_TONE[color] ?? CARD_TONE.slate;

interface QuickCardProps { icon: React.ReactNode; title: string; desc: string; onClick: () => void; color?: string; compact?: boolean }
function QuickCard({ icon, title, desc, onClick, color = 'orange', compact = false }: QuickCardProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 active:scale-[0.98] transition-all duration-200 group text-left text-slate-900 dark:text-white"
      >
        <div className={`w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center ${toneFor(color)} group-hover:text-white transition-all duration-300 shrink-0`} aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="block font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">{title}</span>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{desc}</p>
        </div>
        <ChevronRight className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" size={16} />
      </button>
    );
  }
  return (
    <button 
      onClick={onClick} 
      className={`relative w-full aspect-square md:aspect-auto md:h-24 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-5 shadow-sm hover:shadow-xl active:scale-[0.96] transition-all duration-200 group text-center md:text-left text-slate-900 dark:text-white overflow-hidden`}
    >
      <div className={`w-12 h-12 md:w-14 md:h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center ${toneFor(color)} group-hover:text-white transition-all duration-300 shadow-inner`} aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        <span className="font-bold text-[13px] md:text-base text-slate-900 dark:text-white leading-tight truncate">{title}</span>
        <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
      </div>
      <div className="absolute bottom-2 right-2 md:relative md:bottom-auto md:right-auto opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={16} />
      </div>
    </button>
  );
}

// --- SUB-COMPONENT: STARTER MENU ---
function StarterMenu({ onAction, compact = false }: { onAction: (type: string) => void; compact?: boolean }) {
  const t = useTranslations('chat');
  return (
    <div className={`w-full mx-auto ${compact ? 'space-y-3 max-w-none' : 'space-y-4 w-full max-w-4xl'}`}>
      <div className="text-center space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{t('welcomeTag')}</p>
        <h2 className={`font-black text-slate-900 dark:text-white tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>{t('welcomeTitle')}</h2>
      </div>

      <div className={compact ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 gap-2 md:gap-3'}>
        {[
          { id: 'wizard', icon: <Calculator size={20}/>, title: t('wizTitle'), desc: t('wizDesc'), color: 'orange' },
          { id: 'catalog', icon: <Package size={20}/>, title: t('catTitle'), desc: t('catDesc'), color: 'blue' },
          { id: 'process', icon: <Truck size={20}/>, title: t('procTitle'), desc: t('procDesc'), color: 'amber' },
          { id: 'faq', icon: <Info size={20}/>, title: t('faqTitle'), desc: t('faqDesc'), color: 'slate' }
        ].map((item, i) => (
          <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${(i + 1) * 100 + 200}ms` }}>
            <QuickCard 
              icon={item.icon} 
              title={item.title} 
              desc={item.desc} 
              onClick={() => onAction(item.id)} 
              color={item.color}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: JOURNEY WIZARD V9 ---
function JourneyWizardV9({ onComplete, onClose }: { onComplete: (res: SolarCalculationResult & { location?: string; equipmentTier?: string; inputMode?: string; inputValue?: number }) => void, onClose?: () => void }) {
  const [wizardStep, setWizardStep] = useState(1);
  const [inputMode, setInputMode] = useState('bill' as 'bill' | 'area' | 'kw' | 'panels');
  const [data, setData] = useState<SolarCalculationInput>({ mode: 'bill', value: 0, roofOrientation: 'South', equipmentTier: 'Premium', location: 'ในเมือง' });
  const [error, setError] = useState('');

  const handleNextStep = () => {
    if (wizardStep === 2 && data.value <= 0) {
      setError('กรุณาป้อนค่าที่ถูกต้อง (มากกว่า 0) ครับ');
      return;
    }
    setError('');
    setWizardStep(wizardStep + 1);
  };

  const handleComplete = () => {
    setError('');
    const result = calculateSolarSystemV8({ ...data, mode: inputMode });
    onComplete({ ...result, location: data.location || 'ในเมือง', equipmentTier: data.equipmentTier, inputMode, inputValue: data.value });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-2xl p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-slate-900 dark:text-white relative my-4">
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full flex items-center justify-center transition-all active:scale-90">
        <X size={20} />
      </button>

      <ProgressDots current={wizardStep} />
      
      {wizardStep === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="text-center">
            <h3 className={STEP_TITLE}>ประเภทอาคาร?</h3>
            <p className={STEP_SUBTITLE}>เลือกเพื่อรับคำแนะนำที่แม่นยำ</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {id:'home', icon:<Home size={24}/>, label:'บ้าน'}, 
              {id:'villa', icon:<Building2 size={24}/>, label:'วิลล่า'}, 
              {id:'biz', icon:<Factory size={24}/>, label:'ธุรกิจ'}
            ].map(item => (
              <button key={item.id} onClick={handleNextStep} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-transparent hover:border-orange-200 dark:hover:border-orange-500 active:scale-[0.98] transition-all group">
                <div className="text-slate-400 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.icon}</div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {wizardStep === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h3 className={STEP_TITLE}>{inputMode === 'bill' ? 'ค่าไฟเฉลี่ย' : 'พื้นที่หลังคา'}</h3>
            <p className={STEP_SUBTITLE}>ระบุตัวเลข</p>
          </div>
          <input type="number" value={data.value || ''} onChange={(e) => setData({...data, value: Number(e.target.value)})} className="w-full h-14 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 text-center text-2xl font-black text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 focus:border-orange-500 outline-none" placeholder="0" />
          {error && <p className="text-red-500 text-[10px] font-semibold text-center animate-in fade-in">{error}</p>}
          <button onClick={handleNextStep} className={PRIMARY_BTN}>ถัดไป</button>
        </div>
      )}

      {wizardStep === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h3 className={STEP_TITLE}>รายละเอียด</h3>
            <p className={STEP_SUBTITLE}>ปรับแต่งความต้องการ</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['South', 'West', 'East', 'North'] as const).map(d => (
              <button key={d} onClick={() => setData({...data, roofOrientation: d})} className={`${SELECT_BTN} ${data.roofOrientation === d ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 shadow-sm' : 'border-slate-50 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:border-slate-100 dark:hover:border-slate-600'}`}>
                {d === 'South' ? 'South (ทิศใต้)' : d}
              </button>
            ))}
          </div>
          <button onClick={handleNextStep} className={PRIMARY_BTN}>ถัดไป</button>
        </div>
      )}

      {wizardStep === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h3 className={STEP_TITLE}>พื้นที่ติดตั้ง</h3>
            <p className={STEP_SUBTITLE}>ระบุพื้นที่ในกระบี่</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['อ่าวนาง', 'ในเมือง', 'คลองม่วง', 'อื่นๆ'] as const).map(loc => (
              <button key={loc} onClick={() => setData({...data, location: loc})} className={`${SELECT_BTN} ${data.location === loc ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 shadow-sm' : 'border-slate-50 dark:border-slate-700 text-slate-300 dark:text-slate-400 hover:border-slate-100 dark:hover:border-slate-600'}`}>
                {loc}
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-[10px] font-semibold text-center animate-in fade-in">{error}</p>}
          <button onClick={handleComplete} className={PRIMARY_BTN}>ดูผลลัพธ์</button>
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function SolarChat({ 
  onClose, 
  initialSegment: propSegment,
  initialAction,
  initialMessage 
}: { 
  onClose?: () => void, 
  initialSegment?: 'home' | 'business' | null,
  initialAction?: 'voice' | null,
  initialMessage?: string | null
}) {
  useViewportVars();
  useLineBrowser();
  const t = useTranslations('chat');
  const locale = useLocale();
  const speechLang = locale === 'th' ? 'th-TH' : locale === 'ru' ? 'ru-RU' : locale === 'zh-CN' ? 'zh-CN' : 'en-US';

  const [journey, setJourney] = useState<'welcome' | 'wizard' | 'result'>('welcome');
  const [calcResult, setCalcResult] = useState<SolarCalculationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    phone: '',
  });
  const [leadFormStatus, setLeadFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [userName, setUserName] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const name = sessionStorage.getItem('liff_display_name');
    if (name) setUserName(name);
  }, []);

  const stableInitialMessages = useMemo(() => {
    if (propSegment === 'home') {
      return [{ id: 'v9-start-home', role: 'assistant' as const, content: t('greetHome') }];
    } else if (propSegment === 'business') {
      return [{ id: 'v9-start-biz', role: 'assistant' as const, content: t('greetBiz') }];
    }
    return [{ id: 'v9-start', role: 'assistant' as const, content: t('greetDefault') }];
  }, [propSegment, t]);

  const [lastError, setLastError] = useState<string | null>(null);
  const firstMsgSentRef = useRef(false);
  const leadFormTriggerRef = useRef<string | null>(null);

  // Sticky conversation language: UI locale wins, switches only on strong
  // user signal (so Latin names/addresses never flip a Thai dialog).
  const uiLang: ChatLang = normalizeLocale(locale) || 'th';
  const chatLocaleRef = useRef<ChatLang>(uiLang);
  useEffect(() => {
    chatLocaleRef.current = normalizeLocale(locale) || 'th';
  }, [locale]);

  const { messages, append, isLoading, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    initialMessages: stableInitialMessages,
    id: 'solar-chat-main',
    experimental_prepareRequestBody: ({ messages: reqMessages }) => {
      const lastUser = [...reqMessages].reverse().find((m) => m.role === 'user');
      const text = typeof lastUser?.content === 'string' ? lastUser.content : '';
      const detected = detectMessageLocale(text, chatLocaleRef.current);
      if (isStrongSwitch(text, detected, chatLocaleRef.current)) {
        chatLocaleRef.current = detected;
      }
      return { messages: reqMessages, locale: chatLocaleRef.current, uiLocale: uiLang } as unknown as JSONValue;
    },
    onFinish: (message) => {
      setTimeout(() => {
        try {
          const saved = localStorage.getItem('tawan_chat_history');
          const history = saved ? JSON.parse(saved) : [];
          const updatedHistory = [...history, message].slice(-20);
          localStorage.setItem('tawan_chat_history', JSON.stringify(updatedHistory));
        } catch (e) { console.warn('Failed to save chat history', e); }
      }, 100);
    },
    onError: (error: Error) => {
      console.error('[CHAT] Error:', error);
      setLastError(t('errGeneric'));
      setTimeout(() => setLastError(null), 5000);
    }
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('tawan_chat_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          firstMsgSentRef.current = true;
        }
      } catch (e) { console.warn('Failed to load chat history', e); }
    }
  }, [setMessages]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      const saved = localStorage.getItem('tawan_chat_history');
      const history = saved ? JSON.parse(saved) : [];
      if (history.length === 0 || history[history.length - 1].content !== lastMsg.content) {
        localStorage.setItem('tawan_chat_history', JSON.stringify([...history, lastMsg].slice(-20)));
      }
    }
  }, [messages]);

  useEffect(() => {
    if (userName && messages.length === 1 && messages[0].role === 'assistant') {
      const currentContent = messages[0].content;
      if (!currentContent.includes(userName)) {
        let newContent = currentContent;
        const openersA = [t('openerA'), 'สวัสดีครับ!'];
        const openersB = [t('openerB'), 'ยินดีต้อนรับครับ!'];
        if (openersA.some((o) => currentContent.includes(o))) {
          newContent = currentContent.replace(openersA.find((o) => currentContent.includes(o)) as string, t('helloName', { name: userName }));
        } else if (openersB.some((o) => currentContent.includes(o))) {
          newContent = currentContent.replace(openersB.find((o) => currentContent.includes(o)) as string, t('welcomeName', { name: userName }));
        }
        if (newContent !== currentContent) {
          setMessages([{ ...messages[0], content: newContent }]);
        }
      }
    }
  }, [userName, messages.length, setMessages, t]);

  const initialActionHandledRef = useRef(false);
  useEffect(() => {
    if (initialAction === 'voice' && !initialActionHandledRef.current) {
      initialActionHandledRef.current = true;
      setTimeout(() => {
        const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionCtor) {
          append({ role: 'assistant', content: t('voiceUnsupported') });
          return;
        }
        append({ role: 'assistant', content: t('listening') });
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = speechLang;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          append({ role: 'user', content: transcript });
        };
        recognition.onerror = () => {
          setIsListening(false);
          append({ role: 'assistant', content: t('voiceNoHear') });
        };
        recognition.start();
      }, 600);
    }
  }, [initialAction, append, t, speechLang]);

  const handleQuickAction = (text: string) => {
    if (text === 'wizard') setJourney('wizard');
    else if (text === 'catalog') {
      append({ role: 'user', content: t('quickCatalog') });
    }
    else if (text === 'process') {
      append({ role: 'user', content: t('quickSteps') });
    }
    else append({ role: 'user', content: text });
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: isLoading ? 'auto' : 'smooth' });
    }
  }, [isLoading]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    if (!autoScroll) return;
    const timeoutId = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timeoutId);
  }, [messages, journey, autoScroll, scrollToBottom]);

  const toggleListening = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return toast.error(t('voiceErr'));
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = speechLang;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      handleInputChange({ target: { value: input + ' ' + event.results[0][0].transcript } } as any);
    };
    recognition.start();
  };

  const handleGeneratePdf = async (result: SolarCalculationResult & { inputMode?: string; inputValue?: number; location?: string; equipmentTier?: string }) => {
    try {
      setGeneratingPdf(true);
      const billAmount = result?.inputMode === 'bill' ? result?.inputValue : 0;
      
      let lineUid = '';
      try {
        const liff = (window as any).liff;
        if (liff?.isLoggedIn()) {
          const profile = await liff.getProfile();
          lineUid = profile.userId;
        }
      } catch (e) { console.warn('LIFF UID fetch failed', e); }

      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName || t('newCustomer'),
          phone: '',
          line_id: lineUid,
          bill_amount: billAmount,
          system_size: result?.recommendedSystemKw || 0,
          payback_years: result?.paybackPeriodYears || 0,
          location: result?.location || 'Unknown',
          equipment_tier: result?.equipmentTier || 'Premium',
          status: 'Interested',
          chat_history: messages,
          source: 'chat'
        }),
      });
      const { success, lead, error } = await response.json();

      if (!success || !lead) throw new Error(error || 'Failed to save lead');

      const hashId = encodeId(lead.id);
      const proposalUrl = `${window.location.origin}/proposal/${hashId}${lineUid ? `?uid=${lineUid}` : ''}`;

      const liff = (window as any).liff;
      if (liff?.isInClient()) {
        liff.openWindow({ url: proposalUrl, external: false });
      } else {
        window.location.href = proposalUrl;
      }
      return;
    } catch (e) {
      console.error('[PDF] Generation error:', e);
      toast.error(t('quoteFail'));
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="app-shell font-sans text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 h-full overflow-hidden flex flex-col text-left border-x border-t border-transparent dark:border-slate-800 rounded-t-[3rem]">
      <div className="chat-header px-5 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-50 pt-safe shrink-0 shadow-sm dark:shadow-none" style={{ paddingTop: 'calc(15px + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-bold text-orange-600 dark:text-orange-400 leading-none">{brand.nameTh}</h1>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">{t('aiFooter')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
             <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Online</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 active:scale-90 transition-all"><X size={20} /></button>
          )}
        </div>
        {lastError && (
          <div className="fixed top-16 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-lg">{lastError}</div>
          </div>
        )}
      </div>

      <main ref={messagesContainerRef} onScroll={handleMessagesScroll} className="messages-container px-4 pt-6 pb-32 space-y-6 bg-slate-50/50 dark:bg-slate-950/40 flex-1 overflow-y-auto">
          {(messages as ChatMessage[]).map((m) => {
            const displayAnnotation = m.annotations?.find((a) => a.display === 'calculationResult');
            if (displayAnnotation) {
              return (
                <div key={m.id} className="w-full">
                  <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                      <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center"><Sparkles size={10} className="text-orange-600" /></div>
                      <span className="text-xs font-bold text-slate-400 ">AI</span>
                    </div>
                    <div className="max-w-[85%] px-4 py-3 text-sm leading-relaxed bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 rounded-2xl rounded-bl-md border border-slate-200 dark:border-slate-700 shadow-sm">{m.content}</div>
                  </div>
                  <ResultDashboard result={displayAnnotation.data} generatingPdf={generatingPdf} onAction={(type) => {
                    if (type === 'proposal') { handleGeneratePdf(displayAnnotation.data); }
                    else if (type === 'survey') { append({ role: 'user', content: t('surveyMsg') }); }
                    else if (type === 'save') { toast.info(t('savedToast')); }
                    else if (type === 'consult') { append({ role: 'user', content: t('consultMsg') }); }
                  }} onNewCalc={() => setJourney('wizard')} />
                </div>
              );
            }

            const showLoading = m.role === 'assistant' && !m.content && isLoading;
            return (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both`}>
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center"><Sparkles size={10} className="text-orange-600" /></div>
                    <span className="text-xs font-bold text-slate-400 ">AI</span>
                  </div>
                )}
                {showLoading ? <TypingIndicator /> : (
                  <div className={`w-full ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    {m.role === 'user' ? 
                      <div className="max-w-[85%] px-4 py-3 bg-orange-600 text-white rounded-2xl rounded-br-md shadow-md">
                         <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.content.replace(/\n/g, '<br/>')) }} />
                      </div>
                     : 
                     <div className="w-full">{renderContent(m.content, append)}</div>
                    }
                  </div>
                )}
              </div>
            );
          })}
          {journey === 'welcome' && messages.length === 1 && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <StarterMenu onAction={handleQuickAction} compact={onClose !== undefined} />
            </div>
          )}
          {journey === 'wizard' && (
            <SolarWebCalculator onComplete={(res) => {
              append({ role: 'assistant', content: t('assessedMsg'), annotations: [{ display: 'calculationResult', data: res }] as unknown as JSONValue[] });
              setJourney('welcome');
            }} onClose={() => setJourney('welcome')} />
          )}
      </main>

      <div className="composer-container bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe shrink-0">
         <div className="w-full max-w-lg mx-auto px-4 py-3 space-y-3">
           <div className="flex flex-col gap-2">
              <div className="flex justify-center"><LineLoginButton /></div>
              {/* A full-width rounded-xl bar with centred text sat directly above the rounded-xl
                  field and read as a second, empty input. Pills are actions here, boxes are the
                  field — the silhouettes no longer compete. */}
              <button onClick={() => handleQuickAction(t('quickConsult'))} className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 px-4 py-2.5 text-[10px] font-bold hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-300 active:scale-95 transition-all uppercase tracking-wider">{t('quickConsultLabel')}<ArrowRight size={14} aria-hidden="true" /></button>
           </div>
           <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
             <div className="flex-1">
               <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 min-h-[52px] shadow-sm focus-within:shadow-md focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200">
                                   <textarea id="chat-input" value={input} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} rows={1} placeholder={t('inputPh')} className="flex-1 py-3 bg-transparent border-none text-sm font-medium outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-400 text-slate-900 dark:text-white no-scrollbar max-h-32" style={{ height: '44px' }} />
                 <div className="flex items-center gap-1.5">
                  <button type="button" onClick={toggleListening} className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{isListening ? <MicOff size={20} /> : <Mic size={20} />}</button>
                  <button type="submit" disabled={isLoading || !input?.trim()} className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-500 hover:shadow-md group"><Send size={18} color="white" fill="white" className="group-active:translate-x-0.5 transition-transform" /></button>
                </div>
              </div>
            </div>
          </form>
          <div className="text-center pb-1"><p className="text-[10px] font-semibold text-slate-400 dark:text-slate-400">{t('aiFooter')}</p></div>
        </div>
      </div>
    </div>
  );
}
