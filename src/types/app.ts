// ─── App-level Shared Types ───────────────────────────────────────────────────

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  selectedModelIds: string[];
  attachments: Attachment[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface ConversationTurn {
  message: Message;
  responses: import('./ai').ArenaResponse[];
  judgeResult?: JudgeResult;
}

export interface JudgeResult {
  id: string;
  winningResponseId: string;
  reasoning: string;
  rankings: Array<{
    responseId: string;
    rank: number;
    score: number;
    notes: string;
  }>;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  username?: string;
  plan: 'free' | 'pro' | 'team';
  createdAt: string;
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  category?: string;
  icon?: string;
}
