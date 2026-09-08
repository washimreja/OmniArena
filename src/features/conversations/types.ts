import type { ArenaResponse } from '@/types/ai';
import type { Attachment } from '@/types/app';
import type { ArenaReview, ResponsePreference } from '@/features/review/types';

export interface ConversationTurn {
  id: string;
  conversationId: string;
  prompt: string;
  attachments: Attachment[];
  selectedModelKeys: string[];
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
  selectedModelKeys: string[];
  turns: ConversationTurn[];
}

export interface ConversationSnapshot {
  conversations: StoredConversation[];
  activeConversationId: string | null;
}
