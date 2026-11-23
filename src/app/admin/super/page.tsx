'use client';

import { Cpu, Database, MessageSquare, Activity, Bell, List } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const AIConfigTab = dynamic(() => import('@/components/admin/super/AIConfigTab'), { ssr: false });
const KnowledgeTab = dynamic(() => import('@/components/admin/super/KnowledgeTab'), { ssr: false });
const ChatHubTab = dynamic(() => import('@/components/admin/super/ChatHubTab'), { ssr: false });
const SystemHealthTab = dynamic(() => import('@/components/admin/super/SystemHealthTab'), { ssr: false });
const NotificationsTab = dynamic(() => import('@/components/admin/super/NotificationsTab'), { ssr: false });
const QuizTab = dynamic(() => import('@/components/admin/super/QuizTab').then(m => m.QuizTab), { ssr: false });

const TabFallback = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="animate-spin text-orange-600" size={32} />
  </div>
);

type SuperTab = 'ai' | 'knowledge' | 'chat' | 'health' | 'notifications' | 'quiz';

export default function SuperAdminPage() {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<SuperTab>('quiz');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

   const tabs = [
     { id: 'quiz' as const, label: t('tabQuiz'), icon: <List size={14} /> },
     { id: 'ai' as const, label: t('tabAi'), icon: <Cpu size={14} /> },
     { id: 'knowledge' as const, label: t('tabKnowledge'), icon: <Database size={14} /> },
     { id: 'chat' as const, label: t('tabChat'), icon: <MessageSquare size={14} /> },
     { id: 'notifications' as const, label: t('tabNotif'), icon: <Bell size={14} /> },
     { id: 'health' as const, label: t('tabHealth'), icon: <Activity size={14} /> },
   ];

  if (!mounted) return null;

   return (
     <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
       <nav className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
               activeTab === tab.id
                 ? 'bg-orange-50 dark:bg-orangeNoir-card text-orange-700 dark:text-orangeNoir-accent border border-slate-200 dark:border-orangeNoir-border'
                 : 'bg-slate-50 dark:bg-orangeNoir-card text-slate-500 dark:text-orangeNoir-textMuted hover:bg-slate-100 dark:hover:bg-orangeNoir-cardHover'
             }`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
       </nav>

       <Suspense fallback={<TabFallback />}>
        {activeTab === 'ai' && <AIConfigTab />}
        {activeTab === 'knowledge' && <KnowledgeTab />}
        {activeTab === 'chat' && <ChatHubTab />}
        {activeTab === 'quiz' && <QuizTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'health' && <SystemHealthTab />}
       </Suspense>
     </div>
   );
}