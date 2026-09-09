'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MessageSquare, Compass, Settings,
  ChevronLeft, ChevronRight, Search, SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { groupByDate } from '@/lib/utils/format';
import { BrandMark } from './BrandMark';
import { useConversationStore } from '@/features/conversations/conversation-store';
import { useConnectors } from '@/features/connectors/connector-context';
import { ConversationItem } from '@/components/conversations/ConversationItem';
import { DeleteConversationDialog } from '@/components/conversations/DeleteConversationDialog';
import type { ConversationMenuAction } from '@/components/conversations/ConversationItem';
import type { StoredConversation } from '@/features/conversations/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function OmniArenaLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="px-1 py-1">
      <BrandMark label={!collapsed} />
    </div>
  );
}

function ConversationGroup({ label, conversations, collapsed, onAction, renamingId, onRenameSubmit, onRenameCancel }: {
  label: string;
  conversations: StoredConversation[];
  collapsed: boolean;
  onAction: (action: ConversationMenuAction, conversation: StoredConversation) => void;
  renamingId: string | null;
  onRenameSubmit: (conversationId: string, title: string) => void;
  onRenameCancel: () => void;
}) {
  if (collapsed) return null;
  return (
    <div className="mb-1">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </p>
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          onAction={onAction}
          renaming={renamingId === conv.id}
          onRenameSubmit={(title) => onRenameSubmit(conv.id, title)}
          onRenameCancel={onRenameCancel}
        />
      ))}
    </div>
  );
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    conversations,
    createConversation,
    renameConversation,
    setConversationPinned,
    deleteConversation,
  } = useConversationStore();
  const { openModal } = useConnectors();
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StoredConversation | null>(null);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => conversation.title.toLowerCase().includes(query));
  }, [conversations, search]);

  // Pinned conversations float above the chronological groups.
  const pinnedConversations = useMemo(
    () => filteredConversations.filter((conversation) => conversation.isPinned),
    [filteredConversations]
  );
  const unpinnedConversations = useMemo(
    () => filteredConversations.filter((conversation) => !conversation.isPinned),
    [filteredConversations]
  );
  const groups = groupByDate(unpinnedConversations);

  const handleNewArena = () => {
    const conversation = createConversation();
    router.push(`/app/chat/${conversation.id}`);
  };

  const handleConversationAction = (action: ConversationMenuAction, conversation: StoredConversation) => {
    switch (action) {
      case 'rename':
        setRenamingId(conversation.id);
        break;
      case 'pin':
        setConversationPinned(conversation.id, true);
        break;
      case 'unpin':
        setConversationPinned(conversation.id, false);
        break;
      case 'delete':
        setPendingDelete(conversation);
        break;
    }
  };

  const handleRenameSubmit = (conversationId: string, title: string) => {
    renameConversation(conversationId, title);
    setRenamingId(null);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDelete) return;
    const wasActive = pathname === `/app/chat/${pendingDelete.id}`;
    deleteConversation(pendingDelete.id);
    setPendingDelete(null);
    if (wasActive) {
      // Deleted the open Arena → fall back to a fresh empty one.
      router.replace('/app');
    }
  };

  const isModelsActive = pathname.startsWith('/app/models');
  const isSettingsActive = pathname.startsWith('/app/settings');

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

        {/* New Arena button */}
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
              className="px-2 pb-3"
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
                {pinnedConversations.length > 0 && (
                  <ConversationGroup
                    label="Pinned"
                    conversations={pinnedConversations}
                    collapsed={!isOpen}
                    onAction={handleConversationAction}
                    renamingId={renamingId}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={() => setRenamingId(null)}
                  />
                )}
                {Object.entries(groups).map(([label, convs]) => (
                  <ConversationGroup
                    key={label}
                    label={label}
                    conversations={convs}
                    collapsed={!isOpen}
                    onAction={handleConversationAction}
                    renamingId={renamingId}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={() => setRenamingId(null)}
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

        {/* Navigation Actions: Explore Models + Manage Connectors */}
        <div className="border-t border-border-subtle px-2 py-2 space-y-1">
          <Link
            href="/app/models"
            title={!isOpen ? 'Explore Models' : undefined}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-btn text-xs font-medium transition-colors',
              !isOpen && 'justify-center px-0 w-9 h-9 mx-auto',
              isModelsActive
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            )}
          >
            <Compass size={15} className="flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Explore Models
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            onClick={openModal}
            title={!isOpen ? 'Manage Connectors' : undefined}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-btn text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-left',
              !isOpen && 'justify-center px-0 w-9 h-9 mx-auto'
            )}
          >
            <SlidersHorizontal size={15} className="flex-shrink-0 text-accent" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Manage Connectors
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Bottom Bar: Settings + User Profile */}
        <div className="border-t border-border-subtle px-2 py-2.5 space-y-1">
          <Link
            href="/app/settings"
            title={!isOpen ? 'Settings' : undefined}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-btn text-xs font-medium transition-colors',
              !isOpen && 'justify-center px-0 w-9 h-9 mx-auto',
              isSettingsActive
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            )}
          >
            <Settings size={15} className="flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User Profile */}
          <div
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-btn cursor-pointer hover:bg-bg-elevated transition-colors pt-1.5',
              !isOpen && 'justify-center px-0'
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

      {/* Delete confirmation — nothing is removed without explicit confirm */}
      {pendingDelete && (
        <DeleteConversationDialog
          conversationTitle={pendingDelete.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}

