import Image from 'next/image';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, ShieldCheck, TrendingUp, ArrowRight, Calculator } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductDetail } from './ProductDetail';
import { useLocale, useTranslations } from 'next-intl';
import { financing, monthlyInstalment } from '@/lib/domain.config';

interface Product {
  id: string;
  name: string;
  brand: string;
  type: string;
  power_kw: number;
  price_thb: number;
  description: string;
  image_url?: string;
  gallery?: string[];
  specifications?: any;
  system_components?: any[];
  included_services?: string[];
}

interface ProductCardProps {
  product: Product;
  onChatClick: (msg: string) => void;
  variant?: 'landing' | 'chat';
}

export const ProductCard = React.memo(function ProductCard({ product, onChatClick, variant = 'landing' }: ProductCardProps) {
  const t = useTranslations('products');
  const locale = useLocale();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
    setPortalEl(document.body);
  }, []);

  const displayImage = product.image_url || '/assets/placeholder-solar.svg';
  const isSystem = product.type === 'system';

  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;

  // Same split the landing card and the LINE quote use — this used to recompute the arithmetic, so a
  // change to the term would have left this card quoting the old one.
  const priceCalculations = useMemo(() => {
    const downpayment = priceThb * financing.downPayment;
    const monthlyInstallment = monthlyInstalment(priceThb) ?? 0;
    const monthlySavings = powerKw * 135 * 4.7;
    return { downpayment, monthlyInstallment, monthlySavings };
  }, [priceThb, powerKw]);

  const formattedPrice = isMounted ? (priceThb > 0 ? priceThb.toLocaleString(locale) : t('priceAsk')) : '...';
  const formattedDownpayment = isMounted ? (priceCalculations.downpayment > 0 ? priceCalculations.downpayment.toLocaleString(locale) : '...') : '...';
  const formattedInstallment = isMounted ? (priceCalculations.monthlyInstallment > 0 ? priceCalculations.monthlyInstallment.toLocaleString(locale) : '...') : '...';
  const formattedSavings = isMounted ? (priceCalculations.monthlySavings > 0 ? Math.round(priceCalculations.monthlySavings).toLocaleString(locale) : '...') : '...';

  // Subcategory Localization Mapping
  const subCategoryMap: Record<string, string> = useMemo(() => ({
    'system': t('typeSystem'),
    'package': t('typePackage'),
    'Panel': t('typePanel'),
    'Inverter': t('typeInverter'),
    'Battery': t('typeBattery'),
    'Charger': t('typeCharger'),
    'Mounting': t('typeMounting'),
    'Accessory': t('typeAccessory')
  }), [t]);

  const subCategory = subCategoryMap[product.type] || subCategoryMap[product.specifications?.sub_category] || product.specifications?.sub_category || product.type;
  const brandLogo = product.brand ? `/content/brands/${product.brand.toLowerCase()}.webp` : null;

  // Shared Button Classes for Cards
  const btnCardAction = "w-full h-11 rounded-full bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition-all border-none shadow-md shadow-orange-600/10 flex items-center justify-center gap-2";

  // --- 1. CHAT VARIANT ---
  if (variant === 'chat') {
    return (
      <>
        <motion.div 
          onClick={() => setIsDetailOpen(true)}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[240px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden cursor-pointer transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-md"
        >
          <div className="h-40 relative bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <Badge className="absolute top-2.5 left-2.5 bg-orange-600 text-white border-none text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-10 shadow-sm">
              {subCategory}
            </Badge>
            <div className="relative w-full h-full">
              <Image 
                src={displayImage} 
                alt={product.name} 
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-110"
                sizes="240px"
              />
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-3">
            <div className="space-y-0.5">
              <div className="flex justify-between items-start gap-2">
                 <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{product.brand}</span>
                 {powerKw > 0 && <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-400">{powerKw}kW</span>}
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1">{product.name}</h4>
            </div>
            <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
              {isSystem ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                     <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase leading-none">{t('fullPrice')}</span>
                     <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tabular-nums italic">~฿{formattedSavings}<small className="text-[7px] not-italic opacity-50">{t('perMonth')}</small></span>
                  </div>
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">฿{formattedPrice}</div>
                         <span className="text-[8px] font-bold text-slate-400 dark:text-slate-400 uppercase block leading-none mt-1">{t('installStart')} ฿{formattedInstallment}{t('perMonth')}</span>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                   <div>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-400 uppercase block mb-0.5">{t('price')}</span>
                      <div className="text-base font-bold text-orange-600 dark:text-orange-400 tabular-nums">฿{formattedPrice}</div>
                   </div>
                   <Zap size={12} className="text-orange-500 opacity-20" />
                </div>
              )}
            </div>
            <button className={btnCardAction}>
              {t('details')}
            </button>
          </div>
        </motion.div>

        {portalEl && createPortal(
          <AnimatePresence>
            {isDetailOpen && (
              <ProductDetail product={product} onClose={() => setIsDetailOpen(false)} onChatClick={onChatClick} />
            )}
          </AnimatePresence>,
          portalEl
        )}
      </>
    );
  }

  // --- 2. LANDING PAGE VARIANT ---
  return (
    <>
      <motion.div 
        onClick={() => setIsDetailOpen(true)}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden group hover:border-orange-500/20 transition-all duration-500 relative flex flex-col h-full cursor-pointer shadow-sm hover:shadow-xl dark:shadow-none"
      >
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
          <Badge className="bg-orange-600 text-white border-none text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {subCategory}
          </Badge>
          {brandLogo && (
            <div className="w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center border border-slate-50 dark:border-slate-700 shadow-sm">
               <div className="relative w-full h-full">
                <Image src={brandLogo} alt={product.brand} fill className="object-contain" />
               </div>
            </div>
          )}
        </div>

        <div className="h-52 relative flex items-center justify-center p-6 bg-slate-50/30 dark:bg-slate-950/30">
          <Image 
            src={displayImage} 
            alt={product.name} 
            fill
            className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="p-6 pt-2 flex flex-col flex-grow space-y-4 text-left">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">{product.name}</h4>
            <p className="text-xs text-slate-400 dark:text-slate-400 font-medium line-clamp-1">{product.description}</p>
          </div>

          {isSystem ? (
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-4">
                <div className="space-y-0.5">
                   <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">{t('fullPrice')}</span>
                   <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">฿{formattedPrice}</div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase mt-2 block">{t('installStart')} ฿{formattedInstallment}{t('perMonth')}</span>
                </div>
                <div className="text-right">
                   <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase block">{t('savePower')}</span>
                   <span className="text-lg font-bold text-orange-600 dark:text-orange-400 italic">~฿{formattedSavings}<small className="text-[9px] ml-0.5 not-italic opacity-60">{t('perMonth')}</small></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-50 dark:border-slate-800 group-hover:bg-orange-50/30 dark:group-hover:bg-orange-900/10 transition-colors">
                <div className="flex items-center gap-3">
                   <Calculator size={18} className="text-orange-600 dark:text-orange-400" />
                   <div className="space-y-0">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase block leading-none mb-1">{t('monthlyInst')}</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">฿{formattedInstallment}</span>
                   </div>
                </div>
                <Badge className="bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-50 dark:border-orange-900/50 text-[8px] font-bold px-2 py-0.5 uppercase">{t('roiPlan')}</Badge>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                 <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase block">{t('price')}</span>
                 <span className="text-xl font-bold text-orange-600 dark:text-orange-400 tabular-nums">฿{formattedPrice}</span>
              </div>
              <Zap size={18} className="text-orange-500 opacity-20" />
            </div>
          )}

          <div className="pt-2 mt-auto">
            <Button 
              onClick={(e) => { 
                e.stopPropagation(); 
                const msg = isSystem 
                  ? t('msgSystem', { name: product.name }) 
                  : t('msgOther', { name: product.name });
                onChatClick(msg); 
              }}
              className={btnCardAction}
            >
              {isSystem ? t('ctaSystem') : t('ctaOther')} <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {portalEl && createPortal(
        <AnimatePresence>
          {isDetailOpen && (
            <ProductDetail product={product} onClose={() => setIsDetailOpen(false)} onChatClick={onChatClick} />
          )}
        </AnimatePresence>,
        portalEl
      )}
    </>
  );
});
