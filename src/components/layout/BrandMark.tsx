import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BrandMarkProps {
  className?: string;
  label?: boolean;
}

export function BrandMark({ className, label = false }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="w-8 h-8 flex-shrink-0" aria-label="OmniArena">
        <path d="M7 10.5 16 5l9 5.5v11L16 27l-9-5.5v-11Z" fill="#151526" stroke="#6C63FF" strokeWidth="1.25" />
        <path d="m10 12.25 6 3.5 6-3.5M16 15.75v7" fill="none" stroke="#A7A1FF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="12.25" r="1.65" fill="#6C63FF" />
        <circle cx="22" cy="12.25" r="1.65" fill="#6C63FF" />
        <circle cx="16" cy="22.75" r="1.65" fill="#F0F0F5" />
      </svg>
      {label && <span className="text-[15px] font-semibold tracking-[-0.02em] text-text-primary">OmniArena</span>}
    </div>
  );
}
