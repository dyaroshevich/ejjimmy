'use client';

import React from 'react';
import { 
  Share2, 
  Facebook, 
  MessageCircle, 
  Send, 
  Search, 
  BarChart3, 
  ExternalLink,
  Users,
  MousePointer2,
  TrendingUp
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const CHANNELS = [
  { 
    id: 'facebook', 
    name: 'Facebook Page', 
    icon: Facebook, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    stats: { followers: '12.4K', reach: '+15%', engagement: '4.2%' }
  },
  { 
    id: 'line', 
    name: 'LINE Official', 
    icon: MessageCircle, 
    color: 'text-green-500', 
    bg: 'bg-green-50',
    stats: { followers: '8.2K', open_rate: '68%', ctr: '12.5%' }
  },
  { 
    id: 'seo', 
    name: 'Search (SEO)', 
    icon: Search, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50',
    stats: { monthly_views: '24K', keywords: '142', ranking: 'Top 3' }
  },
  { 
    id: 'broadcast', 
    name: 'Newsletter', 
    icon: Send, 
    color: 'text-purple-500', 
    bg: 'bg-purple-50',
    stats: { subscribers: '3.1K', deliverability: '99%', clicks: '450' }
  },
];

export default function DistributionPage() {
  const t = useTranslations('content');
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Distribution & Channels</h1>
          <p className="text-slate-500">{t('distSub')}</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold">
          <Share2 className="w-4 h-4" />
          <span>{t('distBroadcast')}</span>
        </button>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CHANNELS.map((channel) => (
          <div key={channel.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${channel.bg}`}>
                <channel.icon className={`w-6 h-6 ${channel.color}`} />
              </div>
              <button className="text-slate-400 hover:text-slate-900">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{channel.name}</h3>
            <div className="flex items-center gap-1.5 text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-bold">Active</span>
            </div>
            
            <div className="mt-6 space-y-3 pt-6 border-t border-slate-50">
              {Object.entries(channel.stats).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 capitalize">{key.replace('_', ' ')}</span>
                  <span className="text-sm font-bold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">{t('distLatest')}</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">{t('distViewAll')}</button>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { title: 'วิธีลดค่าไฟ 100% ด้วย 10kW', date: '2 วันที่แล้ว', views: '2,450', engagement: '180' },
              { title: 'รีวิว Sigenergy รุ่น 5kWh', date: '5 วันที่แล้ว', views: '1,200', engagement: '95' },
              { title: 'สิทธิประโยชน์ทางภาษี 2026', date: '1 สัปดาห์ที่แล้ว', views: '3,800', engagement: '310' },
            ].map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-900">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-bold">{item.views}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Views</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-900">
                      <MousePointer2 className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-bold">{item.engagement}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Engagement</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            Quick Broadcast
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
              <h4 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">{t('distLine')}</h4>
              <p className="text-xs text-slate-400">{t('distLineSub')}</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
              <h4 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">{t('distFb')}</h4>
              <p className="text-xs text-slate-400">{t('distFbSub')}</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
              <h4 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">{t('distSeo')}</h4>
              <p className="text-xs text-slate-400">{t('distSeoSub')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
