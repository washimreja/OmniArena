// ─── AI Provider Types ────────────────────────────────────────────────────────

export type ResponseStatus = 'waiting' | 'generating' | 'completed' | 'failed' | 'retrying';

export type ModelType = 'text' | 'image' | 'multimodal';

export type ProviderID = 'openai' | 'anthropic' | 'google' | 'grok' | 'mock';

export interface AIModel {
  id: string;
  provider: ProviderID;
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

export interface ArenaResponse {
  id: string;
  model: AIModel;
  status: ResponseStatus;
  content: string;
  latencyMs?: number;
  tokenCount?: number;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface OrchestratorOptions {
  models: AIModel[];
  generateOptions: GenerateOptions;
  onUpdate: (modelKey: string, response: Partial<ArenaResponse>) => void;
}
