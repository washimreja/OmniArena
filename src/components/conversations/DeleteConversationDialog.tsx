'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConversationDialogProps {
  conversationTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Destructive-action confirmation. Nothing is deleted until the user
 * explicitly confirms here.
 */
export function DeleteConversationDialog({
  conversationTitle,
  onConfirm,
  onCancel,
}: DeleteConversationDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onCancel}
        role="dialog"
        aria-modal="true"
        aria-label="Delete conversation"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm rounded-2xl border border-border-default bg-bg-surface p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-error/10 text-status-error">
                <Trash2 size={15} />
              </span>
              <h2 className="text-sm font-semibold text-text-primary">Delete conversation?</h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg p-1 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
              aria-label="Cancel delete"
            >
              <X size={15} />
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">&ldquo;{conversationTitle}&rdquo;</span>{' '}
            and its messages will be permanently removed.
          </p>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onConfirm}
              className="border-status-error/40 bg-status-error/90 text-white hover:bg-status-error hover:text-white"
            >
              Delete
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
