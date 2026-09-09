'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Maximize2, Heart, MoreHorizontal, CheckCheck, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ConnectorIcon } from '@/components/icons/ConnectorIcon';
import { ResponseStatusIndicator } from './ResponseStatus';
import { SkeletonText } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { formatLatency, formatTokens } from '@/lib/utils/format';
import type { ArenaResponse } from '@/types/ai';
import type { PreferenceType, ResponsePreference } from '@/features/review/types';
import { getConnector } from '@/lib/constants/connectors';
import type { ConnectorId } from '@/types/connectors';

interface ResponseCardProps {
  response: ArenaResponse;
  preferences: ResponsePreference[];
  onPreference: (responseId: string, type: PreferenceType) => void;
  className?: string;
}

function resolveConnectorId(response: ArenaResponse): ConnectorId {
  if (response.connectorId) return response.connectorId;
  const raw = response.model?.modelKey || response.model?.provider || '';
  if (raw.includes('claude') || raw.includes('anthropic')) return 'claude';
  if (raw.includes('gemini') || raw.includes('google')) return 'gemini';
  if (raw.includes('grok')) return 'grok';
  if (raw.includes('deepseek')) return 'deepseek';
  if (raw.includes('mistral')) return 'mistral';
  if (raw.includes('qwen')) return 'qwen';
  if (raw.includes('copilot')) return 'copilot';
  return 'chatgpt';
}

export function ResponseCard({ response, preferences, onPreference, className }: ResponseCardProps) {
  const { copied, copy } = useCopyToClipboard();
  const [expanded, setExpanded] = useState(false);
  const { status, content, latencyMs, tokenCount, error } = response;

  const connectorId = resolveConnectorId(response);
  const connector = getConnector(connectorId);
  const displayName = response.connectorName || connector?.name || response.model?.displayName || 'AI';
  const providerName = response.provider || connector?.providerName || response.model?.provider || 'AI Platform';

  const isLoading = status === 'waiting' || (status === 'generating' && !content);
  const hasPreference = (type: PreferenceType) => preferences.some((preference) => preference.type === type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'card-surface flex flex-col overflow-hidden transition-all duration-200 hover:border-border-strong rounded-xl border border-border-default',
        hasPreference('preferred') && 'border-accent/40 shadow-lg shadow-accent/10',
        className
      )}
    >
      {/* Card Header — One Connector = One AI Platform */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-surface/50">
        <div className="flex items-center gap-2.5">
          <ConnectorIcon connectorId={connectorId} size="sm" />
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">
              {displayName}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {providerName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ResponseStatusIndicator status={status} />
          <button
            type="button"
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-bg-elevated"
            aria-label="More options"
          >
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
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap font-sans text-[13px] leading-relaxed"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle text-xs text-text-muted bg-bg-surface/30">
        <div className="flex items-center gap-3">
          {latencyMs !== undefined && <span>{formatLatency(latencyMs)}</span>}
          {tokenCount !== undefined && <span>{formatTokens(tokenCount)}</span>}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="Helpful">
            <button
              onClick={() => onPreference(response.id, 'helpful')}
              className={cn(
                'p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
                hasPreference('helpful') && 'text-accent bg-accent/10'
              )}
            >
              <ThumbsUp size={13} />
            </button>
          </Tooltip>

          <Tooltip content="Not helpful">
            <button
              onClick={() => onPreference(response.id, 'not_helpful')}
              className={cn(
                'p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
                hasPreference('not_helpful') && 'text-status-error bg-status-error/10'
              )}
            >
              <ThumbsDown size={13} />
            </button>
          </Tooltip>

          <Tooltip content="Mark as preferred response">
            <button
              onClick={() => onPreference(response.id, 'preferred')}
              className={cn(
                'p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
                hasPreference('preferred') && 'text-rose-400 bg-rose-400/10'
              )}
            >
              <Heart size={13} className={cn(hasPreference('preferred') && 'fill-current')} />
            </button>
          </Tooltip>

          <Tooltip content={copied ? 'Copied!' : 'Copy response'}>
            <button
              onClick={() => copy(content)}
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              {copied ? <CheckCheck size={13} className="text-status-success" /> : <Copy size={13} />}
            </button>
          </Tooltip>

          <Tooltip content={expanded ? 'Collapse' : 'Expand'}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <Maximize2 size={13} />
            </button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
