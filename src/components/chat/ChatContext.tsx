'use client';

import { createContext, useContext } from 'react';

export interface ChatContextValue {
  isChatOpen: boolean;
  initialSegment: 'home' | 'business';
  initialAction: 'voice' | null;
  initialMessage: string | null;
  openChat: (segment?: 'home' | 'business', action?: 'voice' | null, message?: string | null) => void;
  closeChat: () => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatShell');
  return ctx;
}
