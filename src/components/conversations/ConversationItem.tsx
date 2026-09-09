'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { truncate } from '@/lib/utils/format';
import { MAX_CONVERSATION_TITLE_LENGTH } from '@/features/conversations/conversation-store';
import type { StoredConversation } from '@/features/conversations/types';

export type ConversationMenuAction = 'rename' | 'pin' | 'unpin' | 'delete';

interface ConversationItemProps {
  conversation: StoredConversation;
  /** Limits inline menu overlap in narrow rows. */
  maxTitleLength?: number;
  onAction: (action: ConversationMenuAction, conversation: StoredConversation) => void;
  renaming?: boolean;
  onRenameSubmit?: (title: string) => void;
  onRenameCancel?: () => void;
}

/**
 * Inline rename editor. Enter saves, Escape cancels, blur saves.
 * Lives in its own component so it remounts (and re-seeds its draft)
 * per rename session without effects.
 */
function RenameInput({
  initialTitle,
  onSubmit,
  onCancel,
}: {
  initialTitle: string;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    onSubmit(trimmed.slice(0, MAX_CONVERSATION_TITLE_LENGTH));
  };

  return (
    <div className="mx-1 flex items-center gap-2 rounded-lg border border-accent/40 bg-bg-elevated px-2.5 py-1.5">
      <Clock size={13} className="flex-shrink-0 text-text-muted opacity-50" />
      <input
        ref={inputRef}
        type="text"
        value={draft}
        maxLength={MAX_CONVERSATION_TITLE_LENGTH}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
        }}
        onBlur={submit}
        className="w-full bg-transparent text-xs leading-snug text-text-primary outline-none"
        aria-label="Rename conversation"
      />
    </div>
  );
}

/**
 * A single sidebar conversation row. The ⋯ action menu appears on hover
 * (always visible on touch devices) and offers Rename / Pin / Delete.
 */
export function ConversationItem({
  conversation,
  maxTitleLength = 38,
  onAction,
  renaming = false,
  onRenameSubmit,
  onRenameCancel,
}: ConversationItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/app/chat/${conversation.id}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const menuItems = [
    {
      action: 'rename' as const,
      label: 'Rename',
      icon: Pencil,
    },
    conversation.isPinned
      ? { action: 'unpin' as const, label: 'Unpin', icon: PinOff }
      : { action: 'pin' as const, label: 'Pin', icon: Pin },
    {
      action: 'delete' as const,
      label: 'Delete',
      icon: Trash2,
      danger: true,
    },
  ];

  return (
    <div className="group relative mx-1" ref={rowRef}>
      {renaming ? (
        <RenameInput
          initialTitle={conversation.title}
          onSubmit={(title) => onRenameSubmit?.(title)}
          onCancel={() => onRenameCancel?.()}
        />
      ) : (
        <Link
          href={`/app/chat/${conversation.id}`}
          className={cn(
            'flex items-center gap-2 rounded-lg py-2 pl-3 pr-1.5 text-sm transition-colors',
            isActive
              ? 'bg-accent/10 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
          )}
        >
          {conversation.isPinned ? (
            <Pin size={12} className="flex-shrink-0 opacity-70" />
          ) : (
            <Clock size={13} className="flex-shrink-0 opacity-50" />
          )}
          <span className="min-w-0 flex-1 truncate text-xs leading-snug">
            {truncate(conversation.title, maxTitleLength)}
          </span>

          {/* ⋯ action menu — hover-revealed, always visible on touch */}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
            className={cn(
              'h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-text-muted transition-opacity',
              'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
              'hover:bg-bg-hover hover:text-text-primary',
              menuOpen && 'bg-bg-hover opacity-100 text-text-primary'
            )}
            aria-label={`Conversation actions for ${conversation.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={13} />
          </button>
        </Link>
      )}

      {menuOpen && !renaming && (
        <div
          role="menu"
          aria-label="Conversation actions"
          className="absolute right-1 top-9 z-50 w-36 rounded-[10px] border border-border-default bg-[#15151F] py-1 shadow-2xl"
        >
          {menuItems.map((item) => (
            <button
              key={item.action}
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.preventDefault();
                setMenuOpen(false);
                onAction(item.action, conversation);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors',
                item.danger
                  ? 'text-status-error hover:bg-status-error/10'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              )}
            >
              <item.icon size={13} className="flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
