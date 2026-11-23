'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X } from 'lucide-react';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_lead' | 'line_message' | 'system';
  lead_id?: string;
  timestamp: string;
}

export function useAdminNotifications(onNewLead?: (leadId: string) => void) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: AdminNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    
    if (notification.lead_id && onNewLead) {
      onNewLead(notification.lead_id);
    }
  }, [onNewLead]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-alerts')
      .on('broadcast', { event: 'notification' }, (payload: any) => {
        const notification = payload.payload as AdminNotification;
        addNotification(notification);
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            tag: 'ejjimmy-admin-alert',
            badge: '/icons/icon-192x192.png',
          });
        }
        
        if ('setAppBadge' in navigator) {
          (navigator as any).setAppBadge(unreadCount + 1).catch(console.error);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification, unreadCount]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotification,
  };
}