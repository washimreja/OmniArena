import React from 'react';
import { MOCK_MODELS, PROVIDERS_ORDER, PROVIDER_DISPLAY, getModelsByProvider } from '@/features/models/registry';
import { ProviderIcon } from '@/components/models/ProviderIcon';

export const metadata = { title: 'Explore Models' };

export default function ModelsPage() {
  const modelsByProvider = getModelsByProvider();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-10 pb-6 border-b border-border-subtle">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted mb-3">Model directory</p>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-text-primary">Explore models</h1>
        <p className="text-sm text-text-secondary mt-2">{MOCK_MODELS.length} models available for your next Arena.</p>
      </div>

      <div className="space-y-9">
        {PROVIDERS_ORDER.map((providerId) => {
          const models = modelsByProvider[providerId];
          if (!models?.length) return null;
          const provider = PROVIDER_DISPLAY[providerId];

          return (
            <section key={providerId}>
              <div className="flex items-center gap-2.5 mb-3">
                <ProviderIcon provider={providerId} size="md" />
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">{provider?.label}</h2>
                  <p className="text-[11px] text-text-muted">{models.length} models</p>
                </div>
              </div>

              <div className="border-y border-border-subtle divide-y divide-border-subtle">
                {models.map((model) => (
                  <div key={model.modelKey} className="flex items-center justify-between gap-4 px-3 py-3 hover:bg-bg-surface transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <ProviderIcon provider={model.provider} size="sm" />
                      <p className="text-sm font-medium text-text-primary">{model.displayName}</p>
                    </div>
                    {model.contextWindow && (
                      <p className="text-[11px] text-text-muted whitespace-nowrap">{(model.contextWindow / 1000).toFixed(0)}k context</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
