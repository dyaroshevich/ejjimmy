'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Building2, Factory, 
  Zap, ChevronRight, ArrowLeft, 
  MapPin, Check, Sparkles, Loader2,
  Mountain, Trees, Landmark
} from 'lucide-react';
import { calculateSolarSystemV8, SolarCalculationResult } from '@/lib/solarCalculator';
import { useTranslations } from 'next-intl';
import { brand } from '@/lib/site.config';

interface Props {
  onComplete: (res: SolarCalculationResult & { 
    location?: string; 
    equipmentTier?: string; 
    inputMode?: string; 
    inputValue?: number;
    buildingType?: string;
    roofType?: string;
  }) => void;
  onClose?: () => void;
}

export default function SolarWebCalculator({ onComplete, onClose }: Props) {
  const t = useTranslations('calc');
  const STEPS = [
    { id: 'building', title: t('stepBuilding'), subtitle: t('stepBuildingSub') },
    { id: 'bill', title: t('stepBill'), subtitle: t('stepBillSub') },
    { id: 'roof', title: t('stepRoof'), subtitle: t('stepRoofSub') },
    { id: 'location', title: t('stepLoc'), subtitle: t('stepLocSub') }
  ];

  const BILL_RANGES = [
    { label: '2,000 - 4,000 ฿', value: 3000, key: '2-4k', icon: '🥉' },
    { label: '4,000 - 6,000 ฿', value: 5000, key: '4-6k', icon: '🥈' },
    { label: '6,000 - 8,000 ฿', value: 7000, key: '6-8k', icon: '🥇' },
    { label: '8,000 - 10,000 ฿', value: 9000, key: '8-10k', icon: '💎' },
    { label: '10,000 - 15,000 ฿', value: 12500, key: '10-15k', icon: '🏢' },
    { label: '15,000 - 20,000 ฿', value: 17500, key: '15-20k', icon: '🏢' },
    { label: '20,000 - 30,000 ฿', value: 25000, key: '20-30k', icon: '🏭' },
    { label: '30,000 - 40,000 ฿', value: 35000, key: '30-40k', icon: '🏭' },
    { label: '40,000 - 50,000 ฿', value: 45000, key: '40-50k', icon: '⚡' },
    { label: t('moreThan'), value: 75000, key: '50k+', icon: '🚀' }
  ];

  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    buildingType: '',
    billRange: '',
    billValue: 0,
    roofType: '',
    location: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentStepInfo = STEPS[step];

  const handleSelect = (field: string, value: any, extra?: any) => {
    const newSelections = { ...selections, [field]: value };
    if (extra) Object.assign(newSelections, extra);
    setSelections(newSelections);
    
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finishAction(newSelections);
    }
  };

  const finishAction = (finalSelections: typeof selections) => {
    setIsAnalyzing(true);
    // Mimic "AI processing" for premium feel
    setTimeout(() => {
      const result = calculateSolarSystemV8({
        mode: 'bill',
        value: finalSelections.billValue,
        roofOrientation: 'South',
        equipmentTier: 'Premium'
      });
      
      onComplete({
        ...result,
        location: finalSelections.location,
        buildingType: finalSelections.buildingType,
        roofType: finalSelections.roofType,
        inputMode: 'bill',
        inputValue: finalSelections.billValue,
        equipmentTier: 'Premium'
      });
    }, 1500);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  if (isAnalyzing) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 w-8 h-8" />
        </div>
        <h3 className="mt-8 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('analyzing')}</h3>
        <p className="mt-2 text-slate-400 font-medium text-sm">{t('analyzingSub')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative my-4 flex flex-col min-h-[500px]">
      
      {/* Header Area */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {step > 0 && (
            <button onClick={goBack} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all active:scale-90">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Step 0{step + 1} / 04</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{currentStepInfo.title}</h2>
          </div>
        </div>
        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600">
          <Zap size={20} fill="currentColor" />
        </div>
      </div>

      {/* Progress Summary (Like we did in LINE but better) */}
      <div className="px-8 flex flex-wrap gap-2">
        <AnimatePresence>
          {selections.buildingType && step > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center gap-1.5">
               <Check size={10} className="text-orange-500" strokeWidth={4} />
               <span className="text-[9px] font-bold text-slate-500 uppercase">{selections.buildingType}</span>
            </motion.div>
          )}
          {selections.billRange && step > 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center gap-1.5">
               <Check size={10} className="text-orange-500" strokeWidth={4} />
               <span className="text-[9px] font-bold text-slate-500 uppercase">{selections.billRange}</span>
            </motion.div>
          )}
          {selections.roofType && step > 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center gap-1.5">
               <Check size={10} className="text-orange-500" strokeWidth={4} />
               <span className="text-[9px] font-bold text-slate-500 uppercase">{selections.roofType}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="flex-1 px-8 py-6 relative overflow-hidden">
        <p className="text-sm font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-6">{currentStepInfo.subtitle}</p>
        
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={step}
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-full"
          >
            {/* STEP 1: BUILDING TYPE */}
            {step === 0 && (
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'residential', icon: <Home size={24} />, label: t('bldRes'), desc: t('bldResD') },
                  { id: 'commercial', icon: <Building2 size={24} />, label: t('bldCom'), desc: t('bldComD') },
                  { id: 'industrial', icon: <Factory size={24} />, label: t('bldInd'), desc: t('bldIndD') }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('buildingType', item.label)}
                    className="group relative w-full p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-orange-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-left shadow-sm hover:shadow-xl active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-all shadow-inner">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-black text-slate-900 dark:text-white leading-none">{item.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-200 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: BILL RANGE */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {BILL_RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => handleSelect('billRange', r.label, { billValue: r.value })}
                    className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-orange-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-lg active:scale-[0.98] text-center"
                  >
                    <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{r.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3: ROOF TYPE */}
            {step === 2 && (
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'concrete', label: t('roofConcrete'), desc: t('roofConcreteD') },
                  { id: 'metal', label: t('roofMetal'), desc: t('roofMetalD') },
                  { id: 'ground', label: t('roofGround'), desc: t('roofGroundD') }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('roofType', item.label)}
                    className="group w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-orange-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all flex justify-between items-center shadow-sm active:scale-[0.98]"
                  >
                    <div className="text-left">
                      <p className="text-base font-black text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.desc}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-orange-500 group-hover:bg-orange-500 flex items-center justify-center transition-all">
                      <Check size={14} className="text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 4: LOCATION */}
            {step === 3 && (
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'krabi', icon: <Mountain size={20} />, label: t('locKrabi'), desc: t('locKrabiD') },
                  { id: 'phuket', icon: <Trees size={20} />, label: t('locPhuket'), desc: t('locPhuketD') },
                  { id: 'other', icon: <Landmark size={20} />, label: t('locOther'), desc: t('locOtherD') }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('location', item.label)}
                    className="group w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-orange-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-left shadow-sm active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-orange-500 shadow-sm transition-all">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-black text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                    </div>
                    <MapPin size={16} className="text-slate-200 group-hover:text-orange-500 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <div className="px-8 py-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
         <Sparkles size={12} className="text-orange-500" />
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Powered by {brand.name} AI</span>
      </div>
    </div>
  );
}
