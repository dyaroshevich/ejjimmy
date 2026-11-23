'use client';

import React, { useState, useEffect } from 'react';
import { Info, TrendingUp, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CaseFinancingCalculatorProps {
  totalInvestment: number;
  annualSavings: number;
  customerName: string;
}

export default function CaseFinancingCalculator({
  totalInvestment,
  annualSavings,
  customerName
}: CaseFinancingCalculatorProps) {
  const router = useRouter();
  const t = useTranslations('caseCalc');
  const [term, setTerm] = useState(36);
  const [isMounted, setIsMounted] = useState(false);
  const [prevTerm, setPrevTerm] = useState(36);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const downPayment = totalInvestment * 0.1;
  const loanAmount = totalInvestment - downPayment;
  const monthlyInstallment = loanAmount / term;
  const monthlySavings = annualSavings / 12;
  const netMonthlyBenefit = monthlySavings - monthlyInstallment;

  const handleTermChange = (newTerm: number) => {
    setPrevTerm(term);
    setTerm(newTerm);
  };

  const openChat = () => {
    sessionStorage.setItem('tawan_chat_intent', JSON.stringify({
      segment: 'home',
      action: null,
      message: t('shareMsg', { name: customerName }),
      timestamp: Date.now()
    }));
    router.push('/');
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={stagger}
      className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl space-y-8"
    >
      <motion.div variants={item} className="space-y-2">
        <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">{t('title')}</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('sub')}</p>
      </motion.div>

      <motion.div variants={item} className="bg-slate-50 dark:bg-slate-950/30 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 space-y-8">
        <div className="space-y-2 text-center">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block">{t('monthly')}</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={term}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tabular-nums flex items-baseline justify-center gap-2"
            >
              ฿{isMounted ? Math.round(monthlyInstallment).toLocaleString() : '...'}
              <span className="text-xs font-bold text-slate-400">{t('month')}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-2 px-2">
          <div className="relative h-4 flex items-center">
            <input
              type="range"
              min="12"
              max="60"
              step="12"
              value={term}
              onChange={(e) => handleTermChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-600 z-10 transition-all duration-200"
            />
            {/* Active track highlight */}
            <motion.div
              className="absolute h-2 bg-orange-600 rounded-full pointer-events-none z-0"
              initial={false}
              animate={{ width: `${((term - 12) / (60 - 12)) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="flex justify-between mt-4">
            {[12, 36, 60].map(m => (
              <motion.button
                key={m}
                onClick={() => handleTermChange(m)}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 group transition-all"
              >
                <motion.div
                  animate={{
                    scale: term === m ? 1.5 : 1,
                    backgroundColor: term === m ? '#ea580c' : '#cbd5e1',
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ boxShadow: term === m ? '0 0 10px rgba(255,138,0,0.5)' : 'none' }}
                />
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-all ${term === m ? 'text-orange-600 scale-110' : 'text-slate-400'}`}>
                  {t('term', { n: m })}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={item} className="space-y-1 text-center border-r border-slate-100 dark:border-white/5 pr-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('save')}</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`savings-${term}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-lg font-black text-orange-600"
                >
                  ~฿{isMounted ? Math.round(monthlySavings).toLocaleString() : '...'}
                </motion.p>
              </AnimatePresence>
            </motion.div>
            <motion.div variants={item} className="space-y-1 text-center pl-4 relative group/tooltip">
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('diff')}</p>
                <Info size={10} className="text-slate-300" />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`benefit-${term}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-lg font-black ${netMonthlyBenefit > 0 ? 'text-orange-500' : 'text-amber-500'}`}
                >
                  {isMounted ? (netMonthlyBenefit > 0 ? 'CASH+' : `฿${Math.abs(Math.round(netMonthlyBenefit)).toLocaleString()}`) : '...'}
                </motion.p>
              </AnimatePresence>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-[9px] text-slate-300 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 border border-white/10 shadow-2xl">
                {netMonthlyBenefit > 0
                  ? t('cashPos')
                  : t('cashDesc')}
              </div>
            </motion.div>
          </div>
          <AnimatePresence>
            {isMounted && netMonthlyBenefit > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20 text-center overflow-hidden"
              >
                <motion.p
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] leading-relaxed"
                >
                  {t('selfPay')}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={openChat}
            className="w-full h-16 rounded-full bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-500 shadow-xl shadow-orange-600/40 gap-3 border-none"
          >
            {isMounted ? t('cta') : t('calc')}
          </Button>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              variant="outline"
              className="w-full h-14 rounded-full border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/5 active:scale-95 transition-all"
            >
              <a href="/#contact">{t('interest')}</a>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => {
                const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank');
              }}
              className="w-full h-14 rounded-full border-2 border-slate-200 dark:border-white/10 text-orange-600 dark:text-orange-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-orange-50 dark:hover:bg-orange-900/20 active:scale-95 transition-all"
            >
              {t('share')}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
