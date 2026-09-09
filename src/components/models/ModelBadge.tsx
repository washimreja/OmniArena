import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ProviderIcon } from '@/components/icons/ProviderIcon';
import type { AIModel } from '@/types/ai';

interface ModelBadgeProps {
  model: AIModel;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function ModelBadge({ model, onRemove, size = 'sm', className }: ModelBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-badge border border-border-subtle bg-[#15151F] transition-colors',
        size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-sm',
        className
      )}
    >
      <ProviderIcon provider={model.provider} size="sm" />
      <span className="text-text-secondary font-medium whitespace-nowrap">{model.displayName}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 text-text-muted hover:text-text-primary transition-colors"
          aria-label={`Remove ${model.displayName}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
