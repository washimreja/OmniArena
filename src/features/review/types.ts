import type { ArenaResponse } from '@/types/ai';

export type ReviewStatus = 'generating' | 'completed' | 'failed';
export type PreferenceType = 'preferred' | 'helpful' | 'not_helpful';

export interface ResponsePreference {
  responseId: string;
  type: PreferenceType;
  createdAt: string;
}

export interface ModelReview {
  id: string;
  reviewerModelKey: string;
  targetModelKey: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export interface ArenaVerdictData {
  outcome: 'winner' | 'tie';
  bestOverallModelKey: string;
  bestForQuickAnswerModelKey: string;
  bestForDeepExplanationModelKey: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  strengths: string[];
  tradeoffs: string[];
}

export interface ArenaReview {
  id: string;
  conversationId: string;
  turnId: string;
  status: ReviewStatus;
  reviews: ModelReview[];
  verdict?: ArenaVerdictData;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ReviewRequest {
  conversationId: string;
  turnId: string;
  prompt: string;
  responses: ArenaResponse[];
}

export interface ReviewProvider {
  review(request: ReviewRequest): Promise<Pick<ArenaReview, 'reviews' | 'verdict'>>;
}
