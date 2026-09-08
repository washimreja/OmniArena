'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { ResponseCard } from './ResponseCard';
import { ArenaVerdict } from './ArenaVerdict';
import { ReviewPanel } from './ReviewPanel';
import type { ArenaResponse } from '@/types/ai';
import type { ArenaReview, PreferenceType, ResponsePreference } from '@/features/review/types';

interface ArenaGridProps {
  responses: ArenaResponse[];
  allDone?: boolean;
  review?: ArenaReview;
  preferences: ResponsePreference[];
  onPreference: (responseId: string, type: PreferenceType) => void;
  className?: string;
}

export function ArenaGrid({ responses, allDone, review, preferences, onPreference, className }: ArenaGridProps) {
  const count = responses.length;

  const gridClass = cn(
    'grid gap-4',
    count === 1 && 'grid-cols-1 max-w-2xl mx-auto',
    count === 2 && 'grid-cols-1 md:grid-cols-2',
    count === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    count >= 4 && 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4',
  );

  if (count === 0) return null;

  return (
    <div className={cn('space-y-6', className)}>
      <motion.div
        className={gridClass}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.08 }}
      >
        {responses.map((response) => (
          <ResponseCard
            key={response.model.modelKey}
            response={response}
            preferences={preferences.filter((preference) => preference.responseId === response.id)}
            onPreference={onPreference}
          />
        ))}
      </motion.div>

      {allDone && review && (
        <ReviewPanel review={review} responses={responses} />
      )}

      {review?.status === 'completed' && review.verdict && (
        <ArenaVerdict responses={responses} review={review} preferences={preferences} />
      )}
    </div>
  );
}
