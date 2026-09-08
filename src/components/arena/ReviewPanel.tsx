'use client';

import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { ProviderIcon } from '@/components/models/ProviderIcon';
import { cn } from '@/lib/utils/cn';
import type { ArenaResponse } from '@/types/ai';
import type { ArenaReview } from '@/features/review/types';

interface ReviewPanelProps {
  review: ArenaReview;
  responses: ArenaResponse[];
  className?: string;
}

function getResponse(responses: ArenaResponse[], modelKey: string) {
  return responses.find((response) => response.model.modelKey === modelKey);
}

export function ReviewPanel({ review, responses, className }: ReviewPanelProps) {
  if (review.status === 'generating') {
    return (
      <div className={cn('card-surface border-accent/20 px-5 py-4', className)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
            <Sparkles size={18} className="text-accent animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Help me choose</p>
            <p className="text-xs text-text-muted mt-0.5">AI models are cross-reviewing the completed responses…</p>
          </div>
        </div>
      </div>
    );
  }

  if (review.status === 'failed') {
    return (
      <div className={cn('card-surface px-5 py-4 text-xs text-text-muted', className)}>
        Comparison unavailable: {review.error ?? 'Unknown review error'}
      </div>
    );
  }

  return (
    <section className={cn('space-y-3', className)} aria-label="AI cross-reviews">
      <div className="flex items-center gap-2 px-1">
        <Bot size={15} className="text-accent" />
        <div>
          <p className="text-xs font-semibold text-text-primary">Help me choose</p>
          <p className="text-[11px] text-text-muted">AI models cross-reviewing each other</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {review.reviews.map((item) => {
          const target = getResponse(responses, item.targetModelKey);
          const reviewer = getResponse(responses, item.reviewerModelKey);
          if (!target || !reviewer) return null;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <ProviderIcon provider={reviewer.model.provider} size="sm" />
                  <p className="text-[11px] text-text-secondary leading-snug">
                    {reviewer.model.displayName} reviewing {target.model.displayName}
                  </p>
                </div>
                <span className="text-xs font-semibold text-accent">{item.score}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{item.summary}</p>
              <p className="text-[11px] text-text-muted mt-3">Tradeoff: {item.weaknesses[0]}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
