'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import SolarChat from '@/components/SolarChat';
import { landingAnchor } from '@/lib/locale-path';
import { ChatContext, ChatContextValue } from './ChatContext';

export default function ChatShell({ children }: { children: ReactNode }) {
  const t = useTranslations('shell');
  const pathname = usePathname() ?? '/';
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialSegment, setInitialSegment] = useState<'home' | 'business'>('home');
  const [initialAction, setInitialAction] = useState<'voice' | null>(null);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // The AI bar is pinned to the bottom, so it lands on the footer's copyright row. Hide it
  // once the footer's top reaches the bar's line (100px up from the viewport bottom).
  useEffect(() => {
    const footer = document.querySelector('footer.site-footer');
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -100px 0px' }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const openChat = useCallback((segment?: 'home' | 'business', action?: 'voice' | null, message?: string | null) => {
    if (segment) setInitialSegment(segment);
    if (action) setInitialAction(action);
    if (message) setInitialMessage(message);
    else setInitialMessage(null);

    sessionStorage.setItem('tawan_chat_intent', JSON.stringify({
      segment: segment || initialSegment,
      action: action || null,
      message: message || null,
      timestamp: Date.now()
    }));

    setIsChatOpen(true);
  }, [initialSegment]);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setInitialAction(null);
    setInitialMessage(null);
    // openChat parks the intent for the 30 s handoff; a deliberate close must
    // not leave a reload reopening the panel.
    sessionStorage.removeItem('tawan_chat_intent');
  }, []);

  // Lock background scroll while the chat is open, preserving scroll position
  useEffect(() => {
    if (!isChatOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isChatOpen]);

  useEffect(() => {
    const saved = sessionStorage.getItem('tawan_chat_intent');
    if (saved) {
      try {
        const intent = JSON.parse(saved);
        if (Date.now() - intent.timestamp < 30000) {
          setInitialSegment(intent.segment);
          setInitialAction(intent.action);
          setInitialMessage(intent.message);
          setIsChatOpen(true);
        }
        sessionStorage.removeItem('tawan_chat_intent');
      } catch {
        console.warn('Failed to restore chat intent');
      }
    }
  }, []);

  const ctx: ChatContextValue = {
    isChatOpen,
    initialSegment, initialAction, initialMessage,
    openChat, closeChat,
  };

  return (
    <ChatContext.Provider value={ctx}>
      {children}

      {/* Chat Modal — mobile: full-screen overlay, desktop: right side panel */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {isDesktop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeChat}
                className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm cursor-pointer pointer-events-auto"
                aria-label={t('closeChat')}
              />
            )}
            <motion.div
              initial={isDesktop ? { x: '100%' } : { opacity: 0, scale: 0.95 }}
              animate={isDesktop ? { x: 0 } : { opacity: 1, scale: 1 }}
              exit={isDesktop ? { x: '100%' } : { opacity: 0, scale: 0.95 }}
              transition={isDesktop ? { type: 'spring', damping: 25, stiffness: 200 } : { duration: 0.2 }}
              className={`fixed z-[101] bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden pointer-events-auto
                ${isDesktop
                  ? 'inset-y-0 right-0 left-auto top-0 bottom-auto rounded-l-[2.5rem]'
                  : 'inset-0 rounded-none'
                }`}
              style={isDesktop
                ? { width: '25vw', minWidth: '360px', maxWidth: '480px', height: '100dvh' }
                : { height: '100dvh' }
              }
            >
              {!isDesktop && <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2 flex-shrink-0 opacity-50" role="separator" aria-hidden="true" />}
              <SolarChat
                onClose={closeChat}
                initialSegment={initialSegment}
                initialAction={initialAction}
                initialMessage={initialMessage}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sticky AI bar — the approved band. Its href is the mock's #contact on the landing and
          the landing anchor elsewhere, kept as the no-JS fallback; the click opens the AI
          overlay, which cannot live in a static mock. */}
      {!isChatOpen && !atFooter && (
        <div className="ai-bar" data-od-id="uni-ai-bar">
          <a
            className="ai-bar-inner"
            href={landingAnchor(pathname, '/#contact')}
            aria-label={t('chatLabel')}
            onClick={(e) => { e.preventDefault(); openChat(); }}
          >
            <span className="ai-bar-text">
              <small>{t('stickyTag')}</small>
              <b>{t('stickyHint')}</b>
            </span>
            <span className="ai-bar-mic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </span>
            <span className="ai-bar-send" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
          </a>
        </div>
      )}
    </ChatContext.Provider>
  );
}
