import type { AIProvider, ProviderID } from '@/types/ai';
import { mockProvider } from './providers/mock';

export type ProviderResolutionErrorCode =
  | 'unknown_provider'
  | 'provider_unavailable'
  | 'unsupported_model';

export class ProviderResolutionError extends Error {
  readonly code: ProviderResolutionErrorCode;
  readonly providerId: string;
  readonly modelKey: string;

  constructor(code: ProviderResolutionErrorCode, providerId: string, modelKey: string) {
    const message = {
      unknown_provider: `AI provider "${providerId}" is not registered.`,
      provider_unavailable: `AI provider "${providerId}" is unavailable.`,
      unsupported_model: `AI provider "${providerId}" does not support model "${modelKey}".`,
    }[code];

    super(message);
    this.name = 'ProviderResolutionError';
    this.code = code;
    this.providerId = providerId;
    this.modelKey = modelKey;
  }
}

class ProviderRegistry {
  private providers = new Map<ProviderID, AIProvider>();

  register(provider: AIProvider, providerId: ProviderID = provider.id): void {
    this.providers.set(providerId, provider);
  }

  get(id: string): AIProvider | undefined {
    return this.providers.get(id as ProviderID);
  }

  resolve(providerId: string, modelKey: string): AIProvider {
    const provider = this.get(providerId);
    if (!provider) {
      throw new ProviderResolutionError('unknown_provider', providerId, modelKey);
    }

    if (!provider.isAvailable()) {
      throw new ProviderResolutionError('provider_unavailable', providerId, modelKey);
    }

    if (provider.supportsModel && !provider.supportsModel(modelKey)) {
      throw new ProviderResolutionError('unsupported_model', providerId, modelKey);
    }

    return provider;
  }

  getOrThrow(id: string): AIProvider {
    const provider = this.get(id);
    if (!provider) throw new Error(`AI provider "${id}" is not registered.`);
    return provider;
  }

  isRegistered(id: string): boolean {
    return this.providers.has(id as ProviderID);
  }

  list(): AIProvider[] {
    return [...new Set(this.providers.values())];
  }
}

export const registry = new ProviderRegistry();

// Until real adapters are added, every supported provider key uses the isolated mock adapter.
(['openai', 'anthropic', 'google', 'grok'] as const).forEach((providerId) => {
  registry.register(mockProvider, providerId);
});
