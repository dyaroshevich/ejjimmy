'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X, MessageSquare, UserPlus, AlertTriangle, Zap, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_lead' | 'line_message' | 'system';
  lead_id?: string;
  timestamp: string;
}

interface NotificationToastProps {
  notification: AdminNotification;
  onDismiss: () => void;
  onClick: () => void;
}

function NotificationToast({ notification, onDismiss, onClick }: NotificationToastProps) {
  const icons = {
    new_lead: <UserPlus size={18} />,
    line_message: <MessageSquare size={18} />,
    system: <AlertTriangle size={18} />,
    status_change: <Zap size={18} />,
    security_alert: <Shield size={18} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-white dark:bg-orangeNoir-card rounded-2xl shadow-2xl border border-orange-200 dark:border-orange-600/30 p-4 pr-10 relative w-full md:max-w-sm cursor-pointer hover:shadow-lg transition-shadow"
      style={{ zIndex: 9999 }}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
          {icons[notification.type] || <Bell size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-orange-900 dark:text-orangeNoir-text truncate">
            {notification.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-orangeNoir-textMuted mt-0.5">
            {notification.message}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationHandler() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [channelStatus, setChannelStatus] = useState<string>('initializing');
  const router = useRouter();
  
  const unreadCountRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    console.log('[NotificationHandler] Setting up Supabase channel...');

    const channel = supabase.channel('admin-alerts');

    channel
      .on('broadcast', { event: 'notification' }, (payload: any) => {
        console.log('[NotificationHandler] Broadcast received:', payload.payload);
        
        const notification = payload.payload as AdminNotification;
        
        setNotifications(prev => {
          const exists = prev.find(n => n.id === notification.id);
          if (exists) return prev;
          return [notification, ...prev].slice(0, 20);
        });
        
        unreadCountRef.current += 1;
        setUnreadCount(unreadCountRef.current);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            tag: 'tawan-admin',
            badge: '/icons/icon-192x192.png',
          });
        }

        if ('setAppBadge' in navigator) {
          (navigator as any).setAppBadge(unreadCountRef.current).catch(console.error);
        }

        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 8000);
      })
      .subscribe((status: any) => {
        console.log('[NotificationHandler] Channel status:', status);
        setChannelStatus(status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[NotificationHandler] Cleaning up channel');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const handleNotificationClick = (notification: AdminNotification) => {
    console.log('[NotificationHandler] Notification clicked:', notification.id);
    if (notification.lead_id) {
      router.push(`/admin/leads/${notification.lead_id}`);
    }
    dismissNotification(notification.id);
  };

  const dismissNotification = (id: string) => {
    console.log('[NotificationHandler] Dismissing notification:', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <button
        onClick={() => {
          console.log('[NotificationHandler] Bell clicked, panel:', !showPanel);
          setShowPanel(!showPanel);
          if (!showPanel) {
            unreadCountRef.current = 0;
            setUnreadCount(0);
          }
        }}
        className="relative p-3 rounded-xl bg-orangeLight-card dark:bg-orangeNoir-card hover:bg-orange-50 dark:hover:bg-orange-900/50 transition-colors border border-orangeLight-border dark:border-orangeNoir-border"
        title={`Notifications: ${channelStatus}`}
      >
        <Bell size={20} className="text-orange-600 dark:text-orange-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div 
        className="fixed left-4 right-4 top-4 md:left-auto md:right-6 md:top-6 flex flex-col gap-3 pointer-events-none z-[9999]"
      >
        <AnimatePresence mode="popLayout">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationToast
                notification={notification}
                onDismiss={() => dismissNotification(notification.id)}
                onClick={() => handleNotificationClick(notification)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}