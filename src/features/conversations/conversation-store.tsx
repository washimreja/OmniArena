'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { orchestrate } from '@/lib/ai/orchestrator';
import { generateConversationTitle } from '@/lib/utils/format';
import type { ArenaResponse } from '@/types/ai';
import type { ConnectorId } from '@/types/connectors';
import { getConnector } from '@/lib/constants/connectors';
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
  renameConversation: (conversationId: string, title: string) => void;
  setConversationPinned: (conversationId: string, pinned: boolean) => void;
  deleteConversation: (conversationId: string) => void;
  submitPrompt: (
    conversationId: string,
    prompt: string,
    selectedConnectorIds: ConnectorId[]
  ) => Promise<void>;
  setResponsePreference: (
    conversationId: string,
    turnId: string,
    responseId: string,
    type: PreferenceType
  ) => void;
  isConversationRunning: (conversationId: string) => boolean;
}

const ConversationStoreContext = createContext<ConversationStoreValue | null>(null);

/** Maximum number of conversations that can be pinned at once. */
export const MAX_PINNED_CONVERSATIONS = 5;

/** Longest allowed conversation title (rename clamps to this). */
export const MAX_CONVERSATION_TITLE_LENGTH = 50;

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/**
 * Sidebar ordering: pinned conversations first (most recently pinned on top),
 * then everything else by updatedAt descending.
 */
function sortConversations(conversations: StoredConversation[]): StoredConversation[] {
  return [...conversations].sort((a, b) => {
    const pinnedDiff = Number(b.isPinned ?? false) - Number(a.isPinned ?? false);
    if (pinnedDiff !== 0) return pinnedDiff;
    if (a.isPinned && b.isPinned) {
      const pinnedTimeDiff =
        new Date(b.pinnedAt ?? 0).getTime() - new Date(a.pinnedAt ?? 0).getTime();
      if (pinnedTimeDiff !== 0) return pinnedTimeDiff;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function createPendingResponse(connectorId: ConnectorId, turnId: string): ArenaResponse {
  const connector = getConnector(connectorId);
  return {
    id: createId(`response-${turnId}-${connectorId}`),
    connectorId,
    connectorName: connector?.name ?? connectorId,
    provider: connector?.providerName ?? 'AI Platform',
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
      selectedConnectorIds: ['chatgpt', 'claude', 'gemini'],
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

  const renameConversation = useCallback((conversationId: string, title: string) => {
    const trimmed = title.trim().slice(0, MAX_CONVERSATION_TITLE_LENGTH);
    if (!trimmed) return;

    setConversations((current) => {
      const next = current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, title: trimmed }
          : conversation
      );
      conversationRepository.save(next);
      return next;
    });
  }, []);

  const setConversationPinned = useCallback((conversationId: string, pinned: boolean) => {
    setConversations((current) => {
      const pinnedCount = current.filter((conversation) => conversation.isPinned).length;
      if (pinned && pinnedCount >= MAX_PINNED_CONVERSATIONS) return current;

      const next = sortConversations(
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
              ...conversation,
              isPinned: pinned,
              pinnedAt: pinned ? new Date().toISOString() : null,
            }
            : conversation
        )
      );
      conversationRepository.save(next);
      return next;
    });
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((current) => {
      const next = current.filter((conversation) => conversation.id !== conversationId);
      conversationRepository.save(next);
      return next;
    });

    // If the deleted conversation was open, fall back to a fresh empty Arena.
    setActiveConversationId((currentActive) => {
      if (currentActive !== conversationId) return currentActive;
      conversationRepository.saveActiveConversationId(null);
      return null;
    });
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
        const sorted = sortConversations(next);
        conversationRepository.save(sorted);
        return sorted;
      });
    },
    []
  );

  const submitPrompt = useCallback(
    async (
      conversationId: string,
      prompt: string,
      selectedConnectorIds: ConnectorId[]
    ) => {
      const trimmedPrompt = prompt.trim();
      const validConnectorIds = selectedConnectorIds.filter((id): id is ConnectorId => Boolean(getConnector(id)));

      if (!trimmedPrompt || validConnectorIds.length === 0) return;

      const turnId = createId('turn');
      const createdAt = new Date().toISOString();
      const turn: ConversationTurn = {
        id: turnId,
        conversationId,
        prompt: trimmedPrompt,
        attachments: [],
        selectedConnectorIds: validConnectorIds,
        responses: validConnectorIds.map((connectorId) => createPendingResponse(connectorId, turnId)),
        preferences: [],
        createdAt,
      };

      const streamedResponses = new Map(
        turn.responses.map((response) => [response.connectorId, response])
      );

      setConversations((current) => {
        const next = current.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;

          const isFirstTurn = conversation.turns.length === 0;
          return {
            ...conversation,
            title: isFirstTurn ? generateConversationTitle(trimmedPrompt) : conversation.title,
            updatedAt: createdAt,
            selectedConnectorIds: turn.selectedConnectorIds,
            turns: [...conversation.turns, turn],
          };
        });
        const sorted = sortConversations(next);
        conversationRepository.save(sorted);
        return sorted;
      });

      await orchestrate({
        connectorIds: validConnectorIds,
        generateOptions: { prompt: trimmedPrompt },
        conversationId,
        turnId,
        onUpdate: (connectorId, responseUpdate) => {
          const currentResponse = streamedResponses.get(connectorId);
          if (currentResponse) {
            streamedResponses.set(connectorId, { ...currentResponse, ...responseUpdate });
          }
          updateTurn(conversationId, turnId, (currentTurn) => ({
            ...currentTurn,
            responses: currentTurn.responses.map((response) =>
              response.connectorId === connectorId
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
      renameConversation,
      setConversationPinned,
      deleteConversation,
      setResponsePreference,
      submitPrompt,
      isConversationRunning,
    }),
    [
      activeConversationId,
      conversations,
      createConversation,
      deleteConversation,
      getConversation,
      hydrated,
      isConversationRunning,
      renameConversation,
      setActiveConversation,
      setConversationPinned,
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
