'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export function ArenaGrid({
  responses,
  allDone,
  review,
  preferences,
  onPreference,
  className,
}: ArenaGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, responses.length]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -400 : 400;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (responses.length === 0) return null;

  return (
    <div className={cn('space-y-6 w-full', className)}>
      {/* Horizontal Response Carousel */}
      <div className="relative group w-full">
        {/* Left scroll navigation arrow */}
        {canScrollLeft && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-bg-base via-bg-base/80 to-transparent z-20" />
            <button
              type="button"
              onClick={() => scrollByAmount('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#12121e]/90 hover:bg-[#1a1a2b] border border-border-default hover:border-accent text-text-primary flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}

        {/* Right scroll navigation arrow */}
        {canScrollRight && (
          <>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-bg-base via-bg-base/80 to-transparent z-20" />
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#12121e]/90 hover:bg-[#1a1a2b] border border-border-default hover:border-accent text-text-primary flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Horizontal Carousel Row — Never wraps */}
        <motion.div
          ref={scrollRef}
          className="flex items-stretch gap-4 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {responses.map((response) => (
            <div
              key={response.id}
              className={cn(
                'flex-shrink-0 flex flex-col',
                responses.length === 1
                  ? 'w-full max-w-2xl mx-auto'
                  : 'w-[340px] sm:w-[380px] lg:w-[410px]'
              )}
            >
              <ResponseCard
                response={response}
                preferences={preferences.filter((p) => p.responseId === response.id)}
                onPreference={onPreference}
                className="h-full"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Cross-Platform Comparison & Verdict */}
      {allDone && review && (
        <ReviewPanel review={review} responses={responses} />
      )}

      {review?.status === 'completed' && review.verdict && (
        <ArenaVerdict responses={responses} review={review} preferences={preferences} />
      )}
    </div>
  );
}
