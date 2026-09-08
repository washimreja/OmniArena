'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ModelSelector } from '@/components/models/ModelSelector';
import { ModelBadge } from '@/components/models/ModelBadge';
import { Tooltip } from '@/components/ui/tooltip';
import type { AIModel } from '@/types/ai';

interface PromptComposerProps {
  onSubmit: (prompt: string) => void;
  selectedModels: AIModel[];
  selectedKeys: string[];
  onToggleModel: (key: string) => void;
  onRemoveModel: (key: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptComposer({
  onSubmit,
  selectedModels,
  selectedKeys,
  onToggleModel,
  onRemoveModel,
  disabled,
  placeholder = 'Ask anything — every AI will answer…',
  className,
}: PromptComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || selectedModels.length === 0) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, selectedModels.length, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const canSubmit = value.trim().length > 0 && selectedModels.length > 0 && !disabled;

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative bg-[#101019] border rounded-[10px] transition-colors duration-200',
          disabled
            ? 'border-border-subtle opacity-60'
            : 'border-border-default focus-within:border-accent/50'
        )}
      >
        {/* Selected Model Badges */}
        {selectedModels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3.5 pt-3 pb-1.5">
            {selectedModels.map((model) => (
              <ModelBadge
                key={model.modelKey}
                model={model}
                onRemove={() => onRemoveModel(model.modelKey)}
              />
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={selectedModels.length === 0 ? 'Select models first…' : placeholder}
          disabled={disabled || selectedModels.length === 0}
          rows={1}
          className={cn(
            'w-full bg-transparent px-3.5 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none leading-relaxed min-h-[50px] max-h-[200px] overflow-y-auto',
          )}
          aria-label="Prompt input"
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 gap-2">
          <div className="flex items-center gap-1.5">
            {/* Model Selector */}
            <ModelSelector
              selectedKeys={selectedKeys}
              onToggle={onToggleModel}
            />

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
            {selectedModels.length > 0 && (
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
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-bg-elevated text-text-muted cursor-not-allowed'
              )}
              aria-label="Send prompt"
            >
              <Send size={15} />
            </motion.button>
          </div>
        </div>
      </div>
      {selectedModels.length === 0 && (
        <p className="text-xs text-text-muted text-center mt-2">
          Select at least one model to start the Arena
        </p>
      )}
    </div>
  );
}
