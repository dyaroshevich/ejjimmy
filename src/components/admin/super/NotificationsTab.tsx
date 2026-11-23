'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Shield, MessageSquare, UserCheck, Save, Loader2 } from 'lucide-react';

interface NotificationSettings {
  leads_enabled: boolean;
  chat_enabled: boolean;
  alerts_enabled: boolean;
  status_changes_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export default function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings yet, create default
        const defaults = {
          user_id: user.id,
          leads_enabled: true,
          chat_enabled: true,
          alerts_enabled: true,
          status_changes_enabled: true,
          quiet_hours_enabled: true,
          quiet_hours_start: '22:00:00',
          quiet_hours_end: '08:00:00'
        };
        const { data: newData, error: createError } = await supabase
          .from('user_notification_settings')
          .insert(defaults)
          .select()
          .single();
        
        if (createError) throw createError;
        setSettings(newData);
      } else if (error) {
        throw error;
      } else {
        setSettings(data);
      }
    } catch (err: any) {
      console.error('Fetch settings error:', err);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_notification_settings')
        .update({
          leads_enabled: settings.leads_enabled,
          chat_enabled: settings.chat_enabled,
          alerts_enabled: settings.alerts_enabled,
          status_changes_enabled: settings.status_changes_enabled,
          quiet_hours_enabled: settings.quiet_hours_enabled,
          quiet_hours_start: settings.quiet_hours_start,
          quiet_hours_end: settings.quiet_hours_end,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="animate-spin text-orange-600 dark:text-orange-400" size={32} />
        <p className="text-xs font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest">กำลังโหลดการตั้งค่า...</p>
      </div>
    );
  }

  if (!settings) return null;

  const toggle = (key: keyof NotificationSettings) => {
    setSettings(prev => prev ? { ...prev, [key]: !prev[key] } : null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 dark:border-orangeNoir-border/30">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-orange-600 dark:text-orange-400" />
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">ช่องทางการแจ้งเตือน</h3>
          </div>
        </div>
        
        <div className="p-2 divide-y divide-slate-50 dark:divide-orangeNoir-border/20">
          {/* Leads */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <UserCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-orange-50">ลีดใหม่</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted">รับการแจ้งเตือนเมื่อมีลูกค้าใหม่ติดต่อเข้ามา</p>
              </div>
            </div>
            <Switch checked={settings.leads_enabled} onChange={() => toggle('leads_enabled')} />
          </div>

          {/* Chat */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-orange-50">ข้อความ LINE</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted">การแจ้งเตือนแชทแบบเรียลไทม์จาก LINE</p>
              </div>
            </div>
            <Switch checked={settings.chat_enabled} onChange={() => toggle('chat_enabled')} />
          </div>

          {/* Status Changes */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-orange-50">อัปเดตสถานะ</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted">แจ้งเตือนเมื่อสถานะของลีดมีการเปลี่ยนแปลง</p>
              </div>
            </div>
            <Switch checked={settings.status_changes_enabled} onChange={() => toggle('status_changes_enabled')} />
          </div>

          {/* Alerts */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-orange-50">แจ้งเตือนระบบ</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted">การแจ้งเตือนสถานะระบบและประสิทธิภาพที่สำคัญ</p>
              </div>
            </div>
            <Switch checked={settings.alerts_enabled} onChange={() => toggle('alerts_enabled')} />
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 dark:border-orangeNoir-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-orange-600 dark:text-orange-400" />
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">ช่วงเวลาห้ามรบกวน (Quiet Hours)</h3>
          </div>
          <Switch checked={settings.quiet_hours_enabled} onChange={() => toggle('quiet_hours_enabled')} />
        </div>
        
        <div className={`p-6 transition-all duration-300 ${settings.quiet_hours_enabled ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quietHoursStart" className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-wider">เวลาเริ่มต้น</label>
              <input id="quietHoursStart" 
                type="time" 
                value={settings.quiet_hours_start.substring(0, 5)}
                onChange={(e) => setSettings(prev => prev ? { ...prev, quiet_hours_start: e.target.value + ':00' } : null)}
                className="w-full bg-slate-50 dark:bg-orangeNoir-bg border border-slate-100 dark:border-orangeNoir-border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="quietHoursEnd" className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-wider">เวลาสิ้นสุด</label>
              <input id="quietHoursEnd" 
                type="time" 
                value={settings.quiet_hours_end.substring(0, 5)}
                onChange={(e) => setSettings(prev => prev ? { ...prev, quiet_hours_end: e.target.value + ':00' } : null)}
                className="w-full bg-slate-50 dark:bg-orangeNoir-bg border border-slate-100 dark:border-orangeNoir-border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted italic">
            * การแจ้งเตือนจะถูกระงับในช่วงเวลานี้ (ตามเวลาประเทศไทย GMT+7)
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold animate-in zoom-in-95 ${message.type === 'success' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
          {message.type === 'success' ? 'บันทึกการตั้งค่าเรียบร้อยแล้ว!' : message.text}
        </div>
      )}

      <Button 
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 bg-orange-600 hover:bg-orange-500 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20"
      >
        {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
        บันทึกการตั้งค่าการแจ้งเตือน
      </Button>
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-orange-500' : 'bg-slate-200 dark:bg-orange-900/40'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}
