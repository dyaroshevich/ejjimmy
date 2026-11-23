'use client';

import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, CheckCircle2, CreditCard, Download,
  Loader2, PackageIcon, Phone, Share2, ShieldCheck,
  Star, Zap, TrendingUp, Award, Clock, FileText
} from 'lucide-react';
import { generateLineShareText } from '@/lib/line';
import { brand } from '@/lib/site.config';
import { FEATURES } from '@/lib/feature-flags';
import { toast } from 'sonner';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export default function ProposalDashboard({ initialLead }: { initialLead?: any }) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams.get('uid') || '';
  const mountedRef = useRef(true);

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [sameOriginPdfUrl, setSameOriginPdfUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const [retry, setRetry] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const currentPdfUrl = selectedSnapshot?.url || pdfUrl;
    if (!currentPdfUrl) {
      toast.info('ยังไม่มีไฟล์ PDF สำหรับข้อเสนอนี้');
      return;
    }

    setDownloading(true);

    try {
      const liff = (window as any).liff;
      if (liff?.isInClient()) {
        const downloadUrl = sameOriginPdfUrl ? `${window.location.origin}${sameOriginPdfUrl}&mode=download` : currentPdfUrl;
        liff.openWindow({
          url: downloadUrl,
          external: true
        });
        setTimeout(() => setDownloading(false), 2000);
        return;
      }

      const proxyUrl = selectedSnapshot
        ? `/api/pdf/download?leadId=${id}&snapshotId=${selectedSnapshot.id}`
        : sameOriginPdfUrl;

      if (!proxyUrl) {
        window.open(currentPdfUrl, '_blank');
        setTimeout(() => setDownloading(false), 2000);
        return;
      }

      const downloadUrl = `${proxyUrl}&mode=download`;
      const resp = await fetch(downloadUrl);
      if (!resp.ok) throw new Error('Fetch failed');
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${brand.name.replace(/\s+/g, '_').toUpperCase()}_Proposal_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch {
      const fallback = selectedSnapshot
        ? `/api/pdf/download?leadId=${id}&snapshotId=${selectedSnapshot.id}`
        : sameOriginPdfUrl;
      if (fallback) window.location.href = fallback + '&mode=download';
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handleLineShare = async () => {
    const shareText = generateLineShareText({
      customerName: data?.customerName,
      systemKw: data?.systemKw,
      monthlySavings: data?.monthlySavings,
      tiers: data?.tiers,
      selectedTier: data?.selectedTier,
      paybackYears: data?.paybackYears,
      leadId: id as string,
      userId,
      pdfUrl: sameOriginPdfUrl ? `${sameOriginPdfUrl}?mode=view` : (pdfUrl || ''),
    });
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const url = `/api/pdf-proposal-data/${id}${selectedSnapshotId ? `?snapshotId=${selectedSnapshotId}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) {
          if (!cancelled) { setError('ไม่พบข้อมูลใบเสนอราคา'); setStatus('error'); }
          return;
        }
        if (cancelled) return;
        const json = await res.json();
        if (cancelled) return;
        
        setData(json.pdfData);
        if (json.history) setHistory(json.history);
        if (json.selectedSnapshot) setSelectedSnapshot(json.selectedSnapshot);
        
        if (!selectedSnapshotId && json.existingUrl) {
          setPdfUrl(json.existingUrl);
          setStatus('ready');
          return;
        }

        if (selectedSnapshotId) {
          setStatus('ready');
          return;
        }

        setStatus('ready');
      } catch {
        if (!cancelled) { setError('เกิดข้อผิดพลาดในการโหลดข้อมูล'); setStatus('error'); }
      }
    }

    if (initialLead && !selectedSnapshotId) {
      setData(initialLead);
      setStatus('ready');
    }

    run();
    return () => { cancelled = true; };
  }, [id, userId, retry, selectedSnapshotId]);

  const fmtB = (n: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    if (pdfUrl) {
      setSameOriginPdfUrl(`/api/pdf/download?leadId=${id}`);
    }
  }, [pdfUrl, id]);

  if (status === 'loading' || (!data && status !== 'error')) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-8 relative z-10">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
          </div>
          <div className="absolute inset-0 bg-orange-200 blur-2xl opacity-20 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">กำลังจัดเตรียมข้อเสนอ...</h2>
        <p className="text-slate-500 mt-3 font-medium max-w-xs leading-relaxed">AI กำลังวิเคราะห์จุดคุ้มทุนและสเปคอุปกรณ์ที่เหมาะสมที่สุดสำหรับคุณครับ</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-slate-500 text-center font-medium mb-8 leading-relaxed">{error}</p>
        <button
          onClick={() => { setStatus('loading'); setRetry(n => n + 1); }}
          className="w-full max-w-xs h-14 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const scenarioLabels = {
    sample: { text: 'ข้อเสนอแนะนำ', color: 'bg-blue-600' },
    personal: { text: 'ข้อเสนอส่วนตัว', color: 'bg-orange-600' },
    selected: { text: 'แอดมินยืนยันแล้ว', color: 'bg-amber-600' }
  };
  const currentScenario = selectedSnapshot?.label?.toLowerCase().includes('admin') || data.scenario === 'selected'
    ? { text: 'ข้อเสนอทางการโดยแอดมิน', color: 'bg-orange-600' }
    : scenarioLabels[data.scenario as keyof typeof scenarioLabels] || scenarioLabels.personal;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-orange-100 text-slate-900 overflow-x-hidden safe-area-bottom"
    >
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Sticky New Offer Alert */}
      {!selectedSnapshotId && history.length > 0 && selectedSnapshotId !== history[0].id && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-amber-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[100] animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">มีข้อเสนอฉบับแก้ไขใหม่</span>
           </div>
           <button 
             onClick={() => setSelectedSnapshotId(history[0].id)}
             className="text-[11px] font-black text-white bg-amber-600 px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
           >
             ดูทันที
           </button>
        </div>
      )}

      {/* Header Section */}
      <header className="bg-white px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-12 rounded-b-[3.5rem] shadow-sm relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                <span className={`${currentScenario.color} text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 text-white rounded-lg shadow-sm shadow-orange-600/10`}>
                  {selectedSnapshot?.label || currentScenario.text}
                </span>
              </div>
              {selectedSnapshotId === history[0]?.id && (
                <div className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest border border-orange-100">ล่าสุด</div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-[clamp(0.75rem,2vw,0.875rem)] font-black text-slate-400 uppercase tracking-[0.3em]">{brand.name} EXCLUSIVE</p>
              <h1 className="text-[clamp(2.5rem,8vw,3.5rem)] font-black text-slate-900 leading-[1.1] tracking-tight">
                {data.customerName}
              </h1>
            </div>

              <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-[1.5rem] border border-slate-100/50 backdrop-blur-sm shadow-sm group">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ความจุระบบ</span>
                  <span className="text-lg font-black text-slate-900">{data.systemKw} <span className="text-sm font-bold text-slate-400">kW</span></span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading || (!selectedSnapshot?.url && !pdfUrl)}
                className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 h-16 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs transition-all active:scale-[0.98] shadow-2xl group disabled:opacity-50 disabled:cursor-not-allowed ${
                  (selectedSnapshot?.url || pdfUrl)
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-orange-500/30 hover:shadow-orange-500/40 hover:from-orange-500 hover:to-orange-400'
                    : 'bg-slate-100 text-slate-400 shadow-none'
                }`}
              >
                {downloading ? (
                  <><Loader2 size={18} className="animate-spin" /><span>กำลังดาวน์โหลด...</span></>
                ) : (selectedSnapshot?.url || pdfUrl) ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold opacity-70 tracking-widest">ดาวน์โหลด</span>
                      <span className="text-sm font-black tracking-tight">ใบเสนอราคา PDF</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold opacity-50 tracking-widest">รอการสร้าง</span>
                      <span className="text-sm font-black tracking-tight">ยังไม่มีไฟล์ PDF</span>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Detail */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-60" />
      </header>

      <main className="max-w-4xl mx-auto px-5 mt-10 space-y-8">
        
        {/* Premium Package Display */}
        {data.tiers?.[data.selectedTier || 'premium'] && (() => {
          const t = data.tiers[data.selectedTier || 'premium'];
          const components = t.system_components || [];
          return (
            <section className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <PackageIcon className="w-6 h-6 text-orange-600" />
                  <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-900">รายการอุปกรณ์พรีเมียม</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white text-[9px] font-black rounded-full tracking-widest shadow-md shadow-orange-600/20">{t.tier_label || 'PREMIUM SELECT'}</div>
              </div>

              <div className="p-8 space-y-8">
                {t.image_url && (
                  <div className="relative aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                    <Image
                      src={t.image_url}
                      alt={t.name}
                      fill
                      className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <div className="bg-white/90 backdrop-blur-md border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.brand || 'BRAND'}</p>
                        <p className="text-sm font-black text-slate-900">{t.model || t.brand || t.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{t.name}</h4>
                  <p className="text-base text-slate-500 font-medium leading-relaxed">{t.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {components.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-orange-200 hover:bg-white transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl font-black text-orange-600 shadow-sm shrink-0">
                        {c.qty || 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 leading-snug">{c.item}</p>
                        {c.warranty && (
                          <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck size={12} className="text-orange-500" />
                            <p className="text-[10px] font-bold text-orange-600/70 uppercase tracking-widest">รับประกัน {c.warranty}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price Callout */}
              {data.customFields?.basePrice && (() => {
                const bp = data.customFields!.basePrice;
                const mp = data.customFields!.manpower || 0;
                const dp = data.customFields!.discountPercent || 0;
                const total = bp + mp - Math.round(bp * dp / 100);
                return (
                  <div className="bg-slate-900 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1 text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">ราคาสุทธิ (รวมติดตั้ง)</p>
                      <p className="text-4xl font-black text-white tracking-tighter">{fmtB(total)}</p>
                    </div>
                    <a
                      href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''}`}
                      className="h-14 px-8 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 active:scale-95 hover:bg-orange-400 transition-all inline-flex items-center justify-center"
                    >
                      จองคิวติดตั้ง
                    </a>
                  </div>
                );
              })()}
            </section>
          );
        })()}

        {/* ROI Matrix Section */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-500" />
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-900">สรุปความคุ้มค่า 25 ปี</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
                <TrendingUp size={24} className="text-orange-600 mb-4" />
                <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest mb-1">จุดคืนทุน</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{data.paybackYears} <span className="text-sm">ปี</span></p>
              </div>
              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                <Award size={24} className="text-blue-600 mb-4" />
                <p className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest mb-1">ROI รวม</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">~{data.totalCost > 0 ? Math.round(((data.monthlySavings * 12 * 25) / data.totalCost) * 100) : 420}%</p>
              </div>
            </div>

            {/* Visual Bar Graph */}
            {(() => {
              const peaTotal = data.monthlyBill * 12 * 25;
              const solarTotal = data.totalCost + (data.monthlyBill - data.monthlySavings) * 12 * 25;
              const solarPct = peaTotal > 0 ? Math.max(5, Math.round((solarTotal / peaTotal) * 100)) : 45;
              return (
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                    <span className="text-slate-400">⚡ จ่ายค่าไฟ PEA ต่อ (25 ปี)</span>
                    <span className="text-rose-500">{fmtB(peaTotal)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-rose-400 rounded-full shadow-lg" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                    <span className="text-orange-600">☀️ ลงทุนระบบ {brand.name}</span>
                    <span className="text-orange-600">{fmtB(solarTotal)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-orange-500 rounded-full shadow-lg" style={{ width: `${solarPct}%` }} />
                  </div>
                </div>
              </div>
              );})()}

            <div className="bg-orange-600 rounded-[2rem] p-8 text-center text-white shadow-2xl shadow-orange-600/20">
              <p className="text-[10px] font-black text-orange-100/70 uppercase tracking-[0.25em] mb-2">เงินในกระเป๋าที่จะเหลือเพิ่มขึ้น</p>
              <p className="text-4xl font-black tracking-tighter mb-4">{fmtB(data.monthlySavings * 12 * 25 - data.totalCost)}</p>
              <div className="h-px bg-white/20 w-full mb-4" />
              <p className="text-sm font-medium text-orange-50 leading-relaxed italic">&ldquo;เหมือนได้กำไรจากการซื้อหุ้นชั้นดีที่ไม่มีวันตก ตลอด 25 ปีเต็ม&rdquo;</p>
            </div>
          </div>
        </section>

        {/* Financing Section (Luxury Card) */}
        {FEATURES.sofin && (
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full translate-x-20 -translate-y-20" />
           
           <div className="flex items-center gap-3 mb-8 relative z-10">
             <CreditCard className="w-6 h-6 text-orange-400" />
             <h3 className="font-black text-sm uppercase tracking-[0.2em] text-orange-100">โปรแกรมผ่อนชำระ SOFIN</h3>
           </div>

           <div className="space-y-6 relative z-10">
             <div className="grid grid-cols-1 gap-6">
               <div className="flex justify-between items-end pb-4 border-b border-white/10 group-hover:border-orange-500/30 transition-colors">
                 <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">เงินดาวน์ (10%)</span>
                 <span className="text-xl font-black text-white">{fmtB(data.installmentCalculation.downPayment)}</span>
               </div>
               <div className="grid grid-cols-2 gap-6 pt-4">
                 <div className="space-y-2">
                   <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">ผ่อน 36 งวด</p>
                   <p className="text-2xl font-black text-white">{fmtB(data.installmentCalculation.monthly36)}<span className="text-xs text-slate-500 font-bold ml-1">/เดือน</span></p>
                 </div>
                 <div className="space-y-2 text-right">
                   <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">ผ่อน 60 งวด</p>
                   <p className="text-2xl font-black text-white">{fmtB(data.installmentCalculation.monthly60)}<span className="text-xs text-slate-500 font-bold ml-1">/เดือน</span></p>
                 </div>
               </div>
             </div>
             <p className="text-[10px] text-slate-500 font-bold text-center pt-4 uppercase tracking-widest">* การอนุมัติและดอกเบี้ยเป็นไปตามเงื่อนไขของสถาบันการเงิน</p>
           </div>
        </section>
        )}

        {/* Maintenance / Assurance */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 space-y-8">
           <div className="flex items-center gap-3">
             <ShieldCheck className="w-6 h-6 text-orange-500" />
             <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-900">การดูแลและติดตั้ง</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                  <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เวลาติดตั้ง</p>
                  <p className="text-base font-black text-slate-800">{data.customFields?.installationDays || 3} วันทำการ</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest">การดูแลระบบ</p>
                  <p className="text-base font-black text-slate-800">ฟรี 3 ปีแรก</p>
                </div>
             </div>
           </div>

           <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500 font-black text-xs tracking-widest">W/O</div>
                 <p className="text-sm font-black text-slate-700 uppercase tracking-tight leading-snug">WARRANTY & O&M PACKAGE</p>
              </div>
              <ul className="space-y-3">
                {['ทำความสะอาดแผงฟรีปีละ 2 ครั้ง', 'ตรวจสอบระบบไฟฟ้าฟรีผ่านแอป 24 ชม.', 'ทีมวิศวกรเข้าหน้างานภายใน 48 ชม.', 'รับประกันงานติดตั้ง 5-10 ปี'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {item}
                  </li>
                ))}
              </ul>
           </div>
        </section>

        {/* Floating Action Menu (Mobile Optimized) */}
        <div className="fixed bottom-0 left-0 right-0 p-5 z-[200] bg-gradient-to-t from-white via-white/95 to-transparent pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              onClick={handleLineShare}
              className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100 shadow-lg active:scale-90 transition-all shrink-0"
              aria-label="Share on LINE"
            >
              {copied ? <CheckCircle2 size={24} /> : <Share2 size={24} />}
            </button>
              <button
                onClick={() => {
                  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || data?.phone;
                  if (phone) window.location.href = `tel:${phone}`;
                }}
                className="flex-1 h-14 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Phone size={18} fill="currentColor" />
                ปรึกษาวิศวกรทันที
              </button>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="mt-20 px-8 py-12 text-center space-y-6">
        <div className="flex justify-center gap-1.5">
          {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-orange-500 fill-orange-500" />)}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">{brand.name} QUALITY</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Krabi, Thailand · Energy Excellence since 2024</p>
        </div>
      </footer>
    </motion.div>
  );
}
