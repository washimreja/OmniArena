'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MessageSquare, Compass, Settings,
  ChevronLeft, ChevronRight, Search, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { truncate, groupByDate } from '@/lib/utils/format';
import { BrandMark } from './BrandMark';
import { useConversationStore } from '@/features/conversations/conversation-store';
import type { StoredConversation } from '@/features/conversations/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function OmniArenaLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="px-2 py-1">
      <BrandMark label={!collapsed} />
    </div>
  );
}

function ConversationGroup({ label, conversations, collapsed }: {
  label: string;
  conversations: StoredConversation[];
  collapsed: boolean;
}) {
  const pathname = usePathname();
  if (collapsed) return null;
  return (
    <div className="mb-1">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </p>
      {conversations.map((conv) => {
        const isActive = pathname === `/app/chat/${conv.id}`;
        return (
          <Link
            key={conv.id}
            href={`/app/chat/${conv.id}`}
            className={cn(
              'flex items-center gap-2 px-3 py-2 mx-1 rounded-lg text-sm transition-colors group',
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            )}
          >
            <Clock size={13} className="flex-shrink-0 opacity-50" />
            <span className="truncate text-xs leading-snug">
              {truncate(conv.title, 38)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { conversations, createConversation } = useConversationStore();
  const [search, setSearch] = useState('');
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => conversation.title.toLowerCase().includes(query));
  }, [conversations, search]);
  const groups = groupByDate(filteredConversations);

  const handleNewArena = () => {
    const conversation = createConversation();
    router.push(`/app/chat/${conversation.id}`);
  };

  const navItems = [
    { href: '/app/models', icon: Compass, label: 'Explore Models' },
    { href: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 232 : 56 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col bg-[#0D0D15] border-r border-border-subtle h-full z-30 flex-shrink-0 overflow-hidden"
      >
        {/* Top: Logo + Toggle */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border-subtle min-h-[60px]">
          <OmniArenaLogo collapsed={!isOpen} />
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* New Chat button */}
        <div className={cn('px-2 pt-4 pb-3', !isOpen && 'flex justify-center')}>
          <button
            type="button"
            onClick={handleNewArena}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-btn border border-accent/40 bg-accent/90 text-white text-sm font-medium hover:bg-accent transition-colors w-full',
              !isOpen && 'w-9 h-9 justify-center px-0'
            )}
          >
            <Plus size={16} className="flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  New Arena
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Search */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-2 pb-4"
            >
              <div className="flex items-center gap-2 px-2.5 py-2 bg-bg-surface rounded-btn border border-border-subtle focus-within:border-border-strong transition-colors">
                <Search size={13} className="text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto py-1 min-h-0">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Object.entries(groups).map(([label, convs]) => (
                  <ConversationGroup
                    key={label}
                    label={label}
                    conversations={convs}
                    collapsed={!isOpen}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {!isOpen && (
            <div className="flex flex-col items-center gap-1 py-2">
              {filteredConversations.slice(0, 5).map((conv) => (
                <Link
                  key={conv.id}
                  href={`/app/chat/${conv.id}`}
                  title={conv.title}
                  className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <MessageSquare size={13} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="border-t border-border-subtle px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isOpen ? item.label : undefined}
                className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-btn text-sm transition-colors',
                  !isOpen && 'justify-center',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                <item.icon size={16} className="flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap text-xs"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* User */}
          <div
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-btn cursor-pointer hover:bg-bg-elevated transition-colors mt-2',
              !isOpen && 'justify-center'
            )}
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-accent">W</span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-medium text-text-primary whitespace-nowrap">Washim</p>
                  <p className="text-[10px] text-text-muted whitespace-nowrap">Free Plan</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
