import type { ArenaResponse } from '@/types/ai';
import type { Attachment } from '@/types/app';
import type { ArenaReview, ResponsePreference } from '@/features/review/types';
import type { ConnectorId } from '@/types/connectors';

export interface ConversationTurn {
  id: string;
  conversationId: string;
  prompt: string;
  attachments: Attachment[];
  selectedConnectorIds: ConnectorId[];
  /** Optional legacy keys for backward-compat with previously saved mock turns */
  selectedModelKeys?: string[];
  responses: ArenaResponse[];
  review?: ArenaReview;
  preferences: ResponsePreference[];
  createdAt: string;
}

export interface StoredConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** Pinned conversations float to the top of the sidebar in a dedicated section. */
  isPinned?: boolean;
  /** Set when pinned; used to sort pinned conversations among themselves. */
  pinnedAt?: string | null;
  selectedConnectorIds: ConnectorId[];
  /** Optional legacy keys */
  selectedModelKeys?: string[];
  turns: ConversationTurn[];
}

export interface ConversationSnapshot {
  conversations: StoredConversation[];
  activeConversationId: string | null;
}
