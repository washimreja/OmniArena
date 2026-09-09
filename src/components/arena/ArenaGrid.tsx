'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ResponseCard } from './ResponseCard';
import { ArenaVerdict } from './ArenaVerdict';
import { ConnectorIcon } from '@/components/icons/ConnectorIcon';
import type { ArenaResponse } from '@/types/ai';
import type { ArenaReview, ResponsePreference } from '@/features/review/types';
import type { ConnectorId } from '@/types/connectors';

interface ArenaGridProps {
  responses: ArenaResponse[];
  allDone: boolean;
  review?: ArenaReview;
  preferences: ResponsePreference[];
  onPreference: (responseId: string, type: 'helpful' | 'not_helpful' | 'preferred' | 'not_preferred') => void;
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
    <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-4 pb-4 pt-2 scroll-smooth">
      {/* Left scroll navigation arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#12121e]/90 hover:bg-[#1a1a2b] border border-border-default hover:border-accent text-text-primary flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Right scroll navigation arrow */}
      {canScrollRight && (
        <button
          onClick={() => scrollByAmount('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#12121e]/90 hover:bg-[#1a1a2b] border border-border-default hover:border-accent text-text-primary flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Horizontal Carousel Row — Never wraps */}
      <div className="flex gap-4 min-w-max">
        {responses.map((response) => (
          <ResponseCard
            key={response.id}
            response={response}
            preferences={preferences.filter((p) => p.responseId === response.id)}
            onPreference={(type) => onPreference(response.id, type)}
            className="h-full"
          />
        ))}
      </div>

      {/* Cross-Platform Comparison & Verdict */}
      {allDone && review && (
        <ArenaVerdict
          responses={responses}
          review={review}
          preferences={preferences}
          className="mt-4"
        />
      )}
    </div>
  );
}
