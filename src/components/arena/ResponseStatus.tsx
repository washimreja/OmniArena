import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ResponseStatus } from '@/types/ai';

interface ResponseStatusProps {
  status: ResponseStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ResponseStatus, {
  label: string;
  dotClass: string;
  textClass: string;
  animate?: boolean;
}> = {
  waiting: {
    label: 'Waiting',
    dotClass: 'bg-text-muted',
    textClass: 'text-text-muted',
  },
  generating: {
    label: 'Generating',
    dotClass: 'bg-status-warning',
    textClass: 'text-status-warning',
    animate: true,
  },
  completed: {
    label: 'Done',
    dotClass: 'bg-status-success',
    textClass: 'text-status-success',
  },
  failed: {
    label: 'Failed',
    dotClass: 'bg-status-error',
    textClass: 'text-status-error',
  },
  retrying: {
    label: 'Retrying',
    dotClass: 'bg-status-warning',
    textClass: 'text-status-warning',
    animate: true,
  },
};

export function ResponseStatusIndicator({ status, className }: ResponseStatusProps) {
  const config = STATUS_CONFIG[status];
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          config.dotClass,
          config.animate && 'animate-pulse-dot'
        )}
      />
      <span className={cn('text-[10px] font-medium uppercase tracking-wide', config.textClass)}>
        {config.label}
      </span>
    </div>
  );
}
