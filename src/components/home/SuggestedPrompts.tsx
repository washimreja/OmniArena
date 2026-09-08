'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SUGGESTED_PROMPTS } from '@/features/conversations/mock-data';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 justify-center">
        <Sparkles size={12} className="text-text-muted" />
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
          Try these prompts
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(prompt.text)}
            className="px-3 py-2 text-xs text-text-secondary bg-bg-surface border border-border-subtle rounded-lg hover:border-border-strong hover:text-text-primary hover:bg-bg-elevated transition-all duration-200 text-left leading-snug max-w-[260px]"
          >
            {prompt.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
