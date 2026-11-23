'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  Newspaper,
  Send,
  BarChart3,
  Building2,
  Settings,
  Zap,
  Menu,
  X,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NewPostModal from '@/components/admin/content/NewPostModal';
import { useTranslations } from 'next-intl';
import { useSite } from '@/lib/site-context';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export default function ContentClientLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('content');
  const { brand, admin, url } = useSite();
  const full = admin.content === 'full';
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // A franchisee gets exactly the two entry points the owner sheet names — Overview and Posts. The
  // business brief stays reachable at /admin/content/brief, just not in the menu; the flagship keeps the
  // whole factory.
  const navGroups: NavGroup[] = full
    ? [
        {
          groupName: t('grpPlan'),
          items: [
            { name: t('navCalendar'), href: '/admin/content/calendar', icon: CalendarDays },
            { name: t('navPipeline'), href: '/admin/content/pipeline', icon: ClipboardList },
            { name: t('navResearch'), href: '/admin/content/research', icon: FileText },
          ],
        },
        {
          groupName: t('grpProduce'),
          items: [
            { name: t('navPosts'), href: '/admin/content/posts', icon: Newspaper },
            { name: t('navGenerator'), href: '/admin/content/generator', icon: FlaskConical },
            { name: t('navLibrary'), href: '/admin/content/library', icon: ImageIcon },
          ],
        },
        {
          groupName: t('grpPublish'),
          items: [
            { name: t('navQueue'), href: '/admin/content/publishing', icon: Send },
            { name: t('navAnalytics'), href: '/admin/content/analytics', icon: BarChart3 },
          ],
        },
        {
          groupName: t('grpManage'),
          items: [
            { name: t('navFranchises'), href: '/admin/content/franchises', icon: Building2 },
            { name: t('navSettings'), href: '/admin/content/settings', icon: Settings },
          ],
        },
      ]
    : [
        {
          groupName: '',
          items: [
            { name: t('navOverview'), href: '/admin/content', icon: LayoutDashboard },
            { name: t('navPosts'), href: '/admin/content/posts', icon: Newspaper },
          ],
        },
      ];

  // Helper to determine active link
  const isActive = (href: string) => {
    if (href === '/admin/content') {
      return pathname === '/admin/content';
    }
    return pathname.startsWith(href);
  };

  // Get current page title for header
  const getPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (isActive(item.href)) {
          return item.name;
        }
      }
    }
    return brand.name;
  };

  if (!mounted) return null;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar text-orangeLight-text dark:text-orangeNoir-text border-r border-orangeLight-border dark:border-orangeNoir-border select-none">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-orangeLight-border dark:border-orangeNoir-border">
        <div className="p-2 bg-orange-500 rounded-lg text-white">
          <Zap size={20} className="fill-current" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight">{brand.name}</h1>
          <span className="text-[10px] font-mono tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase">
            {admin.contentLabel ?? 'Content'}
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.groupName && (
              <h3 className="px-6 text-[10px] font-mono font-black tracking-wider text-orangeLight-textMuted/60 dark:text-orangeNoir-textMuted/40 uppercase mb-2">
                {group.groupName}
              </h3>
            )}
            <div className="space-y-[2px]">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-6 py-2.5 text-sm transition-all border-l-[3px] relative ${
                      active
                        ? 'bg-orange-500/5 border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'border-transparent text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:bg-orange-500/5 hover:text-orangeLight-text dark:hover:text-orangeNoir-text'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer User Section */}
      <div className="p-4 border-t border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-bg/50 dark:bg-orangeNoir-bg/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-mono font-bold text-orange-600 dark:text-orange-400 text-sm">
            ผด
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-orangeLight-text dark:text-orangeNoir-text truncate">
              {t('adminRole')}
            </h4>
            <p className="text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted truncate">
              admin@{new URL(url).hostname}
            </p>
          </div>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border hover:bg-orange-500/5 text-orangeLight-textMuted dark:text-orangeNoir-textMuted"
            title="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-orangeLight-bg dark:bg-orangeNoir-bg text-orangeLight-text dark:text-orangeNoir-text flex min-h-screen">
      {/* Desktop Sidebar — restored per user preference for dual-sidebar layout */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar">
        {sidebarContent}
      </aside>

      {/* Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border hover:bg-orange-500/5"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500 rounded-lg text-white">
                <Zap size={16} className="fill-current" />
              </div>
              <h2 className="text-sm font-extrabold tracking-tight">{getPageTitle()}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t('newPost')}</span>
            </button>
          </div>
        </header>

        {/* Horizontal Sub-Navigation — Only visible on mobile, redundant on desktop with the new sidebar */}
        <nav className="lg:hidden flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar overflow-x-auto">
          {navGroups.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              {group.groupName && (
                <span className="text-[9px] font-mono font-bold tracking-wider text-orangeLight-textMuted/40 dark:text-orangeNoir-textMuted/30 uppercase px-2 select-none">
                  {group.groupName}
                </span>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                        : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:bg-orange-500/5 hover:text-orangeLight-text dark:hover:text-orangeNoir-text border border-transparent'
                    }`}
                  >
                    <item.icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Content Area — Ensure full height and proper padding */}
        <main className="flex-1 overflow-y-auto bg-orangeLight-bg dark:bg-orangeNoir-bg min-h-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-40 lg:hidden shadow-2xl"
            >
              <div className="h-full relative">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border z-10"
                >
                  <X size={16} />
                </button>
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <NewPostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
