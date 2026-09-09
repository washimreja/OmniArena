'use client';

import { useState, useCallback } from 'react';
import type { ArenaResponse } from '@/types/ai';
import type { ConnectorId } from '@/types/connectors';
import { getConnector } from '@/lib/constants/connectors';
import { orchestrate } from '@/lib/ai/orchestrator';

export function useArena() {
  const [responses, setResponses] = useState<Record<string, ArenaResponse>>({});
  const [isRunning, setIsRunning] = useState(false);

  const updateResponse = useCallback(
    (connectorId: ConnectorId, update: Partial<ArenaResponse>) => {
      setResponses((prev) => ({
        ...prev,
        [connectorId]: { ...(prev[connectorId] ?? {}), ...update } as ArenaResponse,
      }));
    },
    []
  );

  const run = useCallback(
    async (prompt: string, connectorIds: ConnectorId[]) => {
      if (!prompt.trim() || connectorIds.length === 0) return;

      const initial: Record<string, ArenaResponse> = {};
      connectorIds.forEach((id) => {
        const connector = getConnector(id);
        initial[id] = {
          id: `resp-${id}-${Date.now()}`,
          connectorId: id,
          connectorName: connector?.name ?? id,
          provider: connector?.providerName ?? 'AI Platform',
          status: 'waiting',
          content: '',
        };
      });
      setResponses(initial);
      setIsRunning(true);

      try {
        await orchestrate({
          connectorIds,
          generateOptions: { prompt },
          onUpdate: updateResponse,
        });
      } finally {
        setIsRunning(false);
      }
    },
    [updateResponse]
  );

  const reset = useCallback(() => {
    setResponses({});
    setIsRunning(false);
  }, []);

  const responseList = Object.values(responses);
  const allDone = responseList.length > 0 && responseList.every(
    (r) => r.status === 'completed' || r.status === 'failed'
  );

  return { responses, responseList, isRunning, allDone, run, reset };
}
