'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, ChevronLeft, ChevronRight, Boxes, TrendingUp, ShieldCheck, Wallet, Zap, Info, Calculator, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

export function ProductDetail({ product, onClose, onChatClick }: { product: any, onClose: () => void, onChatClick: (msg: string) => void }) {
  const t = useTranslations('products');
  const locale = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [installmentPeriod, setInstallmentPeriod] = useState(36);
  const [showSavingsInfo, setShowSavingsInfo] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Robust media handling
  const media = Array.isArray(product.gallery) && product.gallery.length > 0 
    ? product.gallery 
    : [product.image_url || '/assets/placeholder-solar.svg'];

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % media.length);
  };
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  
  const totalInvestment = priceThb;
  const downpayment = totalInvestment * 0.1;
  const loanAmount = totalInvestment - downpayment;
  const monthlyInstallment = loanAmount / installmentPeriod; 
  const monthlySavings = powerKw * 135 * 4.7; 
  const netProfit = monthlySavings - monthlyInstallment;
  
  const formattedPrice = isMounted ? (priceThb > 0 ? `฿${priceThb.toLocaleString(locale)}` : t('priceAsk')) : '...';
  const isSystem = product.type === 'system' || product.type === 'package';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 50, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg max-h-[85vh] overflow-y-auto relative shadow-2xl no-scrollbar border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full z-[510] transition-all active:scale-90 shadow-sm border border-slate-100 dark:border-slate-700">
          <X size={18} />
        </button>

        {/* Gallery Section */}
        <div className="h-48 md:h-56 bg-slate-50 dark:bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
           {media[activeIndex]?.endsWith('.mp4') ? (
             <video src={media[activeIndex]} controls className="w-full h-full object-contain" />
           ) : (
              <div className="relative w-full h-full p-4">
               <Image 
                 src={media[activeIndex]} 
                 alt={product.name} 
                 fill
                 className="object-contain transition-transform duration-700"
                 sizes="(max-width: 768px) 100vw, 672px"
               />
             </div>
           )}
           
           {media.length > 1 && (
             <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
               <button onClick={prev} className="pointer-events-auto p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-full hover:bg-white dark:hover:bg-slate-700 shadow-md transition-all text-slate-600 dark:text-slate-300"><ChevronLeft size={24}/></button>
               <button onClick={next} className="pointer-events-auto p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-full hover:bg-white dark:hover:bg-slate-700 shadow-md transition-all text-slate-600 dark:text-slate-300"><ChevronRight size={24}/></button>
             </div>
           )}

           {media.length > 1 && (
             <div className="absolute bottom-6 flex gap-1.5 justify-center w-full">
                {media.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-orange-500' : 'w-1.5 bg-slate-200 dark:bg-slate-800'}`} />
                ))}
             </div>
           )}
        </div>

        <div className="p-5 md:p-7 space-y-6">
          {/* Header Info */}
          <div className="space-y-4 text-left">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-600 text-white border-none px-3 py-1 font-bold uppercase tracking-wider text-[9px] rounded-full shadow-sm">{product.brand}</Badge>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none uppercase tracking-wider text-[9px] px-3 py-1 font-bold rounded-full">{product.type}</Badge>
              {powerKw > 0 && <Badge className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50 px-3 py-1 font-bold rounded-full text-[9px] tracking-wider">{t('sysKw', { kw: powerKw })}</Badge>}
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
               <div>
                 <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">{product.name}</h2>
                 <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-orange-500" />
                     {t('premiumSolution')}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1">{t('totalVat')}</span>
                  <div className="text-2xl md:text-3xl font-black text-orange-600 dark:text-orange-400 tabular-nums leading-none">
                     {formattedPrice}
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
               <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3 flex items-center gap-2">
                   <Boxes size={12} />
                   {t('descTitle')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-sm">
                   {product.description || t('defaultDesc')}
               </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          {isSystem && priceThb > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <TrendingUp size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('finance')}</h3>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400 px-2 py-0.5">{t('investPlan')}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl text-white relative overflow-hidden group shadow-lg border border-slate-800 text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-600/20 transition-all duration-500" />
                  <div className="relative z-10 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 block mb-2">{t('sysTotal')}</span>
                    <div className="flex items-baseline gap-2">
                       <div className="text-3xl font-black tabular-nums">฿{isMounted ? priceThb.toLocaleString(locale) : '...'}</div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight pt-2">{t('includesInstall')}</p>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-800/30 flex flex-col justify-between group relative text-left">
                  <button onClick={() => setShowSavingsInfo(!showSavingsInfo)} className="absolute top-4 right-4 text-orange-300 hover:text-orange-600 dark:text-orange-800 dark:hover:text-orange-500 transition-colors"><Info size={16} /></button>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-widest block mb-2">{t('estSave')}</span>
                    <div className="text-3xl font-black text-orange-600 dark:text-orange-400 tabular-nums italic">฿{isMounted ? Math.round(monthlySavings).toLocaleString(locale) : '...'}</div>
                  </div>
                  {showSavingsInfo && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-orange-100 dark:border-orange-700 text-[10px] text-orange-700 dark:text-orange-300 font-bold animate-in fade-in slide-in-from-top-1">
                      {t('savingsFormula')}
                    </div>
                  )}
                </div>
              </div>

              {/* Installment Plan Section - Dynamic 12-60 */}
              <div className="bg-slate-50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-5">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block">แผนการผ่อนชำระรายเดือน</span>
                       <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums flex items-baseline gap-2">
                          ฿{isMounted ? Math.round(monthlyInstallment).toLocaleString(locale) : '...'}
                          <span className="text-xs font-bold text-slate-400">{t('perMonth')}</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-white/80 shadow-sm shrink-0">
                       <Clock size={18} className="text-orange-600 ml-1 hidden md:block" />
                       <div className="flex gap-0.5">
                          {[12, 36, 60].map((period) => (
                            <button
                              key={period}
                              onClick={() => setInstallmentPeriod(period)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${installmentPeriod === period ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              {period}{t('periodShort')}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="pt-2">
                    <input type="range" min="12" max="60" step="12" value={installmentPeriod} onChange={(e) => setInstallmentPeriod(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-600" />
                    <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                       <span>12 {t('monthLong')}</span>
                       <span>36 {t('monthLong')}</span>
                       <span>60 {t('monthLong')}</span>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-left">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('avgSave')}</p>
                          <p className="text-lg font-black text-orange-600">~฿{isMounted ? Math.round(monthlySavings).toLocaleString(locale) : '...'}{t('perMonth')}</p>
                       </div>
                       <div className="text-right space-y-1 relative group/tooltip">
                          <div className="flex items-center justify-end gap-1.5">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('monthlyDiff')}</p>
                             <Info size={10} className="text-slate-300" />
                          </div>
                          <p className={`text-lg font-black ${netProfit > 0 ? 'text-orange-500 animate-pulse' : 'text-amber-500'}`}>
                             {isMounted ? (netProfit > 0 ? t('cashPositive') : `฿${Math.abs(Math.round(netProfit)).toLocaleString(locale)}`) : '...'}
                          </p>
                          
                          {/* Financial Tooltip */}
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-[9px] text-slate-300 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 border border-white/10 shadow-2xl">
                             {netProfit > 0 
                               ? t('positiveFlow') 
                               : t('negativeFlow')}
                          </div>
                       </div>
                    </div>
                    {isMounted && netProfit > 0 && (
                      <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-center">
                          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-relaxed">
                             {t('profitNow')}
                          </p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* Specs & Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
             {product.specifications && Object.keys(product.specifications).length > 0 && (
               <div className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white px-1 flex items-center gap-2">
                    <Calculator size={14} className="text-slate-400" />
                    {t('techSpecs')}
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(product.specifications).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800/50 px-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-tight">{key.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{String(val)}</span>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             {product.system_components && Array.isArray(product.system_components) && (
               <div className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white px-1 flex items-center gap-2">
                    <Boxes size={14} className="text-slate-400" />
                    {t('kitIncludes')}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {product.system_components.map((comp: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-center justify-between group hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate pr-2">{comp.item}</span>
                        {comp.qty && <Badge variant="secondary" className="bg-white dark:bg-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-400 shrink-0 border-slate-100 dark:border-slate-800">x{comp.qty}</Badge>}
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>

          {/* Action Footer */}
          <div className="pt-6 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <button 
                 className="h-12 bg-orange-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-orange-500 active:scale-[0.98] transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 text-[10px]"
                 onClick={() => { onChatClick(t('quoteFor', { name: product.name })); onClose(); }}
               >
                 {t('getQuote')} <ArrowRight size={20} />
               </button>
               <button 
                 className="h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-full hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[10px]"
                 onClick={() => { onChatClick(t('askBrand', { productBrand: product.brand, model: product.model || product.name })); onClose(); }}
               >
                 {t('consultExpert')}
               </button>
            </div>
            
            <div className="flex flex-col items-center gap-2 py-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
               <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('installedBy')}</span>
               </div>
               <div className="flex items-center gap-4">
                  <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.2em]">
                    📍 {t('serviceArea')}
                  </p>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.2em]">
                    ☀️ {t('warranty25')}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

