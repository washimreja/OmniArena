'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ConnectorStatus } from '@/types/connectors';

interface ConnectorStatusDotProps {
  status: ConnectorStatus;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<
  ConnectorStatus,
  {
    label: string;
    dotClass: string;
    pulse: boolean;
    textColor: string;
  }
> = {
  connected: {
    label: 'Connected',
    dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    pulse: true,
    textColor: 'text-emerald-400',
  },
  not_connected: {
    label: 'Not Connected',
    dotClass: 'border border-text-muted/40 bg-bg-surface',
    pulse: false,
    textColor: 'text-text-muted',
  },
  connecting: {
    label: 'Connecting…',
    dotClass: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    pulse: true,
    textColor: 'text-sky-400',
  },
  coming_soon: {
    label: 'Roadmap',
    dotClass: 'bg-accent/40 border border-accent/60',
    pulse: false,
    textColor: 'text-accent-secondary',
  },
};

export function ConnectorStatusDot({
  status,
  showLabel = false,
  className,
  size = 'md',
}: ConnectorStatusDotProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_connected;

  const dotSize =
    size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex items-center justify-center">
        {cfg.pulse && (
          <span
            className={cn(
              'absolute rounded-full opacity-75 animate-ping',
              dotSize,
              status === 'connected' ? 'bg-emerald-400' : 'bg-sky-400'
            )}
          />
        )}
        <span
          className={cn('relative rounded-full flex-shrink-0', dotSize, cfg.dotClass)}
          title={cfg.label}
        />
      </span>
      {showLabel && (
        <span className={cn('text-[11px] font-medium leading-none tracking-tight', cfg.textColor)}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}
