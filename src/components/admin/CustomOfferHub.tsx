'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import {
  Package, Zap, Shield, Clock, RefreshCcw, ExternalLink,
  Share2, MessageSquare, Loader2, FileText, Sparkles, Copy, Info, X,
  History, Globe, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { encodeId } from '@/lib/hashid';

interface SolarProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  power_kw?: number;
  price_thb?: number;
  specifications?: Record<string, any>;
  included_services?: string[];
  type: string;
}

interface OfferTemplate {
  id: string;
  name: string;
  label: string;
  description?: string;
  equipment_tier?: string;
  manpower: number;
  discount_percent: number;
  installation_days: number;
  maintenance_visits: number;
  system_warranty?: string;
  inverter_warranty?: string;
  panel_product_warranty?: string;
  panel_performance_warranty?: string;
}

interface Props {
  lead: any;
  generatingPdf: boolean;
  onUpdateField: (field: string, value: any) => void;
  onUpdateFields: (updates: Record<string, any>) => void;
  onGenerate: (label?: string) => Promise<void>;
  hasPdf: boolean;
  proposalUrl: string | null;
  onCopyLink: () => void;
  onShareToLine: (mode: 'pdf' | 'page') => void;
}

const TIER_INFO: Record<string, { title: string, desc: string }> = {
  eco: { title: 'Eco Tier', desc: 'เน้นความคุ้มค่าสูงสุด คืนทุนไวที่สุด ใช้อุปกรณ์มาตรฐานอุตสาหกรรมที่เชื่อถือได้ (เช่น แผง Jinko/Longi, อินเวอร์เตอร์ Huawei/Solis)' },
  premium: { title: 'Premium Tier', desc: 'แผงประสิทธิภาพสูงพร้อมระบบ Micro-inverter (Hoymiles) หรือระบบ Optimizer เพื่อประสิทธิภาพสูงสุดในสภาวะแสงน้อยหรือมีเงาบัง' },
  ultra: { title: 'Ultra (VIP)', desc: 'เกรดอุปกรณ์ระดับ Top ของโลก (เช่น แผง AIKO/Maxeon, อินเวอร์เตอร์ Enphase) ประกันยาวนานที่สุด บริการหลังการขายระดับพิเศษ' },
  vip: { title: 'Ultra (VIP)', desc: 'เกรดอุปกรณ์ระดับ Top ของโลก (เช่น แผง AIKO/Maxeon, อินเวอร์เตอร์ Enphase) ประกันยาวนานที่สุด บริการหลังการขายระดับพิเศษ' },
  personal: { title: 'Personal', desc: 'ปรับแต่งตามความต้องการเฉพาะของลูกค้า หรือสเปกที่ลูกค้ากำหนดเองจากความพึงพอใจส่วนตัว' }
};

const COMPARISON_INFO = {
  title: 'เปรียบเทียบระดับอุปกรณ์',
  desc: '• Eco: คุ้มค่า คืนทุนไว\n• Premium: ประสิทธิภาพสูง รับมือเงาบังได้ดี\n• Ultra/VIP: ที่สุดของเทคโนโลยี ประกันยาวนานที่สุด'
};

const warrantyNum = (val: any): string => {
  if (val === null || val === undefined) return '';
  const n = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? '' : String(n);
};

export default function CustomOfferHub({
  lead,
  generatingPdf,
  onUpdateField,
  onUpdateFields,
  onGenerate,
  hasPdf,
  proposalUrl,
  onCopyLink,
  onShareToLine,
}: Props) {
  const [products, setProducts] = useState<SolarProduct[]>([]);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<SolarProduct | null>(null);
  const [shareMode, setShareMode] = useState<'pdf' | 'page'>('page');
  const [activeInfo, setActiveInfo] = useState<{ title: string, desc: string } | null>(null);
  const [proposalLabel, setProposalLabel] = useState('Official Proposal');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!lead?.id) return;
    setDownloadingPdf(true);
    try {
      const resp = await fetch(`/api/pdf/download?leadId=${lead.id}&mode=download`);
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Download failed');
      }
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const name = (lead.name || 'Proposal').replace(/\s+/g, '_');
      a.download = `TAWANPOWER_Proposal_${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('ไม่สามารถดาวน์โหลด PDF ได้');
    }
    setDownloadingPdf(false);
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prodRes, tmplRes] = await Promise.all([
          fetch('/api/solar-products?type=system'),
          fetch('/api/admin/offer-templates'),
        ]);
        const prodData = await prodRes.json();
        const tmplData = await tmplRes.json();
        const list = Array.isArray(prodData) ? prodData : prodData.data;
        if (!cancelled) {
          setProducts(Array.isArray(list) ? list : []);
          setTemplates(tmplData.templates || []);
        }
      } catch (err) {
        console.error('[OfferHub] Load error:', err);
      }
      if (!cancelled) setLoadingProducts(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (lead.selected_product_id && products.length > 0) {
      const found = products.find((p) => p.id === lead.selected_product_id);
      if (found) setSelectedProduct(found);
    }
  }, [lead.selected_product_id, products]);

  const basePrice = Number(lead.base_price) || 0;
  const manpower = Number(lead.manpower) || 0;
  const discountPct = Number(lead.discount_percent) || 0;
  const discountAmt = Math.round(basePrice * discountPct / 100);
  const total = basePrice + manpower - discountAmt;

  const discountWarning = discountPct > 50 ? 'danger' : discountPct > 30 ? 'warn' : null;

  function handleProductSelect(productId: string) {
    if (!productId) {
      onUpdateFields({ selected_product_id: null, base_price: 0, system_size: null });
      setSelectedProduct(null);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setSelectedProduct(product);
    const updates: Record<string, any> = {
      selected_product_id: product.id,
      base_price: product.price_thb ?? 0,
      system_size: product.power_kw ?? lead.system_size
    };
    const specs = product.specifications || {};
    if (specs.system_warranty) updates.system_warranty = specs.system_warranty;
    if (specs.inverter_warranty) updates.inverter_warranty = specs.inverter_warranty;
    if (specs.panel_product_warranty) updates.panel_product_warranty = specs.panel_product_warranty;
    if (specs.panel_performance_warranty) updates.panel_performance_warranty = specs.panel_performance_warranty;
    onUpdateFields(updates);
  }

  function handleTemplateSelect(tmpl: OfferTemplate) {
    const updates: Record<string, any> = {
      equipment_tier: tmpl.equipment_tier || lead.equipment_tier,
      manpower: tmpl.manpower,
      discount_percent: tmpl.discount_percent,
      installation_days: tmpl.installation_days,
      maintenance_visits: tmpl.maintenance_visits,
      system_warranty: tmpl.system_warranty || lead.system_warranty,
      inverter_warranty: tmpl.inverter_warranty || lead.inverter_warranty,
      panel_product_warranty: tmpl.panel_product_warranty || lead.panel_product_warranty,
      panel_performance_warranty: tmpl.panel_performance_warranty || lead.panel_performance_warranty
    };
    onUpdateFields(updates);
    toast.success(`โหลดเทมเพลต: ${tmpl.label}`);
  }

  return (
    <div className="bg-white dark:bg-orangeNoir-card rounded-3xl border border-slate-200 dark:border-orangeNoir-border p-6 space-y-6 shadow-xl relative overflow-visible">
      
      {/* GLOBAL OVERLAY TOOLTIP (MOBILE FRIENDLY) */}
      {activeInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-orangeNoir-sidebar w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-orange-500/20 text-left relative">
              <button onClick={() => setActiveInfo(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                <X size={16} />
              </button>
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-2">{activeInfo.title}</h3>
              <p className="text-sm font-medium text-slate-700 dark:text-orange-50/70 leading-relaxed whitespace-pre-line">{activeInfo.desc}</p>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
          <FileText size={24} />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400/70">Lead Configuration</h2>
          <p className="text-sm font-bold text-slate-900 dark:text-white">ตั้งค่าข้อเสนอพิเศษ</p>
        </div>
        {hasPdf && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider rounded-full border border-orange-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            READY
          </div>
        )}
      </div>

      {/* 1. PRODUCT SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-left">
          <Package size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-orangeNoir-textMuted">เลือกสินค้าหลัก</span>
        </div>
        <div className="relative">
          {loadingProducts ? (
            <div className="h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10">
              <Loader2 size={16} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <select
              value={lead.selected_product_id || ''}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">— โปรดเลือกรายการสินค้า —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {p.brand} {p.name} (฿{Number(p.price_thb || 0).toLocaleString()})
                </option>
              ))}
            </select>
          )}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <RefreshCcw size={14} />
          </div>
        </div>
      </div>

      {/* 2. QUICK TEMPLATES */}
      {templates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-left">
            <Sparkles size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-orangeNoir-textMuted">เลือกจากเทมเพลต (Quick Presets)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="relative group">
                <button
                  onClick={() => handleTemplateSelect(tmpl)}
                  className="w-full p-3 pr-8 rounded-2xl bg-white dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-slate-200 dark:border-white/10 hover:border-orange-500/50 transition-all active:scale-95 text-left min-h-[50px] flex items-center"
                >
                  <p className="text-sm font-extrabold text-slate-700 dark:text-white uppercase tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400">{tmpl.label}</p>
                </button>
                {tmpl.description && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInfo({ title: tmpl.label, desc: tmpl.description || '' });
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white transition-all z-10 shadow-sm"
                  >
                    <Info size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CONFIGURATION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {/* Specs Group */}
        <div className="space-y-4 p-5 rounded-3xl bg-slate-50/50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-orange-500" />
            <span className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-600 dark:text-orange-400/80">ข้อมูลระบบ (Specs)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label htmlFor="equipmentTier" className="text-[10px] font-bold uppercase text-slate-400">เกรดอุปกรณ์</label>
                <button 
                  onClick={() => setActiveInfo(COMPARISON_INFO)}
                  className="text-orange-500/50 hover:text-orange-500 transition-colors"
                >
                  <Info size={12} />
                </button>
              </div>
              <select
                id="equipmentTier"
                value={lead.equipment_tier || ''}
                onChange={(e) => onUpdateField('equipment_tier', e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold focus:ring-2 ring-orange-500/10 outline-none"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Personal</option>
                <option value="eco" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Eco</option>
                <option value="premium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Premium</option>
                <option value="ultra" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ultra (VIP)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label htmlFor="systemSize" className="text-[10px] font-bold uppercase text-slate-400">ขนาดระบบ (kW)</label>
              </div>
              <input id="systemSize"
                type="number"
                value={lead.system_size || ''}
                onChange={(e) => onUpdateField('system_size', e.target.value ? parseFloat(e.target.value) : null)}
                onFocus={(e) => e.target.select()}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold focus:ring-2 ring-orange-500/10 outline-none"
                step="0.1"
              />
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200/50 dark:border-white/5">
              <label htmlFor="installationDays" className="text-[10px] font-bold uppercase text-slate-400">เวลาติดตั้ง (วัน)</label>
              <input id="installationDays"
                type="number"
                value={lead.installation_days ?? ''}
                onChange={(e) => onUpdateField('installation_days', e.target.value ? parseInt(e.target.value) : null)}
                onFocus={(e) => e.target.select()}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold focus:ring-2 ring-orange-500/10 outline-none"
              />
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200/50 dark:border-white/5">
              <label htmlFor="maintenanceVisits" className="text-[10px] font-bold uppercase text-slate-400">การดูแล (ครั้ง)</label>
              <input id="maintenanceVisits"
                type="number"
                value={lead.maintenance_visits ?? ''}
                onChange={(e) => onUpdateField('maintenance_visits', e.target.value ? parseInt(e.target.value) : null)}
                onFocus={(e) => e.target.select()}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold focus:ring-2 ring-orange-500/10 outline-none"
              />
              <p className="text-[9px] text-slate-400 mt-1 leading-tight italic">
                * นโยบาย: ฟรี 3 ปีแรก / ปีที่ 4+ เก็บเท่ากับค่าไฟ 1 เดือน
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Group */}
        <div className="space-y-4 p-5 rounded-3xl bg-slate-50/50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-amber-500" />
            <span className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-600 dark:text-amber-500/80">สรุปราคา (Pricing)</span>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center">
            <label htmlFor="basePrice" className="text-[10px] font-bold uppercase text-slate-400 shrink-0">ราคาพื้นฐาน</label>
            <input id="basePrice"
              type="number"
              value={lead.base_price ?? ''}
              onChange={(e) => onUpdateField('base_price', e.target.value ? parseInt(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-right outline-none focus:ring-2 ring-orange-500/10"
            />
            <label htmlFor="manpower" className="text-[10px] font-bold uppercase text-slate-400 shrink-0">ค่าบริการ/ติดตั้ง</label>
            <input id="manpower"
              type="number"
              value={lead.manpower ?? ''}
              onChange={(e) => onUpdateField('manpower', e.target.value ? parseInt(e.target.value) : 0)}
              onFocus={(e) => e.target.select()}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-right outline-none focus:ring-2 ring-orange-500/10"
            />
            <label htmlFor="discountPercent" className="text-[10px] font-bold uppercase text-slate-400 shrink-0">ส่วนลด (%)</label>
            <div className="relative w-full">
              <input id="discountPercent"
                type="number"
                value={lead.discount_percent ?? ''}
                onChange={(e) => onUpdateField('discount_percent', e.target.value ? parseInt(e.target.value) : 0)}
                onFocus={(e) => e.target.select()}
                className={`w-full h-10 px-3 rounded-xl border bg-white dark:bg-white/5 text-xs font-black text-right pr-7 outline-none focus:ring-2 ring-orange-500/10 ${
                  discountWarning === 'danger' ? 'border-red-500 text-red-500' :
                  discountWarning === 'warn' ? 'border-amber-500 text-amber-500' :
                  'border-slate-200 dark:border-white/10'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WARRANTIES SECTION */}
      <div className="p-5 rounded-3xl bg-orange-500/[0.02] dark:bg-orange-500/[0.04] border border-orange-500/10 space-y-4 text-left">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-orange-500" />
          <span className="text-xs md:text-sm font-black uppercase tracking-wider text-orange-700 dark:text-orange-400/80">การรับประกันและการป้องกัน</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
            <label htmlFor="systemWarranty" className="text-[10px] font-bold uppercase text-slate-400">ระบบ</label>
            <input id="systemWarranty"
              type="text"
              inputMode="numeric"
              value={warrantyNum(lead.system_warranty)}
              onChange={(e) => onUpdateField('system_warranty', e.target.value || null)}
              onFocus={(e) => e.target.select()}
              placeholder="3"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-center outline-none focus:ring-2 ring-orange-500/10"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inverterWarranty" className="text-[10px] font-bold uppercase text-slate-400">อินเวอร์เตอร์</label>
            <input id="inverterWarranty"
              type="text"
              inputMode="numeric"
              value={warrantyNum(lead.inverter_warranty)}
              onChange={(e) => onUpdateField('inverter_warranty', e.target.value || null)}
              onFocus={(e) => e.target.select()}
              placeholder="5"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-center outline-none focus:ring-2 ring-orange-500/10"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="panelProductWarranty" className="text-[10px] font-bold uppercase text-slate-400">วัสดุแผง</label>
            <input id="panelProductWarranty"
              type="text"
              inputMode="numeric"
              value={warrantyNum(lead.panel_product_warranty)}
              onChange={(e) => onUpdateField('panel_product_warranty', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-center outline-none focus:ring-2 ring-orange-500/10"
              placeholder="12"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="panelPerformanceWarranty" className="text-[10px] font-bold uppercase text-slate-400">ไฟออก</label>
            <input id="panelPerformanceWarranty"
              type="text"
              inputMode="numeric"
              value={warrantyNum(lead.panel_performance_warranty)}
              onChange={(e) => onUpdateField('panel_performance_warranty', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-center outline-none focus:ring-2 ring-orange-500/10"
              placeholder="30"
            />
          </div>
        </div>
      </div>

      {/* VERSION LABEL */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-left">
          <History size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-orangeNoir-textMuted">ชื่อเวอร์ชัน (Version Label)</span>
        </div>
        <input
          type="text"
          value={proposalLabel}
          onChange={(e) => setProposalLabel(e.target.value)}
          placeholder="e.g. Official Proposal v1"
          className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
      </div>

      {/* FINAL OFFER TOTAL */}
      <div className="relative pt-6 border-t border-slate-200 dark:border-white/10 space-y-3 text-left">
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">มูลค่ารวมที่นำเสนอ</p>
          <p className={`text-2xl md:text-4xl font-black tracking-tighter ${
            total < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'
          }`}>
            ฿{total.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
          <span>฿{basePrice.toLocaleString()}</span>
          <span className="opacity-50">+</span>
          <span>฿{manpower.toLocaleString()}</span>
          {discountPct > 0 && (
            <>
              <span className="opacity-50">−</span>
              <span className="text-red-500">{discountPct}%</span>
            </>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3 pt-2">
        <a
          href={`/proposal/${encodeId(lead.id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 md:h-14 flex items-center justify-center gap-3 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all active:scale-[0.97] border-2 border-orange-500/20 dark:border-orange-500/30"
        >
          <Globe size={16} />
          <span>เปิดหน้าเว็บเสนอราคา</span>
          <ExternalLink size={12} className="opacity-60" />
        </a>
        <button
          onClick={() => onGenerate(proposalLabel)}
          disabled={generatingPdf}
          className="w-full h-12 md:h-14 flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all active:scale-[0.97] shadow-lg disabled:opacity-50"
        >
          {generatingPdf ? (
            <><Loader2 size={16} className="animate-spin" /><span>กำลังประมวลผล...</span></>
          ) : hasPdf ? (
            <><RefreshCcw size={16} /><span>อัปเดตไฟล์ (Regenerate PDF)</span></>
          ) : (
            <><Zap size={16} fill="currentColor" /><span>สร้างใบเสนอราคา PDF</span></>
          )}
        </button>

        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {hasPdf && (
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl gap-1">
              <button
                onClick={() => setShareMode('page')}
                className={`flex-1 py-2 text-[9px] md:text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  shareMode === 'page' ? 'bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Interactive Page
              </button>
              <button
                onClick={() => setShareMode('pdf')}
                className={`flex-1 py-2 text-[9px] md:text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  shareMode === 'pdf' ? 'bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Direct PDF
              </button>
            </div>
          )}

          <button
            onClick={() => onShareToLine(hasPdf ? shareMode : 'page')}
            className="w-full h-12 md:h-14 flex items-center justify-center gap-3 bg-[#00B900] hover:bg-[#00a300] text-white rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all active:scale-[0.97] shadow-lg shadow-[#00B900]/20"
          >
            <MessageSquare size={16} fill="currentColor" />
            <span>ส่งลูกค้าทาง LINE ({hasPdf ? (shareMode === 'page' ? 'หน้าเว็บ' : 'PDF') : 'หน้าเว็บ'})</span>
          </button>
          
          <div className={`grid ${hasPdf ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
            <button
              onClick={onCopyLink}
              className="flex items-center justify-center gap-2 h-10 md:h-12 rounded-xl border-2 border-slate-200 dark:border-orange-500/20 text-slate-600 dark:text-orange-400 text-[9px] md:text-xs font-black uppercase tracking-tight hover:bg-slate-50 dark:hover:bg-orange-500/10 transition-all active:scale-95"
            >
              <Copy size={12} /> คัดลอกลิงก์
            </button>
            {hasPdf ? (
              <>
                <a
                  href={proposalUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-10 md:h-12 rounded-xl border-2 border-slate-200 dark:border-orange-500/20 text-slate-600 dark:text-orange-400 text-[9px] md:text-xs font-black uppercase tracking-tight hover:bg-slate-50 dark:hover:bg-orange-500/10 transition-all active:scale-95"
                >
                  <ExternalLink size={12} /> เปิด PDF
                </a>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex items-center justify-center gap-2 h-10 md:h-12 rounded-xl border-2 border-orange-500/20 text-orange-600 dark:text-orange-400 text-[9px] md:text-xs font-black uppercase tracking-tight hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  {downloadingPdf ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  ดาวน์โหลด
                </button>
              </>
            ) : (
              <a
                href={proposalUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-10 md:h-12 rounded-xl border-2 border-slate-200 dark:border-orange-500/20 text-slate-600 dark:text-orange-400 text-[9px] md:text-xs font-black uppercase tracking-tight hover:bg-slate-50 dark:hover:bg-orange-500/10 transition-all active:scale-95"
              >
                <ExternalLink size={12} /> เปิดหน้าเว็บ
              </a>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW THUMBNAILS */}
      {lead.proposal_images && lead.proposal_images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-2 relative z-10">
          {lead.proposal_images.map((img: string, i: number) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-300 dark:border-white/10 overflow-hidden group/thumb relative">
              <Image src={img} alt={`Page ${i+1}`} fill className="object-cover opacity-60 group-hover/thumb:opacity-100 transition-opacity" sizes="(max-width: 768px) 33vw, 200px" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 bg-black/40 transition-opacity pointer-events-none">
                <span className="text-sm font-bold text-white uppercase">หน้า {i+1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
