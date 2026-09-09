import type { AIModel } from "@/types/ai";

export const MOCK_MODELS: AIModel[] = [
  {
    id: "model-gpt4o",
    provider: "openai",
    modelKey: "gpt-4o",
    displayName: "GPT-4o",
    description: "Most capable multimodal model. Excellent at reasoning and complex tasks.",
    contextWindow: 128000,
    isFeatured: true,
  },
  {
    id: "model-gpt4o-mini",
    provider: "openai",
    modelKey: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    description: "Fast and affordable. Great for most everyday tasks.",
    contextWindow: 128000,
  },
  {
    id: "model-claude-sonnet",
    provider: "anthropic",
    modelKey: "claude-3-5-sonnet",
    displayName: "Claude 3.5 Sonnet",
    description: "Highly capable with exceptional reasoning and nuanced understanding.",
    contextWindow: 200000,
    isFeatured: true,
  },
  {
    id: "model-claude-haiku",
    provider: "anthropic",
    modelKey: "claude-3-haiku",
    displayName: "Claude 3 Haiku",
    description: "Fast and compact. Ideal for quick tasks and high throughput.",
    contextWindow: 200000,
  },
  {
    id: "model-gemini-pro",
    provider: "google",
    modelKey: "gemini-1-5-pro",
    displayName: "Gemini 1.5 Pro",
    description: "Google most advanced model with a massive context window.",
    contextWindow: 1000000,
    isFeatured: true,
  },
  {
    id: "model-gemini-flash",
    provider: "google",
    modelKey: "gemini-flash",
    displayName: "Gemini 1.5 Flash",
    description: "Speed optimized for latency-sensitive applications.",
    contextWindow: 1000000,
  },
  {
    id: "model-grok2",
    provider: "grok",
    modelKey: "grok-2",
    displayName: "Grok-2",
    description: "xAI flagship model with real-time knowledge and sharp analysis.",
    contextWindow: 131072,
  },
];

export const PROVIDERS_ORDER = ["openai", "anthropic", "google", "grok"] as const;

export const PROVIDER_DISPLAY: Record<string, { label: string; color: string }> = {
  openai:    { label: "OpenAI",     color: "#10A37F" },
  anthropic: { label: "Anthropic",  color: "#CC785C" },
  google:    { label: "Google",     color: "#4285F4" },
  grok:      { label: "xAI / Grok", color: "#1DA1F2" },
  mock:      { label: "Mock",       color: "#8888A0" },
};

export function getModelsByProvider(): Record<string, AIModel[]> {
  const groups: Record<string, AIModel[]> = {};
  MOCK_MODELS.forEach((model) => {
    if (!groups[model.provider]) groups[model.provider] = [];
    groups[model.provider].push(model);
  });
  return groups;
}

export function getModelByKey(key: string): AIModel | undefined {
  return MOCK_MODELS.find((m) => m.modelKey === key);
}

export const DEFAULT_SELECTED_MODELS = ["gpt-4o", "claude-3-5-sonnet", "gemini-1-5-pro"];