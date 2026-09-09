export type ModelType = 'text' | 'image' | 'multimodal';
export type ProviderID = 'openai' | 'anthropic' | 'google' | 'grok' | 'mock';

/** Maps to the actual AI website — used by the browser extension */
export type PlatformId =
  | 'chatgpt' | 'claude' | 'gemini' | 'grok' | 'vibe' | 'qwen' | 'meta'
  | 'kimi' | 'copilot' | 'manus' | 'deepseek' | 'perplexity' | 'mistral';

/** Maps ProviderID → PlatformId for extension routing */
export const PROVIDER_TO_PLATFORM: Record<ProviderID, PlatformId | null> = {
  openai: 'chatgpt', anthropic: 'claude', google: 'gemini', grok: 'grok', mock: null,
};

export interface AIModel {
  id: string; provider: ProviderID;
  platformId?: PlatformId;
  modelKey: string; displayName: string; description?: string;
  contextWindow?: number; pricing?: { input: number; output: number };
  knowledgeCutoff?: string; imageGeneration?: boolean; vision?: boolean;
  temperature?: number; topP?: number; maxTokens?: number;
  company?: string; position?: number; isFeatured?: boolean;
}

export type ResponseStatus = 'waiting' | 'generating' | 'completed' | 'failed';
export type ProviderAvailability = 'available' | 'unavailable' | 'rate_limited';

export interface AIProvider {
  id: string; displayName: string; company?: string;
  supportsModel?(modelKey: string): boolean;
  isAvailable(): boolean;
}

import type { ConnectorId } from './connectors';

export interface ArenaResponse {
  id: string; connectorId: ConnectorId; connectorName: string; provider: string;
  status: ResponseStatus; content: string;
  latencyMs?: number; tokenCount?: number; error?: string;
  startedAt?: number; completedAt?: number;
  /** Legacy model reference for backward compatibility with previous stored turns */
  model?: AIModel;
}

export interface GenerateOptions { prompt: string; system?: string; images?: File[]; }
export interface StreamChunk { delta: string; done: boolean; }
export interface GenerateResult { content: string; latencyMs: number; tokenCount?: number; }

export interface OrchestratorOptions {
  connectorIds: ConnectorId[]; generateOptions: GenerateOptions;
  onUpdate: (connectorId: ConnectorId, response: Partial<ArenaResponse>) => void;
  conversationId?: string; turnId?: string;
  /** Legacy fallback */
  models?: AIModel[];
}
