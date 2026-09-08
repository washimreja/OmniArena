'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_MODELS } from '@/features/models/registry';
import { orchestrate } from '@/lib/ai/orchestrator';
import { generateConversationTitle } from '@/lib/utils/format';
import type { AIModel, ArenaResponse } from '@/types/ai';
import { mockReviewProvider } from '@/features/review/mock-review-provider';
import type { ArenaReview, PreferenceType } from '@/features/review/types';
import { conversationRepository } from './conversation-repository';
import type { ConversationTurn, StoredConversation } from './types';

interface ConversationStoreValue {
  conversations: StoredConversation[];
  activeConversationId: string | null;
  hydrated: boolean;
  createConversation: () => StoredConversation;
  getConversation: (conversationId: string) => StoredConversation | undefined;
  setActiveConversation: (conversationId: string | null) => void;
  submitPrompt: (conversationId: string, prompt: string, selectedModelKeys: string[]) => Promise<void>;
  setResponsePreference: (
    conversationId: string,
    turnId: string,
    responseId: string,
    type: PreferenceType
  ) => void;
  isConversationRunning: (conversationId: string) => boolean;
}

const ConversationStoreContext = createContext<ConversationStoreValue | null>(null);

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createPendingResponse(model: AIModel, turnId: string): ArenaResponse {
  return {
    id: createId(`response-${turnId}`),
    model,
    status: 'waiting',
    content: '',
    startedAt: Date.now(),
  };
}

export function ConversationStoreProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const snapshot = conversationRepository.load();
    const animationFrame = window.requestAnimationFrame(() => {
      setConversations(snapshot.conversations);
      setActiveConversationId(snapshot.activeConversationId);
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const createConversation = useCallback(() => {
    const now = new Date().toISOString();
    const conversation: StoredConversation = {
      id: createId('conversation'),
      title: 'New Arena',
      createdAt: now,
      updatedAt: now,
      selectedModelKeys: [],
      turns: [],
    };

    setConversations((current) => {
      const next = [conversation, ...current];
      conversationRepository.save(next);
      return next;
    });
    setActiveConversationId(conversation.id);
    conversationRepository.saveActiveConversationId(conversation.id);
    return conversation;
  }, []);

  const getConversation = useCallback(
    (conversationId: string) => conversations.find((conversation) => conversation.id === conversationId),
    [conversations]
  );

  const setActiveConversation = useCallback((conversationId: string | null) => {
    setActiveConversationId(conversationId);
    conversationRepository.saveActiveConversationId(conversationId);
  }, []);

  const updateTurn = useCallback(
    (conversationId: string, turnId: string, update: (turn: ConversationTurn) => ConversationTurn) => {
      setConversations((current) => {
        const next = current.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;

          return {
            ...conversation,
            updatedAt: new Date().toISOString(),
            turns: conversation.turns.map((turn) => (turn.id === turnId ? update(turn) : turn)),
          };
        });
        const sorted = [...next].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        conversationRepository.save(sorted);
        return sorted;
      });
    },
    []
  );

  const submitPrompt = useCallback(
    async (conversationId: string, prompt: string, selectedModelKeys: string[]) => {
      const trimmedPrompt = prompt.trim();
      const selectedModels = selectedModelKeys
        .map((modelKey) => MOCK_MODELS.find((model) => model.modelKey === modelKey))
        .filter((model): model is AIModel => Boolean(model));

      if (!trimmedPrompt || selectedModels.length === 0) return;

      const turnId = createId('turn');
      const createdAt = new Date().toISOString();
      const turn: ConversationTurn = {
        id: turnId,
        conversationId,
        prompt: trimmedPrompt,
        attachments: [],
        selectedModelKeys: selectedModels.map((model) => model.modelKey),
        responses: selectedModels.map((model) => createPendingResponse(model, turnId)),
        preferences: [],
        createdAt,
      };
      const streamedResponses = new Map(
        turn.responses.map((response) => [response.model.modelKey, response])
      );

      setConversations((current) => {
        const next = current.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;

          const isFirstTurn = conversation.turns.length === 0;
          return {
            ...conversation,
            title: isFirstTurn ? generateConversationTitle(trimmedPrompt) : conversation.title,
            updatedAt: createdAt,
            selectedModelKeys: turn.selectedModelKeys,
            turns: [...conversation.turns, turn],
          };
        });
        const sorted = [...next].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        conversationRepository.save(sorted);
        return sorted;
      });

      await orchestrate({
        models: selectedModels,
        generateOptions: { prompt: trimmedPrompt },
        onUpdate: (modelKey, responseUpdate) => {
          const currentResponse = streamedResponses.get(modelKey);
          if (currentResponse) {
            streamedResponses.set(modelKey, { ...currentResponse, ...responseUpdate });
          }
          updateTurn(conversationId, turnId, (currentTurn) => ({
            ...currentTurn,
            responses: currentTurn.responses.map((response) =>
              response.model.modelKey === modelKey
                ? { ...response, ...responseUpdate }
                : response
            ),
          }));
        },
      });

      const review: ArenaReview = {
        id: createId('arena-review'),
        conversationId,
        turnId,
        status: 'generating',
        reviews: [],
        createdAt: new Date().toISOString(),
      };

      updateTurn(conversationId, turnId, (currentTurn) => ({ ...currentTurn, review }));

      try {
        const reviewResult = await mockReviewProvider.review({
          conversationId,
          turnId,
          prompt: trimmedPrompt,
          responses: Array.from(streamedResponses.values()),
        });

        updateTurn(conversationId, turnId, (currentTurn) => ({
          ...currentTurn,
          review: {
            ...review,
            ...reviewResult,
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
        }));
      } catch (error) {
        updateTurn(conversationId, turnId, (currentTurn) => ({
          ...currentTurn,
          review: {
            ...review,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown review error',
          },
        }));
      }
    },
    [updateTurn]
  );

  const setResponsePreference = useCallback(
    (conversationId: string, turnId: string, responseId: string, type: PreferenceType) => {
      updateTurn(conversationId, turnId, (turn) => {
        const withoutExistingPreference = (turn.preferences ?? []).filter((preference) => {
          if (preference.responseId === responseId && preference.type === type) return false;
          return type !== 'preferred' || preference.type !== 'preferred';
        });
        return {
          ...turn,
          preferences: [...withoutExistingPreference, { responseId, type, createdAt: new Date().toISOString() }],
        };
      });
    },
    [updateTurn]
  );

  const isConversationRunning = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((item) => item.id === conversationId);
      return conversation?.turns.some((turn) =>
        turn.responses.some((response) => response.status === 'waiting' || response.status === 'generating')
      ) ?? false;
    },
    [conversations]
  );

  const value = useMemo<ConversationStoreValue>(
    () => ({
      conversations,
      activeConversationId,
      hydrated,
      createConversation,
      getConversation,
      setActiveConversation,
      setResponsePreference,
      submitPrompt,
      isConversationRunning,
    }),
    [
      activeConversationId,
      conversations,
      createConversation,
      getConversation,
      hydrated,
      isConversationRunning,
      setActiveConversation,
      setResponsePreference,
      submitPrompt,
    ]
  );

  return (
    <ConversationStoreContext.Provider value={value}>
      {children}
    </ConversationStoreContext.Provider>
  );
}

export function useConversationStore(): ConversationStoreValue {
  const store = useContext(ConversationStoreContext);
  if (!store) {
    throw new Error('useConversationStore must be used within ConversationStoreProvider.');
  }
  return store;
}
