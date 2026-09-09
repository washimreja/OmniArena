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
  return response.connectorId ?? 'chatgpt';
}

function getDisplayName(response: ArenaResponse): string {
  return response.connectorName ?? response.model?.displayName ?? 'AI Platform';
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
    <div className={cn('rounded-xl border border-border-default bg-bg-elevated/30 p-4', className)}>
      <button
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
            <Trophy className="h-4 w-4 text-accent" />
          </div>
          <span className="text-sm font-semibold text-text-primary">Arena Verdict</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/10 p-3">
            <ConnectorIcon connectorId={getConnectorId(winner)} size="md" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary">
                {getDisplayName(winner)}{verdict.outcome === 'tie' ? ' leads a close call' : ' is recommended overall'}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border-default bg-bg-surface p-3">
              <div className="text-xs font-medium text-text-muted">Best for a quick answer</div>
              <div className="mt-1 flex items-center gap-2">
                <ConnectorIcon connectorId={getConnectorId(quickAnswer)} size="sm" />
                <span className="text-sm font-medium text-text-primary">{getDisplayName(quickAnswer)}</span>
              </div>
            </div>
            <div className="rounded-lg border border-border-default bg-bg-surface p-3">
              <div className="text-xs font-medium text-text-muted">Best for depth</div>
              <div className="mt-1 flex items-center gap-2">
                <ConnectorIcon connectorId={getConnectorId(deepExplanation)} size="sm" />
                <span className="text-sm font-medium text-text-primary">{getDisplayName(deepExplanation)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Sparkles className="h-3 w-3" />
            <span>Comparison confidence: {verdict.confidence}</span>
          </div>

          {userPreferred && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>Your preference: {getDisplayName(userPreferred)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
