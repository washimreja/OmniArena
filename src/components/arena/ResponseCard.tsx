'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Maximize2, Heart, MoreHorizontal, CheckCheck, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ProviderIcon } from '@/components/models/ProviderIcon';
import { ResponseStatusIndicator } from './ResponseStatus';
import { SkeletonText } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { formatLatency, formatTokens } from '@/lib/utils/format';
import type { ArenaResponse } from '@/types/ai';
import type { PreferenceType, ResponsePreference } from '@/features/review/types';

interface ResponseCardProps {
  response: ArenaResponse;
  preferences: ResponsePreference[];
  onPreference: (responseId: string, type: PreferenceType) => void;
  className?: string;
}

export function ResponseCard({ response, preferences, onPreference, className }: ResponseCardProps) {
  const { copied, copy } = useCopyToClipboard();
  const [expanded, setExpanded] = useState(false);
  const { model, status, content, latencyMs, tokenCount, error } = response;

  const isLoading = status === 'waiting' || (status === 'generating' && !content);
  const hasPreference = (type: PreferenceType) => preferences.some((preference) => preference.type === type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'card-surface flex flex-col overflow-hidden transition-shadow hover:border-border-strong',
        hasPreference('preferred') && 'border-accent/40 shadow-lg shadow-accent/10',
        className
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <ProviderIcon provider={model.provider} size="sm" />
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">
              {model.displayName}
            </p>
            <p className="text-[10px] text-text-muted capitalize mt-0.5">
              {model.provider}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ResponseStatusIndicator status={status} />
          <button className="text-text-muted hover:text-text-primary transition-colors">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div
        className={cn(
          'flex-1 px-4 py-4 text-sm text-text-primary leading-relaxed overflow-y-auto',
          !expanded && 'max-h-80'
        )}
      >
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonText lines={4} />
            {status === 'generating' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="w-1.5 h-1.5 bg-status-warning rounded-full animate-pulse-dot" />
                <span className="text-xs text-text-muted">Generating response…</span>
              </div>
            )}
          </div>
        ) : status === 'failed' ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-10 h-10 rounded-full bg-status-error/10 flex items-center justify-center">
              <span className="text-status-error text-lg">✕</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-status-error">Request Failed</p>
              <p className="text-xs text-text-muted mt-1">{error ?? 'An error occurred'}</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={content.length > 0 ? 'content' : 'empty'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-pre-wrap font-sans"
            >
              {content || <span className="text-text-muted italic">Waiting for response…</span>}
              {status === 'generating' && (
                <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle">
        {/* Metadata */}
        <div className="flex items-center gap-3 text-[10px] text-text-muted">
          {latencyMs && <span>{formatLatency(latencyMs)}</span>}
          {tokenCount && <span>{formatTokens(tokenCount)}</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <Tooltip content={copied ? 'Copied!' : 'Copy response'}>
            <button
              onClick={() => copy(content)}
              disabled={!content}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all',
                copied
                  ? 'text-status-success'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated',
                !content && 'opacity-30'
              )}
            >
              {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
            </button>
          </Tooltip>

          <Tooltip content={expanded ? 'Collapse' : 'Expand'}>
            <button
              onClick={() => setExpanded((prev) => !prev)}
              disabled={!content}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all',
                expanded
                  ? 'text-accent bg-accent/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated',
                !content && 'opacity-30'
              )}
            >
              <Maximize2 size={13} />
            </button>
          </Tooltip>

          <Tooltip content={hasPreference('preferred') ? 'Preferred response' : 'Prefer this response'}>
            <button
              onClick={() => onPreference(response.id, 'preferred')}
              disabled={!content || status !== 'completed'}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all',
                hasPreference('preferred')
                  ? 'text-status-error'
                  : 'text-text-muted hover:text-status-error hover:bg-status-error/10',
                (!content || status !== 'completed') && 'opacity-30'
              )}
            >
              <Heart size={13} className={cn(hasPreference('preferred') && 'fill-current')} />
            </button>
          </Tooltip>

          <Tooltip content={hasPreference('helpful') ? 'Marked helpful' : 'Mark helpful'}>
            <button
              onClick={() => onPreference(response.id, 'helpful')}
              disabled={!content || status !== 'completed'}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all',
                hasPreference('helpful') ? 'text-status-success' : 'text-text-muted hover:text-status-success hover:bg-status-success/10',
                (!content || status !== 'completed') && 'opacity-30'
              )}
              aria-label="Mark response helpful"
            >
              <ThumbsUp size={13} className={cn(hasPreference('helpful') && 'fill-current')} />
            </button>
          </Tooltip>

          <Tooltip content={hasPreference('not_helpful') ? 'Marked not helpful' : 'Mark not helpful'}>
            <button
              onClick={() => onPreference(response.id, 'not_helpful')}
              disabled={!content || status !== 'completed'}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all',
                hasPreference('not_helpful') ? 'text-status-warning' : 'text-text-muted hover:text-status-warning hover:bg-status-warning/10',
                (!content || status !== 'completed') && 'opacity-30'
              )}
              aria-label="Mark response not helpful"
            >
              <ThumbsDown size={13} className={cn(hasPreference('not_helpful') && 'fill-current')} />
            </button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
