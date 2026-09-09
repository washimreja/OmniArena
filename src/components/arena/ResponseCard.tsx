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
  onPreference: (type: 'helpful' | 'not_helpful' | 'preferred' | 'not_preferred') => void;
  className?: string;
}

function resolveConnectorId(response: ArenaResponse): ConnectorId {
  if (response.connectorId) return response.connectorId;
  const raw = response.model?.modelKey ?? response.model?.provider ?? '';
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
  const displayName = response.connectorName ?? connector?.name ?? response.model?.displayName ?? 'AI';
  const providerName = response.provider ?? connector?.providerName ?? response.model?.provider ?? 'AI Platform';

  const isLoading = status === 'waiting' || (status === 'generating' && !content);
  const hasPreference = (type: PreferenceType) => preferences.some((preference) => preference.type === type);

  return (
    <div
      className={cn(
        'card-surface flex flex-col overflow-hidden transition-all duration-200 hover:border-border-strong rounded-xl border border-border-default',
        hasPreference('preferred') && 'border-accent/40 shadow-lg shadow-accent/10',
        className
      )}
    >
      {/* Card Header — One Connector = One AI Platform */}
      <div className="flex items-start justify-between gap-2 border-b border-border-default/50 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ConnectorIcon connectorId={connectorId} size="lg" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">{displayName}</div>
            <div className="text-xs text-text-muted">{providerName}</div>
          </div>
        </div>
        <ResponseStatusIndicator status={status} error={error} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-8"
            >
              <SkeletonText className="max-w-none" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap font-sans text-[13px] leading-relaxed px-4 pb-4"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-border-default/50 px-4 py-2.5">
        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          {latencyMs !== undefined && <span>{formatLatency(latencyMs)}</span>}
          {tokenCount !== undefined && <span>{formatTokens(tokenCount)}</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPreference('helpful')}
            className={cn(
              'p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
              hasPreference('helpful') && 'text-accent bg-accent/10'
            )}
            aria-label="Mark response helpful"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPreference('not_helpful')}
            className={cn(
              'p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
              hasPreference('not_helpful') && 'text-status-error bg-status-error/10'
            )}
            aria-label="Mark response not helpful"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPreference('preferred')}
            disabled={!content || status !== 'completed'}
            className={cn(
              'p-1.5 rounded text-text-muted hover:text-rose-400 hover:bg-bg-elevated transition-colors',
              hasPreference('preferred') && 'text-rose-400 bg-rose-400/10'
            )}
            aria-label="Mark as preferred"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => copy(content)}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            {copied ? <CheckCheck className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            {expanded ? <Maximize2 className="h-3.5 w-3.5" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
