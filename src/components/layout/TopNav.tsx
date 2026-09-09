'use client';

import React from 'react';
import { Menu, Share2, Download } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface TopNavProps {
  onMenuClick: () => void;
  title?: string;
  className?: string;
}

export function TopNav({ onMenuClick, title, className }: TopNavProps) {
  return (
    <header
      className={cn(
        'h-[60px] flex items-center gap-3 px-5 border-b border-border-subtle bg-bg-base/95 flex-shrink-0',
        className
      )}
    >
      <button
        onClick={onMenuClick}
        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1 min-w-0">
        {title && <h1 className="text-sm font-medium text-text-primary truncate">{title}</h1>}
      </div>

      <div className="flex items-center gap-1">
        <Tooltip content="Share">
          <Button variant="ghost" size="icon-sm">
            <Share2 size={15} />
          </Button>
        </Tooltip>
        <Tooltip content="Export">
          <Button variant="ghost" size="icon-sm">
            <Download size={15} />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
