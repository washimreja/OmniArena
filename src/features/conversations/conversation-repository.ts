import type { ConversationSnapshot, StoredConversation } from './types';
import type { ConnectorId } from '@/types/connectors';
import { getConnector } from '@/lib/constants/connectors';

export interface ConversationRepository {
  load(): ConversationSnapshot;
  save(conversations: StoredConversation[]): void;
  saveActiveConversationId(conversationId: string | null): void;
}

const STORAGE_KEY = 'omniarena:conversations:v1';
const ACTIVE_CONVERSATION_KEY = 'omniarena:active-conversation:v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function normalizeConnectorId(raw: string | undefined): ConnectorId {
  if (!raw) return 'chatgpt';
  if (raw.includes('claude') || raw.includes('anthropic')) return 'claude';
  if (raw.includes('gemini') || raw.includes('google')) return 'gemini';
  if (raw.includes('grok')) return 'grok';
  if (raw.includes('deepseek')) return 'deepseek';
  if (raw.includes('mistral')) return 'mistral';
  if (raw.includes('qwen')) return 'qwen';
  if (raw.includes('copilot')) return 'copilot';
  return 'chatgpt';
}

class LocalStorageConversationRepository implements ConversationRepository {
  load(): ConversationSnapshot {
    if (!isBrowser()) {
      return { conversations: [], activeConversationId: null };
    }

    try {
      const rawConversations = window.localStorage.getItem(STORAGE_KEY);
      const conversations = rawConversations
        ? (JSON.parse(rawConversations) as StoredConversation[])
        : [];

      const normalizedConversations = Array.isArray(conversations)
        ? conversations.map((conversation) => ({
          ...conversation,
          selectedConnectorIds:
            conversation.selectedConnectorIds ?? ['chatgpt', 'claude', 'gemini'],
          turns: Array.isArray(conversation.turns)
            ? conversation.turns.map((turn) => ({
              ...turn,
              selectedConnectorIds:
                turn.selectedConnectorIds ?? ['chatgpt', 'claude', 'gemini'],
              preferences: turn.preferences ?? [],
              responses: Array.isArray(turn.responses)
                ? turn.responses.map((res) => {
                  const connectorId = res.connectorId ?? normalizeConnectorId(res.model?.modelKey || res.model?.provider);
                  const connector = getConnector(connectorId);
                  return {
                    ...res,
                    connectorId,
                    connectorName: res.connectorName ?? connector?.name ?? 'AI Connector',
                    provider: res.provider ?? connector?.providerName ?? 'AI Platform',
                  };
                })
                : [],
            }))
            : [],
        }))
        : [];

      return {
        conversations: normalizedConversations,
        activeConversationId: window.localStorage.getItem(ACTIVE_CONVERSATION_KEY),
      };
    } catch {
      return { conversations: [], activeConversationId: null };
    }
  }

  save(conversations: StoredConversation[]): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }

  saveActiveConversationId(conversationId: string | null): void {
    if (!isBrowser()) return;

    if (conversationId) {
      window.localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
    } else {
      window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  }
}

export const conversationRepository: ConversationRepository =
  new LocalStorageConversationRepository();
