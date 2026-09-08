import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ProviderID } from '@/types/ai';

const PROVIDER_COLORS: Record<ProviderID, string> = {
  openai:    '#10A37F',
  anthropic: '#CC785C',
  google:    '#4285F4',
  grok:      '#1DA1F2',
  mock:      '#8888A0',
};

const PROVIDER_SYMBOLS: Record<ProviderID, string> = {
  openai:    '⬡',
  anthropic: '◆',
  google:    '✦',
  grok:      '✕',
  mock:      '◎',
};

interface ProviderIconProps {
  provider: ProviderID;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProviderIcon({ provider, size = 'md', className }: ProviderIconProps) {
  const color = PROVIDER_COLORS[provider] ?? '#8888A0';
  const symbol = PROVIDER_SYMBOLS[provider] ?? '◎';

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  return (
    <div
      className={cn('rounded-lg flex items-center justify-center font-bold flex-shrink-0', sizeClasses, className)}
      style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
      aria-label={provider}
    >
      {symbol}
    </div>
  );
}
