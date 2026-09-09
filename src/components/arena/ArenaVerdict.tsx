'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ConnectorIcon } from '@/components/icons/ConnectorIcon';
import type { ArenaResponse } from '@/types/ai';
import type { ArenaReview, ResponsePreference } from '@/features/review/types';
import type { ConnectorId } from '@/types/connectors';

interface ArenaVerdictProps {
  responses: ArenaResponse[];
  review: ArenaReview;
  preferences: ResponsePreference[];
  className?: string;
}

function findResponse(responses: ArenaResponse[], key: string): ArenaResponse | undefined {
  return responses.find(
    (response) =>
      response.connectorId === key ||
      response.model?.modelKey === key ||
      response.connectorName.toLowerCase() === key.toLowerCase()
  );
}

function getConnectorId(response: ArenaResponse): ConnectorId {
  return response.connectorId || 'chatgpt';
}

function getDisplayName(response: ArenaResponse): string {
  return response.connectorName || response.model?.displayName || 'AI Platform';
}

export function ArenaVerdict({ responses, review, preferences, className }: ArenaVerdictProps) {
  const [expanded, setExpanded] = useState(false);
  const verdict = review.verdict;
  if (!verdict) return null;

  const winner = findResponse(responses, verdict.bestOverallModelKey) ?? responses[0];
  const quickAnswer = findResponse(responses, verdict.bestForQuickAnswerModelKey) ?? responses[0];
  const deepExplanation = findResponse(responses, verdict.bestForDeepExplanationModelKey) ?? responses[0];
  const preferredResponseId = preferences.find((preference) => preference.type === 'preferred')?.responseId;
  const userPreferred = responses.find((response) => response.id === preferredResponseId);

  if (!winner || !quickAnswer || !deepExplanation) return null;

  return (
    <section className={cn('card-surface border-accent/20 overflow-hidden rounded-xl', className)}>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-elevated/50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
            {verdict.outcome === 'winner' ? <Trophy size={18} className="text-accent" /> : <Sparkles size={18} className="text-accent" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-0.5">Arena Verdict</p>
            <div className="flex items-center gap-2">
              <ConnectorIcon connectorId={getConnectorId(winner)} size="xs" />
              <span className="text-sm font-bold text-text-primary">{getDisplayName(winner)}</span>
              <span className="text-xs text-text-muted">{verdict.outcome === 'tie' ? 'leads a close call' : 'is recommended overall'}</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>

      {expanded && (
        <div className="border-t border-border-subtle px-5 py-4 space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">{verdict.reasoning}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Strengths</p>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {verdict.strengths.map((strength) => <li key={strength}>• {strength}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Tradeoffs</p>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {verdict.tradeoffs.map((tradeoff) => <li key={tradeoff}>• {tradeoff}</li>)}
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t border-border-subtle grid gap-2 text-[11px] text-text-muted sm:grid-cols-2">
            <p>Best for a quick answer: <span className="text-text-secondary">{getDisplayName(quickAnswer)}</span></p>
            <p>Best for depth: <span className="text-text-secondary">{getDisplayName(deepExplanation)}</span></p>
            <p>Comparison confidence: <span className="text-text-secondary capitalize">{verdict.confidence}</span></p>
            {userPreferred && <p>Your preference: <span className="text-text-secondary">{getDisplayName(userPreferred)}</span></p>}
          </div>
        </div>
      )}
    </section>
  );
}
