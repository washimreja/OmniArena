'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import {
  MOCK_MODELS,
  PROVIDERS_ORDER,
  PROVIDER_DISPLAY,
  getModelsByProvider,
} from '@/features/models/registry';
import { ProviderIcon } from '@/components/icons/ProviderIcon';
import type { AIModel, ProviderID } from '@/types/ai';
import { cn } from '@/lib/utils/cn';

type ProviderFilter = 'all' | ProviderID;

const PROVIDER_TABS: Array<{ id: ProviderFilter; label: string }> = [
  { id: 'all', label: 'All' },
  ...PROVIDERS_ORDER.map((id) => ({ id, label: PROVIDER_DISPLAY[id].label })),
];

function formatContext(contextWindow?: number): string | null {
  if (!contextWindow) return null;
  return `${Math.round(contextWindow / 1000)}k context`;
}

function ModelRow({ model }: { model: AIModel }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-3 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <ProviderIcon provider={model.provider} size="sm" />
        <p className="truncate text-sm font-medium text-text-primary">{model.displayName}</p>
      </div>
      {formatContext(model.contextWindow) && (
        <p className="whitespace-nowrap text-[11px] text-text-muted">{formatContext(model.contextWindow)}</p>
      )}
    </div>
  );
}

function ProviderOverview({
  providerId,
  models,
  expanded,
  onToggle,
}: {
  providerId: Exclude<ProviderID, 'mock'>;
  models: AIModel[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const provider = PROVIDER_DISPLAY[providerId];
  const previewModels = models.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-bg-surface"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Hide' : 'View'} all ${provider.label} models`}
      >
        <ProviderIcon provider={providerId} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-text-primary">{provider.label}</span>
          <span className="mt-0.5 block text-[11px] text-text-muted">{models.length} models</span>
        </span>
        <span className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          {expanded ? 'Hide models' : 'View all'}
          <ChevronDown size={15} className={cn('transition-transform', expanded && 'rotate-180')} />
        </span>
      </button>

      <div className="px-1.5 pb-1.5">
        {(expanded ? models : previewModels).map((model) => (
          <ModelRow key={model.modelKey} model={model} />
        ))}
      </div>
    </section>
  );
}

export function ModelsDirectory() {
  const [activeProvider, setActiveProvider] = useState<ProviderFilter>('all');
  const [expandedProvider, setExpandedProvider] = useState<ProviderID | null>('openai');
  const modelsByProvider = useMemo(() => getModelsByProvider(), []);
  const selectedModels =
    activeProvider === 'all'
      ? null
      : (modelsByProvider[activeProvider] ?? []).filter((model) => model.isFeatured || model === modelsByProvider[activeProvider]?.[0]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Model directory</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-text-primary sm:text-4xl">Explore models</h1>
            <p className="mt-2 text-sm text-text-secondary">{MOCK_MODELS.length} models available for your next Arena.</p>
          </div>
          <p className="hidden text-xs text-text-muted sm:block">Choose the right models for your next comparison.</p>
        </div>
      </header>

      <nav className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Model providers">
        {PROVIDER_TABS.map((tab) => {
          const isActive = activeProvider === tab.id;
          const count = tab.id === 'all' ? MOCK_MODELS.length : modelsByProvider[tab.id]?.length ?? 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveProvider(tab.id);
                setExpandedProvider(tab.id === 'all' ? 'openai' : tab.id);
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-colors',
                isActive
                  ? 'border-accent/60 bg-accent/10 text-text-primary'
                  : 'border-border-subtle bg-bg-surface/30 text-text-secondary hover:border-border-strong hover:bg-bg-surface'
              )}
              aria-pressed={isActive}
            >
              {tab.id === 'all' ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-sm font-semibold text-accent">All</span>
              ) : (
                <ProviderIcon provider={tab.id} size="md" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{tab.label}</span>
                <span className="mt-0.5 block text-[10px] text-text-muted">{count} models</span>
              </span>
            </button>
          );
        })}
      </nav>

      {activeProvider === 'all' ? (
        <div className="space-y-3">
          {PROVIDERS_ORDER.map((providerId) => {
            const models = modelsByProvider[providerId] ?? [];
            return (
              <ProviderOverview
                key={providerId}
                providerId={providerId}
                models={models}
                expanded={expandedProvider === providerId}
                onToggle={() => setExpandedProvider(expandedProvider === providerId ? null : providerId)}
              />
            );
          })}
        </div>
      ) : (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <ProviderIcon provider={activeProvider} size="lg" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{PROVIDER_DISPLAY[activeProvider].label}</h2>
              <p className="text-xs text-text-muted">Featured models</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {selectedModels?.map((model) => (
              <div key={model.modelKey} className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-surface/40 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <ProviderIcon provider={model.provider} size="md" />
                  <p className="truncate text-sm font-semibold text-text-primary">{model.displayName}</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-text-muted">
                  {formatContext(model.contextWindow)}
                  <ArrowRight size={13} />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
