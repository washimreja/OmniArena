'use client';

import { useState, useCallback } from 'react';
import type { AIModel, ArenaResponse } from '@/types/ai';
import { orchestrate } from '@/lib/ai/orchestrator';

export function useArena() {
  const [responses, setResponses] = useState<Record<string, ArenaResponse>>({});
  const [isRunning, setIsRunning] = useState(false);

  const updateResponse = useCallback(
    (modelKey: string, update: Partial<ArenaResponse>) => {
      setResponses((prev) => ({
        ...prev,
        [modelKey]: { ...(prev[modelKey] ?? {}), ...update } as ArenaResponse,
      }));
    },
    []
  );

  const run = useCallback(
    async (prompt: string, models: AIModel[]) => {
      if (!prompt.trim() || models.length === 0) return;

      // Initialize all responses
      const initial: Record<string, ArenaResponse> = {};
      models.forEach((model) => {
        initial[model.modelKey] = {
          id: `resp-${model.modelKey}-${Date.now()}`,
          model,
          status: 'waiting',
          content: '',
        };
      });
      setResponses(initial);
      setIsRunning(true);

      try {
        await orchestrate({
          models,
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
