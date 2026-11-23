'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, User, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLeadModal({ isOpen, onClose, onSuccess }: Props) {
  const t = useTranslations('admin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error(t('clNeedName'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...formData,
          source: 'admin_manual',
          status: 'ใหม่',
          unread: false
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success(t('clCreated'));
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(t('genericError') + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-orangeNoir-card w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/5 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
        >
          <X size={20} />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600">
              <Plus size={24} strokeWidth={3} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{t('clTitle')}</h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest mt-1">Manual Lead Entry</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label htmlFor="clName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <User size={12} /> {t('clName')}
              </label>
              <input id="clName"
                autoFocus
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('clNamePh')}
                className="w-full h-12 px-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:ring-2 ring-orange-500/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="clPhone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Phone size={12} /> {t('clPhone')}
              </label>
              <input id="clPhone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08x-xxx-xxxx"
                className="w-full h-12 px-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:ring-2 ring-orange-500/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="clEmail" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Mail size={12} /> {t('clEmail')}
              </label>
              <input id="clEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@email.com"
                className="w-full h-12 px-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:ring-2 ring-orange-500/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="clLocation" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <MapPin size={12} /> {t('clLocation')}
              </label>
              <input id="clLocation"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('clLocationPh')}
                className="w-full h-12 px-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:ring-2 ring-orange-500/10 outline-none transition-all"
              />
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-orange-600 dark:hover:bg-orange-400 dark:hover:text-white transition-all active:scale-[0.97] shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : t('clSubmit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
