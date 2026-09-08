'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PromptComposer } from '@/components/chat/PromptComposer';
import { SuggestedPrompts } from './SuggestedPrompts';
import type { AIModel } from '@/types/ai';

interface EmptyStateProps {
  selectedModels: AIModel[];
  selectedKeys: string[];
  onToggleModel: (key: string) => void;
  onRemoveModel: (key: string) => void;
  onSubmit: (prompt: string) => void;
}

export function EmptyState({
  selectedModels,
  selectedKeys,
  onToggleModel,
  onRemoveModel,
  onSubmit,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-16">
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 bg-accent rounded-2xl opacity-15 blur-xl" />
          <div className="relative w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-black text-accent">O</span>
          </div>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10 max-w-lg"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-[1.1] tracking-tight mb-4">
          One Question.
          <br />
          <span className="text-gradient-accent">Every Intelligence.</span>
        </h1>
        <p className="text-base text-text-secondary leading-relaxed max-w-sm mx-auto">
          Ask once. Compare responses from the world&apos;s leading AI models, side by side in the Arena.
        </p>
      </motion.div>

      {/* Prompt Composer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl mb-8"
      >
        <PromptComposer
          onSubmit={onSubmit}
          selectedModels={selectedModels}
          selectedKeys={selectedKeys}
          onToggleModel={onToggleModel}
          onRemoveModel={onRemoveModel}
        />
      </motion.div>

      {/* Suggested Prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="w-full max-w-2xl"
      >
        <SuggestedPrompts onSelect={onSubmit} />
      </motion.div>
    </div>
  );
}
