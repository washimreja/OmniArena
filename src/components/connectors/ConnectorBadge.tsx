'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OmniConnector } from '@/types/connectors';
import { ConnectorIcon } from '@/components/icons/ConnectorIcon';

interface ConnectorBadgeProps {
  connector: OmniConnector;
  onRemove?: () => void;
  className?: string;
}

export function ConnectorBadge({
  connector,
  onRemove,
  className,
}: ConnectorBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg text-xs font-medium border transition-colors select-none',
        'bg-[#141422] border-border-subtle hover:border-border-strong text-text-primary',
        className
      )}
      style={{
        borderColor: `${connector.brandColor}30`,
      }}
    >
      <ConnectorIcon connectorId={connector.id} size="xs" showBackground={false} />
      <span className="leading-none text-xs font-medium">{connector.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-4 h-4 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors ml-0.5"
          aria-label={`Remove ${connector.name}`}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
