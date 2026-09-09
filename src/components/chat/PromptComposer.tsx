'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Paperclip, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ConnectorBadge } from '@/components/connectors/ConnectorBadge';
import { Tooltip } from '@/components/ui/tooltip';
import type { OmniConnector, ConnectorId } from '@/types/connectors';

interface PromptComposerProps {
  onSubmit: (prompt: string) => void;
  activeConnectors: OmniConnector[];
  onRemoveConnector: (id: ConnectorId) => void;
  onOpenManageConnectors: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptComposer({
  onSubmit,
  activeConnectors,
  onRemoveConnector,
  onOpenManageConnectors,
  disabled,
  placeholder = 'Ask anything — every selected AI will answer…',
  className,
}: PromptComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || activeConnectors.length === 0) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, activeConnectors.length, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const canSubmit = value.trim().length > 0 && activeConnectors.length > 0 && !disabled;

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative bg-[#101019] border rounded-xl transition-all duration-200 shadow-sm',
          disabled
            ? 'border-border-subtle opacity-60'
            : 'border-border-default focus-within:border-accent/50'
        )}
      >
        {/* Selected Connector Badges */}
        {activeConnectors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-3.5 pt-3 pb-1.5 border-b border-border-subtle/50">
            {activeConnectors.map((connector) => (
              <ConnectorBadge
                key={connector.id}
                connector={connector}
                onRemove={activeConnectors.length > 1 ? () => onRemoveConnector(connector.id) : undefined}
              />
            ))}

            <button
              type="button"
              onClick={onOpenManageConnectors}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text-primary px-2 py-1 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <Plus size={12} className="text-accent" />
              <span>Add</span>
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={activeConnectors.length === 0 ? 'Connect an AI account first…' : placeholder}
          disabled={disabled || activeConnectors.length === 0}
          rows={1}
          className={cn(
            'w-full bg-transparent px-3.5 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none leading-relaxed min-h-[50px] max-h-[200px] overflow-y-auto'
          )}
          aria-label="Prompt input"
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 gap-2">
          <div className="flex items-center gap-1.5">
            {/* Manage Connectors trigger button */}
            <button
              type="button"
              onClick={onOpenManageConnectors}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-surface hover:bg-bg-elevated border border-border-subtle hover:border-border-default transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>
                {activeConnectors.length} Connector{activeConnectors.length !== 1 ? 's' : ''}
              </span>
              <Plus size={12} className="opacity-70" />
            </button>

            {/* Attachments (placeholder) */}
            <Tooltip content="Attach file (coming soon)">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted opacity-40 cursor-not-allowed transition-colors"
              >
                <Paperclip size={15} />
              </button>
            </Tooltip>

            <Tooltip content="Image input (coming soon)">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted opacity-40 cursor-not-allowed transition-colors"
              >
                <ImageIcon size={15} />
              </button>
            </Tooltip>
          </div>

          {/* Send button */}
          <div className="flex items-center gap-2">
            {activeConnectors.length > 0 && (
              <span className="text-[10px] text-text-muted hidden sm:block">
                ↵ Send · ⇧↵ New line
              </span>
            )}
            <motion.button
              whileHover={canSubmit ? { scale: 1.05 } : {}}
              whileTap={canSubmit ? { scale: 0.95 } : {}}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'w-8 h-8 rounded-btn flex items-center justify-center transition-colors duration-200',
                canSubmit
                  ? 'bg-accent text-white hover:bg-accent-hover shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                  : 'bg-bg-elevated text-text-muted cursor-not-allowed'
              )}
              aria-label="Send prompt to selected connectors"
            >
              <Send size={15} />
            </motion.button>
          </div>
        </div>
      </div>

      {activeConnectors.length === 0 && (
        <p className="text-xs text-text-muted text-center mt-2">
          Select at least one connector to broadcast the prompt.
        </p>
      )}
    </div>
  );
}
