import type { ConversationSnapshot, StoredConversation } from './types';

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
          turns: Array.isArray(conversation.turns)
            ? conversation.turns.map((turn) => ({ ...turn, preferences: turn.preferences ?? [] }))
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
