// ─── AI Provider Types ────────────────────────────────────────────────────────

export type ResponseStatus = 'waiting' | 'generating' | 'completed' | 'failed' | 'retrying';

export type ModelType = 'text' | 'image' | 'multimodal';

export type ProviderID = 'openai' | 'anthropic' | 'google' | 'grok' | 'mock';

/** Maps to the actual AI website — used by the browser extension */
export type PlatformId =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'grok'
  | 'vibe'
  | 'qwen'
  | 'meta'
  | 'kimi'
  | 'copilot'
  | 'manus'
  | 'deepseek'
  | 'perplexity'
  | 'mistral';

/** Maps ProviderID → PlatformId for extension routing */
export const PROVIDER_TO_PLATFORM: Record<ProviderID, PlatformId | null> = {
  openai:    'chatgpt',
  anthropic: 'claude',
  google:    'gemini',
  grok:      'grok',
  mock:      null,
};

export interface AIModel {
  id: string;
  provider: ProviderID;
  /** Override: which browser platform this model maps to (defaults via PROVIDER_TO_PLATFORM) */
  platformId?: PlatformId;
  modelKey: string;
  displayName: string;
  description?: string;
  modelType: ModelType;
  contextWindow?: number;
  isActive: boolean;
  isFeatured?: boolean;
  isComingSoon?: boolean;
  iconColor?: string;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  [key: string]: unknown;
}

export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
  error?: string;
}

export interface GenerateResult {
  content: string;
  latencyMs: number;
  tokenCount?: number;
}

export interface AIProvider {
  readonly id: ProviderID;
  readonly displayName: string;
  supportsModel?(modelKey: string): boolean;
  generate(
    modelKey: string,
    options: GenerateOptions,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<GenerateResult>;
  isAvailable(): boolean;
}

import type { ConnectorId } from './connectors';

export interface ArenaResponse {
  id: string;
  connectorId: ConnectorId;
  connectorName: string;
  provider: string;
  status: ResponseStatus;
  content: string;
  latencyMs?: number;
  tokenCount?: number;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  /** Legacy model reference for backward compatibility with previous stored turns */
  model?: AIModel;
}

export interface OrchestratorOptions {
  connectorIds: ConnectorId[];
  generateOptions: GenerateOptions;
  onUpdate: (connectorId: ConnectorId, response: Partial<ArenaResponse>) => void;
  /** Required for extension mode to correlate streaming responses */
  conversationId?: string;
  turnId?: string;
  /** Legacy fallback */
  models?: AIModel[];
}
