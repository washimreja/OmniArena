'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Layers,
  Cpu,
} from 'lucide-react';
import { useConnectors } from '@/features/connectors/connector-context';
import { ConnectorCard } from '@/components/connectors/ConnectorCard';
import { WAVE_METADATA } from '@/lib/constants/connectors';
import type { ConnectorWave } from '@/types/connectors';

export default function SettingsPage() {
  const {
    connectors,
    activeConnectorIds,
    isExtensionInstalled,
  } = useConnectors();

  const [activeWaveTab, setActiveWaveTab] = useState<'all' | ConnectorWave>('all');

  const filteredConnectors = connectors.filter((c) => {
    if (activeWaveTab === 'all') return true;
    return c.wave === activeWaveTab;
  });

  const liveCount = connectors.filter((c) => c.wave === 1).length;
  const wave2Count = connectors.filter((c) => c.wave === 2).length;
  const wave3Count = connectors.filter((c) => c.wave === 3).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-accent/20 text-accent">
            <Cpu size={18} />
          </span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Omni Connectors Hub
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Connect your AI accounts. One Dashboard. Multiple AI Accounts. Your Own Connections.
        </p>
      </div>

      {/* Metrics & Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-surface p-4 border border-border-subtle rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Active in Arena</p>
            <p className="text-lg font-bold text-text-primary">
              {activeConnectorIds.length}{' '}
              <span className="text-xs text-text-muted font-normal">/ {connectors.length}</span>
            </p>
          </div>
        </div>

        <div className="card-surface p-4 border border-border-subtle rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Extension Status</p>
            <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isExtensionInstalled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isExtensionInstalled ? 'Active & Connected' : 'Extension Not Detected'}
            </p>
          </div>
        </div>

        <div className="card-surface p-4 border border-border-subtle rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Connector Waves</p>
            <p className="text-xs text-text-secondary mt-0.5">
              <span className="text-emerald-400 font-semibold">{liveCount} Live</span> ·{' '}
              <span className="text-sky-400 font-semibold">{wave2Count} Wave 2</span> ·{' '}
              <span className="text-purple-400 font-semibold">{wave3Count} Roadmap</span>
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Concept Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-bg-surface via-bg-elevated/80 to-bg-surface border border-border-default mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
              <Sparkles size={12} />
              <span>How Omni Connectors Work</span>
            </div>
            <h2 className="text-base font-semibold text-text-primary">
              No API Keys. Powered by Your Browser Sessions.
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Instead of paying for expensive developer API keys, OmniArena lets you connect directly
              to your personal or subscription accounts (ChatGPT Plus, Claude Pro, Gemini Advanced).
              Your prompts are sent directly to your logged-in browser tabs via the OmniArena Chrome extension.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <a
              href="https://github.com/washimreja/OmniArena#extension"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-btn bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
            >
              <span>Download Extension</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Wave Filter & List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-text-primary">All Connectors</h2>
          <p className="text-xs text-text-muted">
            Toggle which connectors should receive prompts when you submit in Arena.
          </p>
        </div>

        {/* Wave Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-border-subtle rounded-xl self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveWaveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeWaveTab === 'all'
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All (10)
          </button>
          {([1, 2, 3] as ConnectorWave[]).map((wave) => {
            const isSelected = activeWaveTab === wave;
            const info = WAVE_METADATA[wave];
            return (
              <button
                key={wave}
                type="button"
                onClick={() => setActiveWaveTab(wave)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-accent/20 text-accent border border-accent/40'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <span>{info.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => (
          <ConnectorCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}
