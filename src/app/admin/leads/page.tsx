'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Phone,
  MessageSquare,
  Trash2,
  Search,
  ChevronRight,
  Globe,
  Clock,
  Plus
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { normalizeStatus } from '@/lib/lead-status';

export default function LeadsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleCreateLead = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('ejjimmy_leads')
        .insert([{
          name: 'ลูกค้าใหม่',
          source: 'admin_manual',
          status: 'ใหม่',
          unread: false
        }])
        .select()
        .single();

      if (error) throw error;
      router.push(`/admin/leads/${data.id}`);
    } catch (err: any) {
      console.error(err);
      setCreating(false);
    }
  };

  async function fetchLeads() {
    setLoading(true);
    const { data } = await supabase
      .from('ejjimmy_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l =>
    (l.name?.toLowerCase().includes(search.toLowerCase())) ||
    (l.phone?.includes(search))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 text-left">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-slate-500 dark:text-orangeNoir-textMuted hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-orange-900/30">   
              <ArrowLeft size={20}/>
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-orangeNoir-text uppercase tracking-tighter leading-none">{t('leadsTitle')}</h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest mt-1">{t('leadsCount', { n: leads.length })}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={handleCreateLead}
            disabled={creating}
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-2 h-11 text-sm font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 flex items-center gap-2"
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={3} />}
            {t('newLead')}
          </Button>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-orange-900" size={16} />
            <input
              type="text"
              placeholder={t('searchPh')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 bg-white dark:bg-orangeNoir-card border border-slate-100 dark:border-orangeNoir-border rounded-full pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-all text-slate-900 dark:text-orangeNoir-text"
            />
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-orange-500" size={40}/>
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">{t('loading')}</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-24 text-center">
            <Search className="mx-auto mb-4 text-slate-200 dark:text-orange-950" size={48}/>
            <p className="text-sm font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-wider">{t('empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-orangeNoir-border/30">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="p-5 md:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-orange-900/10 transition-all group">
                <Link href={`/admin/leads/${lead.id}`} className="flex-1 min-w-0 flex items-center gap-4">      
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-transparent transition-all ${
                    lead.unread
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                      : 'bg-slate-50 dark:bg-orangeNoir-input text-slate-400 dark:text-orangeNoir-textMuted border-slate-100 dark:border-white/5'  
                  }`}>
                    {lead.source === 'chat' ? <MessageSquare size={20} /> : <Globe size={20} />}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-orangeNoir-text truncate tracking-tight">{lead.name || 'Anonymous'}</p>
                      {lead.unread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border-none ${
                        normalizeStatus(lead.status) === 'ติดตั้งแล้ว' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                        normalizeStatus(lead.status) === 'ยกเลิก' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                        'bg-slate-100 text-slate-600 dark:bg-orangeNoir-input dark:text-orangeNoir-textMuted' 
                      }`}>
                        {normalizeStatus(lead.status) === 'ใหม่' ? t('stNew') :
                         normalizeStatus(lead.status) === 'ติดตั้งแล้ว' ? t('stWon') :
                         normalizeStatus(lead.status) === 'ยกเลิก' ? t('stLost') :
                         lead.status || t('stNew')}
                      </Badge>
                      <span className="opacity-30 text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-300 dark:text-orange-900/50 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(lead.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="p-2.5 bg-slate-50 dark:bg-orangeNoir-input text-slate-300 dark:text-orange-900 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 transition-all border border-transparent hover:border-orange-100 dark:hover:border-orange-800 rounded-xl">
                      <Phone size={18}/>
                    </a>
                  )}
                  <Link href={`/admin/leads/${lead.id}`}>
                    <div className="p-2.5 text-slate-300 dark:text-orange-900 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-all">
                      <ChevronRight size={20}/>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

