'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { encodeId } from '@/lib/hashid';
import { 
  ArrowLeft, 
  MessageSquare, 
  Phone, 
  Zap, 
  Moon,
  Sun,
  Sparkles,
  Send,
  Mail,
  MapPin,
  Calendar,
  FileText,
  User,
  Clock,
  History,
  Trash2,
  Loader2,
  CheckCircle2,
  Download,
  Share2,
  ExternalLink,
  RefreshCcw,
  Check,
  Circle,
  X,
  Eye,
  Copy,
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';
import ProposalPreviewModal from '@/components/admin/ProposalPreviewModal';
import CustomOfferHub from '@/components/admin/CustomOfferHub';
import { useLocale, useTranslations } from 'next-intl';

import { normalizeStatus, getActiveStageIndex } from '@/lib/lead-status';

const STATUS_META = [
  { key: 'ใหม่', labelKey: 'ldStageNew', icon: Circle, color: 'bg-blue-500', activeColor: 'bg-blue-500', barColor: 'bg-blue-400' },
  { key: 'ติดต่อแล้ว', labelKey: 'ldStageContacted', icon: Circle, color: 'bg-amber-400', activeColor: 'bg-amber-500', barColor: 'bg-amber-400' },
  { key: 'ส่งใบเสนอราคาแล้ว', labelKey: 'ldStageQuoted', icon: Circle, color: 'bg-purple-400', activeColor: 'bg-purple-500', barColor: 'bg-purple-400' },
  { key: 'เซ็นสัญญาแล้ว', labelKey: 'ldStageSigned', icon: Circle, color: 'bg-orange-400', activeColor: 'bg-orange-500', barColor: 'bg-orange-400' },
  { key: 'ติดตั้งแล้ว', labelKey: 'ldStageWon', icon: Check, color: 'bg-orange-500', activeColor: 'bg-orange-600', barColor: 'bg-orange-500' },
] as const;
const STATUS_STAGES = STATUS_META;

function ContactTool({ icon, label, color, href, desktop = false }: any) {
  const isDisabled = !href || href === '#' || href.includes('undefined');
  const colors: any = {
    emerald: 'text-orange-500 md:bg-orange-500 md:text-white',
    green: 'text-[#00B900] md:bg-[#00B900] md:text-white',
    whatsapp: 'text-[#25D366] md:bg-[#25D366] md:text-white',
    amber: 'text-amber-500 md:bg-amber-500 md:text-white',
  };

  if (desktop) {
    return (
      <a 
        href={isDisabled ? '#' : href} 
        target={isDisabled ? undefined : "_blank"} 
        rel={isDisabled ? undefined : "noopener noreferrer"} 
        className={`flex flex-col items-center gap-1.5 group cursor-pointer transition-all ${isDisabled ? 'grayscale opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
        onClick={(e) => isDisabled && e.preventDefault()}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isDisabled ? 'bg-slate-100 dark:bg-orange-900/10 text-slate-300 dark:text-orange-900/30 shadow-none' : colors[color]}`}>
          {icon}
        </div>
        <span className={`text-sm font-black uppercase tracking-widest ${isDisabled ? 'text-slate-300 dark:text-orange-900/40' : 'text-slate-500 dark:text-white/70 group-hover:text-orange-500 dark:group-hover:text-orange-400'}`}>
          {label}
        </span>
      </a>
    );
  }

  const mobileColors: any = {
    emerald: 'text-orange-500',
    green: 'text-[#00B900]',
    whatsapp: 'text-[#25D366]',
    amber: 'text-amber-500',
  };

  return (
    <a 
      href={isDisabled ? '#' : href} 
      target={isDisabled ? undefined : "_blank"} 
      className={`flex flex-col items-center justify-center gap-1 py-3 border-r last:border-r-0 border-slate-100 dark:border-white/5 bg-white dark:bg-orangeNoir-sidebar/50 ${isDisabled ? 'grayscale opacity-30 cursor-not-allowed' : 'active:bg-slate-50 dark:active:bg-white/5'}`}
      onClick={(e) => isDisabled && e.preventDefault()}
    >
      <div className={isDisabled ? 'text-slate-300' : mobileColors[color]}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-wider ${isDisabled ? 'text-slate-300' : 'text-slate-500 dark:text-white/60'}`}>
        {label}
      </span>
    </a>
  );
}

function LeadProgressBar({ stages, currentStatus, isLost, onStageClick, t }: {
  stages: (typeof STATUS_STAGES[number] & { label: string })[];
  currentStatus: string;
  isLost: boolean;
  onStageClick: (key: string) => void;
  t: (key: string) => string;
}) {
  const activeIndex = getActiveStageIndex(currentStatus);

  return (
    <div className="w-full">
      {isLost ? (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/30">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
            <X size={16} strokeWidth={3} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black uppercase tracking-widest text-red-700 dark:text-red-400">{t('ldLost')}</p>
          </div>
          <button
            onClick={() => onStageClick('ใหม่')}
            className="px-3 py-1.5 bg-white dark:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-black uppercase tracking-widest rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-500 hover:text-white transition-all"
          >
            {t('reopen')}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {stages.map((stage, i) => {
            const isActive = i === activeIndex;
            const isCompleted = i < activeIndex;
            const StageIcon = isCompleted ? Check : stage.icon;

            return (
              <div key={stage.key} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 text-center">
                <button
                  onClick={() => onStageClick(stage.key)}
                  className={`
                    relative w-full h-1 md:h-1.5 rounded-full transition-all duration-300 cursor-pointer
                    ${isCompleted ? stage.barColor : isActive ? stage.activeColor : 'bg-slate-200 dark:bg-orange-800'}
                    ${isActive ? 'h-1.5 md:h-2 shadow-sm' : ''}
                  `}
                />
                <button
                  onClick={() => onStageClick(stage.key)}
                  className={`
                    flex flex-col items-center gap-0.5 w-full py-1 transition-all duration-200 cursor-pointer
                    ${isActive
                      ? `text-orange-600 dark:text-orange-400 font-black`
                      : isCompleted
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-slate-300 dark:text-orange-900/40'
                    }
                  `}
                >
                  <StageIcon size={isActive ? 8 : 6} strokeWidth={isCompleted ? 4 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-tight leading-none">
                    {stage.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  const [deletingSnapshotId, setDeletingSnapshotId] = useState<string | null>(null);

  const stages = useMemo(() => STATUS_STAGES.map((s) => ({ ...s, label: t(s.labelKey) })), [t]);

  const fetchSnapshots = useCallback(async () => {
    setSnapshotsLoading(true);
    try {
      const res = await fetch(`/api/pdf/snapshots/${params.id}`);
      const data = await res.json();
      if (data.snapshots) setSnapshots(data.snapshots);
    } catch (err) {
      console.error('[Snapshots] fetch error:', err);
    }
    setSnapshotsLoading(false);
  }, [params.id]);

  useEffect(() => {
    setMounted(true);
    async function fetchLead() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (!error && data) {
        if (data.city && data.city !== data.location) {
          data.location = data.city;
          supabase.from('leads').update({ location: data.city }).eq('id', params.id).then();
        }
        setLead(data);
      }
      setLoading(false);
    }
    fetchLead();
    fetchSnapshots();
  }, [params.id, fetchSnapshots]);

  // Debounced auto-save for bill_amount (starts 800ms after typing stops)
  const billSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const billLoadedRef = useRef(false);
  useEffect(() => {
    if (!lead) return;
    if (!billLoadedRef.current) { billLoadedRef.current = true; return; }
    const current = Number(lead.bill_amount) || null;
    if (billSaveRef.current) clearTimeout(billSaveRef.current);
    billSaveRef.current = setTimeout(() => {
      updateLeadField('bill_amount', current);
    }, 800);
    return () => { if (billSaveRef.current) clearTimeout(billSaveRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.bill_amount]);

  const generateProposal = async (label?: string) => {
    setGeneratingPdf(true);
    try {
      const res = await fetch('/api/pdf/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: params.id, 
          force: true,
          label: label || 'Official Proposal'
        }),
      });
      const data = await res.json();
      if (data.url) {
        setLead({ ...lead, proposal_url: data.url, proposal_images: data.images, status: 'ส่งใบเสนอราคาแล้ว' });
        await supabase.from('leads').update({ proposal_url: data.url, status: 'ส่งใบเสนอราคาแล้ว' }).eq('id', params.id);
        try { await navigator.clipboard.writeText(data.url); } catch {}
        toast.success(t('proposalDone', { label: label || '' }));
        fetchSnapshots();
      } else if (data.status === 'fallback') {
        setLead({ ...lead, proposal_url: null, status: 'ส่งใบเสนอราคาแล้ว' });
        await supabase.from('leads').update({ proposal_url: null, status: 'ส่งใบเสนอราคาแล้ว' }).eq('id', params.id);
        toast.info(t('pdfNotReady'));
        fetchSnapshots();
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(t('genericError') + err.message);
    }
    setGeneratingPdf(false);
  };

  const LANDING_URL = 'https://tawanpower.vercel.app';

  const copyProposalLink = () => {
    if (!lead) return;
    const proposalUrl = `${LANDING_URL}/proposal/${encodeId(params.id)}`;
    try { navigator.clipboard.writeText(proposalUrl); } catch {}
    toast.success(t('linkCopied'));
  };

  const shareToLine = async (mode: 'pdf' | 'page' = 'pdf') => {
    if (!lead) return;
    
    let url = lead.proposal_url;
    if (mode === 'page' || !url || url.startsWith('/')) {
      url = `${LANDING_URL}/proposal/${encodeId(params.id)}`;
    }

    if (!url || url === '__generating__') {
      toast.error(t('proposalNotReady'));
      return;
    }

    const systemKw = Number(lead.system_size) || 0;
    const totalPrice = (Number(lead.base_price) || 0) + (Number(lead.manpower) || 0) - Math.round((Number(lead.base_price) || 0) * (Number(lead.discount_percent) || 0) / 100);

    let productModel = '';
    if (lead.selected_product_id) {
      try {
        const res = await fetch(`/api/solar-products/${lead.selected_product_id}`);
        if (res.ok) {
          const p = await res.json();
          if (p && !p.error) productModel = `${p.brand ? p.brand + ' ' : ''}${p.name || ''}${p.model ? ' (' + p.model + ')' : ''}`;
        }
      } catch {}
    }

    const tierLabels: Record<string, string> = { eco: 'Eco', premium: 'Premium', ultra: 'Ultra (VIP)', vip: 'Ultra (VIP)' };
    const tierLabel = tierLabels[lead.equipment_tier] || lead.equipment_tier || 'Premium';

    const lines: string[] = [
      t('lineT1', { name: lead.name || t('defaultCustomer') }),
      '',
      t('lineT2', { name: lead.name || t('defaultCustomer') }),
      t('lineT3'),
      '',
      t('lineT4', { tier: tierLabel, model: productModel ? ' | ' + productModel : '' }),
    ];
    if (systemKw > 0) lines.push(t('lineT5', { kw: systemKw }));
    if (totalPrice > 0) lines.push(t('lineT6', { price: totalPrice.toLocaleString(locale) }));
    lines.push('', t('lineT7'), url, '',
      t('lineT8'),
      t('lineT9'));

    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(lines.join('\n'))}`;
    window.open(lineUrl, '_blank');
  };

  const generateSummary = async () => {
    if (!lead?.chat_history) return;
    setSummarizing(true);
    try {
      const res = await fetch('/api/admin/summarize', {
        method: 'POST',
        body: JSON.stringify({ history: lead.chat_history }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (err) {
      console.error(err);
    }
    setSummarizing(false);
  };

  const copyIntro = () => {
    const power = lead.system_size ? `${lead.system_size} kW` : t('defaultPower');
    const text = t('introMsg', { name: lead.name || t('defaultCustomer'), power, location: lead.location || t('defaultLocation') });
    try { navigator.clipboard.writeText(text); } catch {}
    toast.success(t('introCopied'));
  };

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', params.id);
    
    if (!error) {
      setLead({ ...lead, status: newStatus });
    }
  };

  const deleteSnapshot = async (snapshotId: string) => {
    setDeletingSnapshotId(snapshotId);
    try {
      const res = await fetch(`/api/pdf/snapshots/${params.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId }),
      });
      if (res.ok) {
        setSnapshots(snapshots.filter((s) => s.id !== snapshotId));
        toast.success(t('snapshotDeleted'));
      } else {
        toast.error(t('snapshotDeleteFail'));
      }
    } catch {
      toast.error(t('networkError'));
    }
    setDeletingSnapshotId(null);
  };

  const copySnapshotLink = async (url: string) => {
    try { await navigator.clipboard.writeText(url); } catch {}
    toast.success('คัดลอกลิงก์แล้ว');
  };

  const updateLeadFields = async (updates: Record<string, any>) => {
    if (!lead) return;
    setLead((prev: any) => ({ ...prev, ...updates }));
    const { error } = await supabase.from('leads').update(updates).eq('id', params.id);
    if (error) {
      toast.error(t('saveFail'));
      console.error(error);
    }
  };

  const updateLeadField = async (field: string, value: any) => {
    await updateLeadFields({ [field]: value });
  };

  if (!mounted || loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-orangeNoir-bg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 dark:text-orange-400 animate-spin" />
    </div>
  );

  if (!lead) return <div className="min-h-screen bg-slate-50 dark:bg-orangeNoir-bg flex items-center justify-center font-black uppercase text-slate-500 dark:text-orangeNoir-textMuted">{t('noLead')}</div>;

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-orangeNoir-bg text-slate-900 dark:text-orangeNoir-text flex flex-col font-sans selection:bg-orange-100 dark:selection:bg-orange-600 w-full overflow-x-hidden pb-[100px] md:pb-0">
        
        <header className="bg-white/95 dark:bg-orangeNoir-sidebar/95 border-b border-slate-100 dark:border-orangeNoir-border sticky top-0 z-40 backdrop-blur-md w-full">
          <div className="max-w-[1440px] mx-auto px-4 md:px-10">
            <div className="flex items-center justify-between py-3 md:py-8 gap-3">
              <div className="flex items-center gap-3 md:gap-8 flex-1 min-w-0">
                <Link href="/admin">
                  <button className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 dark:bg-orange-900/40 hover:bg-slate-100 dark:hover:bg-orange-900/60 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-200 dark:border-orangeNoir-border transition-all active:scale-90 group shadow-sm shrink-0">
                    <ArrowLeft size={20} className="text-slate-600 dark:text-orange-400 md:w-6 md:h-6" />
                  </button>
                </Link>
                <div className="min-w-0">
                  <input 
                    type="text"
                    value={lead.name || ''}
                    onChange={(e) => setLead((prev: any) => ({...prev, name: e.target.value}))}
                    onBlur={(e) => updateLeadField('name', e.target.value)}
                    className="w-full text-base md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight bg-transparent border-none outline-none focus:ring-1 ring-orange-500/30 rounded-md"
                    placeholder={t('namePh')}
                  />
                  <div className="flex items-center gap-2 mt-1 md:mt-2">
                   <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-orange-950/20 rounded-lg border border-slate-200 dark:border-orange-800/30">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="text-sm md:text-xs font-bold text-slate-600 dark:text-orange-400">{lead.location || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-6">
                <div className="hidden md:flex items-center gap-4 mr-2 border-r border-slate-100 dark:border-white/5 pr-6">
                  <ContactTool desktop icon={<Phone size={20} />} label={t('call')} color="emerald" href={lead.phone ? `tel:${lead.phone}` : '#'} />
                  <ContactTool desktop icon={<MessageSquare size={20} />} label="LINE" color="green" href={lead.line_id ? `https://line.me/ti/p/~${lead.line_id}` : '#'} />
                  <ContactTool desktop icon={<Send size={20} />} label="WhatsApp" color="whatsapp" href={lead.phone ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}` : '#'} />
                  <ContactTool desktop icon={<Mail size={20} />} label="Email" color="amber" href={lead.email ? `mailto:${lead.email}` : '#'} />
                </div>

                <button 
                  onClick={copyIntro}
                  title={t('copyIntroTitle')}
                  className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-5 md:py-2.5 bg-[#00B900] text-white rounded-xl md:rounded-full hover:bg-[#00ce00] transition-all shadow-md active:scale-95 group"
                >
                  <MessageSquare size={16} fill="currentColor" className="md:w-4 md:h-4" />
                  <span className="hidden md:inline ml-2 text-[10px] font-black uppercase tracking-widest">{t('copyLine')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pb-4 md:hidden border-t border-slate-50 dark:border-white/5 pt-3">
                <ContactTool icon={<Phone size={18} />} label={t('call')} color="emerald" href={lead.phone ? `tel:${lead.phone}` : '#'} />
                <ContactTool icon={<MessageSquare size={18} />} label="LINE" color="green" href={lead.line_id ? `https://line.me/ti/p/~${lead.line_id}` : '#'} />
                <ContactTool icon={<Send size={18} />} label="WA" color="whatsapp" href={lead.phone ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}` : '#'} />
                <ContactTool icon={<Mail size={18} />} label="Email" color="amber" href={lead.email ? `mailto:${lead.email}` : '#'} />
            </div>

            <div className="pb-4 md:pb-8 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50 dark:border-white/5">
              <div className="max-w-4xl mx-auto md:px-10">
                <LeadProgressBar
                  stages={stages}
                  t={t}
                  currentStatus={lead.status}
                  isLost={normalizeStatus(lead.status) === 'ยกเลิก'}
                  onStageClick={(key) => updateStatus(key)}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-10 w-full max-w-[1440px] mx-auto space-y-6 md:space-y-10">
          
          {/* 1. AI SUMMARY SECTION (Moved Up for better visibility) */}
          {lead.chat_history && lead.chat_history.length > 0 && (
            <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 p-5 space-y-3 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-orange-500 animate-pulse" />
                  <h2 className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">{t('aiInsight')}</h2>
                </div>
                <button 
                  onClick={generateSummary}
                  disabled={summarizing}
                  className="text-sm font-bold text-orange-700 dark:text-orange-50/50 hover:underline uppercase tracking-widest disabled:opacity-50"
                >
                  {summarizing ? t('summarizing') : aiSummary ? t('summarizeAgain') : t('summarizeNow')}
                </button>
              </div>
              
              {aiSummary ? (
                <p className="text-xs font-medium text-slate-700 dark:text-orange-50/80 leading-relaxed italic relative z-10 text-left">
                  &quot;{aiSummary}&quot;
                </p>
              ) : (
                <p className="text-sm font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-wider relative z-10 italic text-left">
                  {t('aiHint')}
                </p>
              )}
            </div>
          )}

          {/* 2. CUSTOM OFFER HUB (CONFIGURATOR) */}
          <CustomOfferHub
            lead={lead}
            generatingPdf={generatingPdf}
            onUpdateField={updateLeadField}
            onUpdateFields={updateLeadFields}
            onGenerate={generateProposal}
            hasPdf={!!lead.proposal_url && lead.proposal_url !== '__generating__'}
            proposalUrl={`${LANDING_URL}/proposal/${encodeId(params.id)}`}
            onCopyLink={copyProposalLink}
            onShareToLine={shareToLine}
          />

          <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-slate-400 dark:text-orangeNoir-textMuted" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-orangeNoir-textMuted">{t('proposalHistory')}</h2>
              </div>
              {snapshots.length > 0 && (
                <span className="text-sm font-bold text-slate-400 dark:text-orangeNoir-textMuted bg-slate-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                  {t('leadsCount', { n: snapshots.length })}
                </span>
              )}
            </div>

            {snapshotsLoading && snapshots.length === 0 && (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}

            {!snapshotsLoading && snapshots.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-wider">
                  {t('noProposals')}
                </p>
              </div>
            )}

            {snapshots.length > 0 && (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {snapshots.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-orange-900/20 border border-slate-100 dark:border-orangeNoir-border group hover:border-orange-200 dark:hover:border-orange-700/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-orange-700 dark:text-orange-400">#{snapshots.length - i}</span>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-orangeNoir-text">
                          {s.label || t('defaultProposal')}
                        </span>
                        {s.tier && (
                          <span className={`text-sm font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            s.tier === 'eco' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                            s.tier === 'premium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                            s.tier === 'ultra' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
                          }`}>
                            {s.tier}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={10} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-400 dark:text-orangeNoir-textMuted">
                          {new Date(s.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {s.total_cost && (
                          <>
                            <span className="text-sm text-slate-300 dark:text-orange-800">|</span>
                            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                              ฿{Number(s.total_cost).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copySnapshotLink(s.pdf_url)}
                        disabled={!s.pdf_url}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-800/40 text-slate-500 dark:text-orange-400 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => deleteSnapshot(s.id)}
                        disabled={deletingSnapshotId === s.id}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-orange-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 dark:text-orange-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-30"
                      >
                        {deletingSnapshotId === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border p-6 space-y-5 shadow-sm">
             <div className="flex items-center gap-2">
               <User size={16} className="text-slate-400 dark:text-orangeNoir-textMuted" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-orangeNoir-textMuted">{t('profileTitle')}</h2>
             </div>

                <div className="space-y-4">
                  <div className="bg-orange-50/80 dark:bg-orange-900/10 rounded-xl px-4 py-3 border border-orange-100/50 dark:border-orange-800/20">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('avgBill')}</span>
                     </div>
                   <input 
                      type="number" 
                      value={lead.bill_amount || ''} 
                      onChange={(e) => setLead((prev: any) => ({...prev, bill_amount: e.target.value}))}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => updateLeadField('bill_amount', e.target.value ? Number(e.target.value) : null)}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                      className="w-full text-lg md:text-xl font-black text-orange-600 dark:text-orange-400 bg-transparent outline-none"
                       placeholder={t('billPh')}
                   />
                   {(lead.calc_bill_range || lead.system_size) && (
                     <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-orange-200/50">
                       {lead.calc_bill_range && (
                          <span className="text-sm font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-md">{t('billRange')} {lead.calc_bill_range} ฿</span>
                       )}
                       {lead.system_size && (
                          <span className="text-sm font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">{t('systemIs')} {Number(lead.system_size).toFixed(1)} kW</span>
                       )}
                     </div>
                   )}
                  </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('phone')}</span>
                      <input 
                         type="text" 
                         value={lead.phone || ''} 
                         onChange={(e) => setLead((prev: any) => ({...prev, phone: e.target.value}))}
                         onBlur={(e) => updateLeadField('phone', e.target.value)}
                         className="w-full text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-orange-900/20 p-2 rounded-lg border-none outline-none focus:ring-1 ring-orange-500"
                         placeholder="—"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('province')}</span>
                      <div className="relative">
                        <input 
                           type="text" 
                           value={lead.city || ''} 
                           onChange={(e) => setLead((prev: any) => ({...prev, city: e.target.value, location: e.target.value}))}
                           onBlur={(e) => { updateLeadField('city', e.target.value); updateLeadField('location', e.target.value); }}
                           className="w-full text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-orange-900/20 p-2 rounded-lg border-none outline-none focus:ring-1 ring-orange-500"
                           placeholder="—"
                        />
                        <MapPin size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500/60" />
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('lineId')}</span>
                     <input 
                        type="text" 
                        value={lead.line_id || ''} 
                        onChange={(e) => setLead((prev: any) => ({...prev, line_id: e.target.value}))}
                        onBlur={(e) => updateLeadField('line_id', e.target.value)}
                        className="w-full text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-orange-900/20 p-2 rounded-lg border-none outline-none focus:ring-1 ring-orange-500"
                        placeholder="—"
                     />
                   </div>
                   <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('email')}</span>
                     <input 
                        type="text" 
                        value={lead.email || ''} 
                        onChange={(e) => setLead((prev: any) => ({...prev, email: e.target.value}))}
                        onBlur={(e) => updateLeadField('email', e.target.value)}
                        className="w-full text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-orange-900/20 p-2 rounded-lg border-none outline-none focus:ring-1 ring-orange-500"
                        placeholder="—"
                     />
                   </div>
                   <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('bldType')}</span>
                     <input 
                        type="text" 
                        value={lead.object_type || ''} 
                        onChange={(e) => setLead((prev: any) => ({...prev, object_type: e.target.value}))}
                        onBlur={(e) => updateLeadField('object_type', e.target.value)}
                        className="w-full text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-orange-900/20 p-2 rounded-lg border-none outline-none focus:ring-1 ring-orange-500"
                        placeholder="—"
                     />
                   </div>
                   <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('roofType')}</span>
                     <input 
                        type="text" 
                        value={lead.roof_type || ''} 
                        onChange={(e) => setLead((prev: any) => ({...prev, roof_type: e.target.value}))}
                        onBlur={(e) => updateLeadField('roof_type', e.target.value)}
                        className="w-full text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-orange-900/20 p-2 rounded-lg border-none outline-none focus:ring-1 ring-orange-500"
                        placeholder="—"
                     />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('howHeard')}</span>
                     <input 
                        type="text" 
                        value={lead.lead_source || ''} 
                        onChange={(e) => setLead((prev: any) => ({...prev, lead_source: e.target.value}))}
                        onBlur={(e) => updateLeadField('lead_source', e.target.value)}
                        className="w-full text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-orange-900/20 p-2 rounded-lg border-none outline-none focus:ring-1 ring-orange-500"
                        placeholder="—"
                     />
                   </div>
                </div>
                <button 
                   onClick={() => toast.success(t('savedAuto'))}
                   className="w-full py-3 bg-orange-500/10 text-orange-500 text-sm font-black uppercase tracking-widest rounded-xl border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all"
                >
                   {t('autosaved')}
                </button>
             </div>
          </div>

           <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
               <FileText size={16} className="text-slate-400 dark:text-orangeNoir-textMuted" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-orangeNoir-textMuted">{t('notesTitle')}</h2>
             </div>
             <textarea 
               value={lead.notes || ''} 
               onChange={(e) => setLead({...lead, notes: e.target.value})}
               onBlur={(e) => updateLeadField('notes', e.target.value)}
                placeholder={t('notesPh')}
               className="w-full p-4 rounded-2xl border border-slate-100 dark:border-orangeNoir-border outline-none text-sm font-medium min-h-[100px] focus:border-orange-500 bg-white dark:bg-orangeNoir-bg transition-all text-slate-900 dark:text-orangeNoir-text shadow-sm resize-none placeholder:text-slate-300 dark:placeholder:text-orange-900/40"
             />
           </div>

          {lead.chat_history && Array.isArray(lead.chat_history) && lead.chat_history.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <MessageSquare size={16} className="text-slate-400 dark:text-orangeNoir-textMuted" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-orangeNoir-textMuted">{t('chatHistTitle')}</h2>
              </div>
              <div className="bg-slate-50 dark:bg-orange-900/20 rounded-2xl border border-slate-100 dark:border-orangeNoir-border p-4 space-y-4 max-h-[400px] overflow-y-auto shadow-inner text-left">
                {lead.chat_history.map((msg: any, idx: number) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1`}>
                    <div className="px-1 text-sm font-bold uppercase text-slate-400 dark:text-orangeNoir-textMuted">
                      {msg.role === 'assistant' ? t('aiTan') : t('customer')}
                    </div>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-white dark:bg-orangeNoir-card text-slate-900 dark:text-orangeNoir-text font-medium rounded-tr-none shadow-sm border border-slate-100 dark:border-orangeNoir-border' 
                        : 'bg-orange-600 dark:bg-orange-600 text-white rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. QR CODE FOR PERSONAL OFFER */}
          <div className="bg-white dark:bg-orangeNoir-card rounded-[2.5rem] border border-slate-100 dark:border-orangeNoir-border p-8 shadow-xl space-y-6 text-center">
             <div className="space-y-1">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Personal Offer QR Code</h2>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t('scanToView')}</p>
             </div>
             
             <div className="flex flex-col items-center gap-6">
                <div className="p-6 bg-white rounded-3xl shadow-inner border border-slate-50 relative group">
                   <Image 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`https://tawanpower.vercel.app/proposal/${encodeId(Number(params.id))}`)}`}
                      alt="Offer QR Code"
                      width={224}
                      height={224}
                      className="w-40 h-40 md:w-56 md:h-56"
                   />
                   <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                </div>
                
                <div className="space-y-3 w-full max-w-sm">
                   <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">
                      {t('qrHint')}
                   </p>
                   <button 
                      onClick={copyProposalLink}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-slate-50 dark:bg-orange-900/20 hover:bg-slate-100 dark:hover:bg-orange-900/40 text-slate-600 dark:text-orange-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                   >
                       <Copy size={14} /> {t('copyProposalLink')}
                   </button>
                </div>
             </div>
          </div>

          <button 
            onClick={async () => {
              if(confirm(t('confirmDelete'))) {
                const res = await fetch(`/api/admin/leads/${params.id}`, { method: 'DELETE' });
                if (res.ok) {
                  window.location.href = '/admin';
                } else {
                  const data = await res.json();
                  alert(t('deleteFail') + `${data.error || 'Unknown error'}`);
                }
              }
            }}
            className="w-full h-14 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 border-2 border-red-200 dark:border-red-900/50 transition-all font-black uppercase tracking-[0.3em] text-sm mt-6"
          >
            {t('dangerZone')}
          </button>

        </main>

        <ProposalPreviewModal
          leadId={params.id}
          tier={lead.equipment_tier}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
    </div>
  );
}
