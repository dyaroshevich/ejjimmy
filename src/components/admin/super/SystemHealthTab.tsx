'use client';

import { Button } from '@/components/ui/button';
import { Cpu, Bell, Webhook, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Loader2, BellRing, Shield, Bug } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PushSubscriptionManager from '@/components/PushSubscriptionManager';
import * as Sentry from '@sentry/nextjs';

type HealthStatus = 'checking' | 'ok' | 'fail' | 'unknown';

interface ServiceHealth {
  name: string;
  key: string;
  icon: React.ReactNode;
  status: HealthStatus;
  latency?: number;
  error?: string;
}

export default function SystemHealthTab() {
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Groq API (แชท)', key: 'groq', icon: <Cpu size={14} />, status: 'checking' },
    { name: 'Gemini API (สมอง)', key: 'gemini', icon: <Cpu size={14} />, status: 'checking' },
    { name: 'LINE Webhook', key: 'line', icon: <Webhook size={14} />, status: 'checking' },
    { name: 'Push (การแจ้งเตือน)', key: 'push', icon: <Bell size={14} />, status: 'checking' },
  ]);
  const [errors, setErrors] = useState<any[]>([]);
  const [pushCount, setPushCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAll();
  }, []);

  async function checkAll() {
    setLoading(true);
    setServices((prev) => prev.map((s) => ({ ...s, status: 'checking' as HealthStatus })));

    await Promise.all([
      checkGroq(),
      checkGemini(),
      checkLineWebhook(),
      checkPush(),
    ]);

    const { data: errData } = await supabase
      .from('api_errors_log')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    setErrors(errData ?? []);
    setLoading(false);
  }

  function updateService(key: string, status: HealthStatus, latency?: number, error?: string) {
    setServices((prev) => prev.map((s) => s.key === key ? { ...s, status, latency, error } : s));
  }

  async function ping(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal as any });
      clearTimeout(timer);
      return res;
    } catch {
      clearTimeout(timer);
      throw new Error('timeout');
    }
  }

  async function checkGroq() {
    try {
      const t0 = Date.now();
      const payload = { messages: [{ role: 'user', content: 'ping' }] };
      const res = await ping('/api/chat', { method: 'POST', body: JSON.stringify(payload) }, 8000);
      updateService('groq', res.ok ? 'ok' : 'fail', Date.now() - t0);
    } catch {
      updateService('groq', 'fail', undefined, 'Connection timeout');
    }
  }

  async function checkGemini() {
    try {
      const t0 = Date.now();
      const payload = { messages: [{ role: 'user', content: 'ping' }] };
      const res = await ping('/api/chat', { method: 'POST', body: JSON.stringify(payload) }, 8000);
      updateService('gemini', res.ok ? 'ok' : 'fail', Date.now() - t0);
    } catch {
      updateService('gemini', 'fail', undefined, 'Connection timeout');
    }
  }

  async function checkLineWebhook() {
    try {
      const res = await ping('/api/line-webhook', { method: 'GET' }, 5000);
      if (res.ok) {
        updateService('line', 'ok', undefined, undefined);
      } else {
        updateService('line', 'fail', undefined, `HTTP ${res.status}`);
      }
    } catch {
      updateService('line', 'fail', undefined, 'Connection timeout');
    }
  }

  async function checkPush() {
    try {
      const { count } = await supabase.from('push_subscriptions').select('id', { count: 'exact', head: true });
      setPushCount(count ?? 0);
      updateService('push', 'ok');
    } catch (e) {
      setPushCount(0);
      updateService('push', 'fail', undefined, (e as Error).message);
    }
  }

  async function testPush(testType: string = 'test') {
    const confirmed = confirm(`ยืนยันการส่งการแจ้งเตือนทดสอบ "${testType}"?`);
    if (!confirmed) return;

    try {
      const broadcastRes = await fetch('/api/notify-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: testType }),
      });

      const broadcastData = await broadcastRes.json();
      
      if (broadcastData.success) {
        alert(`✅ ส่งการทดสอบ "${testType}" สำเร็จ!`);
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${broadcastData.error}`);
      }
      
      checkPush();
    } catch (e: any) {
      alert('❌ เกิดข้อผิดพลาด: ' + e.message);
    }
  }

  function StatusBadge({ status }: { status: HealthStatus }) {
    if (status === 'checking') return <RefreshCw size={12} className="animate-spin text-slate-300 dark:text-orangeNoir-textMuted" />;
    if (status === 'ok') return <CheckCircle2 size={12} className="text-orange-500 dark:text-orange-400" />;
    if (status === 'fail') return <XCircle size={12} className="text-red-500 dark:text-red-400" />;
    return <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-orange-900/40" />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-orange-600 dark:text-orange-400" />
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">สถานะการทำงานของระบบ</h3>
          </div>
          <button onClick={checkAll} disabled={loading} className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors uppercase tracking-widest">
            {loading ? 'กำลังตรวจสอบ...' : 'รีเฟรช'}
          </button>
        </div>
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-orangeNoir-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.status === 'ok' ? 'bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : s.status === 'fail' ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400' : 'bg-slate-50 dark:bg-orange-900/20 text-slate-400 dark:text-orangeNoir-textMuted'}`}>
                  {s.icon}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-orangeNoir-text">{s.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {s.latency && <span className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted">{s.latency}ms</span>}
                {s.error && <span className="text-[9px] font-medium text-red-400 dark:text-red-400">{s.error === 'Connection timeout' ? 'เชื่อมต่อล่าช้า' : s.error}</span>}
                <StatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BellRing size={14} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">การแจ้งเตือน (Push Notifications)</h3>
          <span className="ml-auto text-[10px] font-bold text-orange-600 dark:text-orange-400">{pushCount} อุปกรณ์ที่ลงทะเบียน</span>
        </div>
        
        <PushSubscriptionManager />

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-orangeNoir-border/30">
          <Button 
            onClick={() => testPush('test_lead')}
            variant="outline"
            className="h-11 bg-slate-50 dark:bg-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/40 rounded-xl text-[10px] font-bold text-slate-600 dark:text-orangeNoir-textMuted border-slate-100 dark:border-orangeNoir-border"
          >
            <Bell size={14} className="mr-2 text-orange-500" />
            ทดสอบ ลีดใหม่
          </Button>
          <Button 
            onClick={() => testPush('test_line')}
            variant="outline"
            className="h-11 bg-slate-50 dark:bg-orange-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl text-[10px] font-bold text-slate-600 dark:text-orangeNoir-textMuted border-slate-100 dark:border-orangeNoir-border"
          >
            <Webhook size={14} className="mr-2 text-blue-500" />
            ทดสอบ แชท
          </Button>
          <Button 
            onClick={() => testPush('test_status')}
            variant="outline"
            className="h-11 bg-slate-50 dark:bg-orange-900/20 hover:bg-purple-50 dark:hover:bg-purple-900/40 rounded-xl text-[10px] font-bold text-slate-600 dark:text-orangeNoir-textMuted border-slate-100 dark:border-orangeNoir-border"
          >
            <RefreshCw size={14} className="mr-2 text-purple-500" />
            ทดสอบ สถานะ
          </Button>
          <Button 
            onClick={() => testPush('test_security')}
            variant="outline"
            className="h-11 bg-slate-50 dark:bg-orange-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl text-[10px] font-bold text-slate-600 dark:text-orangeNoir-textMuted border-slate-100 dark:border-orangeNoir-border"
          >
            <Shield size={14} className="mr-2 text-red-500" />
            ทดสอบ ความปลอดภัย
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-orangeNoir-border flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500 dark:text-amber-400" />
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">รายการข้อผิดพลาด API (24 ชม.)</h3>
          <span className="ml-auto text-[10px] font-bold text-amber-500 dark:text-amber-400">{errors.length} รายการ</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-orangeNoir-border/30">
          {errors.map((e) => (
            <div key={e.id} className="p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle size={12} className="text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-orangeNoir-textMuted bg-slate-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">{e.endpoint}</span>
                  <span className="text-[9px] font-medium text-slate-400 dark:text-orange-900/50">{new Date(e.created_at).toLocaleString('th-TH')}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 dark:text-orangeNoir-text mt-1 truncate">
                  {e.error_message
                    .replace('Connection timeout', 'การเชื่อมต่อหมดเวลา')
                    .replace('Failed to fetch', 'ไม่สามารถดึงข้อมูลได้')
                    .replace('Internal Server Error', 'ข้อผิดพลาดภายในเซิร์ฟเวอร์')
                    .replace('Method not allowed', 'ไม่อนุญาตให้ใช้วิธีนี้')
                    .replace('Providers failed', 'ผู้ให้บริการล้มเหลว')
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
