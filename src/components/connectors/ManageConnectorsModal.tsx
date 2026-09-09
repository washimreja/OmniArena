'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { useConnectors } from '@/features/connectors/connector-context';
import { ConnectorCard } from './ConnectorCard';
import type { ConnectorWave } from '@/types/connectors';
import { WAVE_METADATA } from '@/lib/constants/connectors';

type TabFilter = 'all' | ConnectorWave;

export function ManageConnectorsModal() {
  const { connectors, isModalOpen, closeModal, activeConnectorIds, isExtensionInstalled } =
    useConnectors();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredConnectors = connectors.filter((c) => {
    if (activeTab === 'all') return true;
    return c.wave === activeTab;
  });

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border-subtle bg-bg-elevated/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-accent/15 text-accent">
                    <Sparkles size={16} />
                  </span>
                  <h2 className="text-lg font-bold text-text-primary">
                    Omni Connectors Hub
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium border border-accent/30">
                    {activeConnectorIds.length} Active in Arena
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  Connect your AI accounts. One Dashboard. Multiple AI Accounts. Your Own Connections.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Architecture Info Banner */}
            <div className="px-6 py-3 bg-gradient-to-r from-accent/10 via-bg-elevated to-transparent border-b border-border-subtle flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-text-secondary">
                <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Zero API Keys Needed:</strong> OmniArena routes your prompt to your real, logged-in browser tabs via the extension.
                </span>
              </div>
              {!isExtensionInstalled && (
                <a
                  href="https://github.com/washimreja/OmniArena#extension"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline flex-shrink-0"
                >
                  <span>Install Extension</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Wave Filter Tabs */}
            <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-border-subtle overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-accent/20 text-accent border border-accent/40'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                All Connectors ({connectors.length})
              </button>
              {([1, 2, 3] as ConnectorWave[]).map((wave) => {
                const info = WAVE_METADATA[wave];
                const count = connectors.filter((c) => c.wave === wave).length;
                const isSelected = activeTab === wave;
                return (
                  <button
                    key={wave}
                    type="button"
                    onClick={() => setActiveTab(wave)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                    }`}
                  >
                    <span>{info.badge}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Connector Cards Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnectors.map((connector) => (
                  <ConnectorCard key={connector.id} connector={connector} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-border-subtle bg-bg-elevated/40">
              <span className="text-xs text-text-muted">
                Tip: Log into your accounts once in Chrome and they will stay connected.
              </span>
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-btn bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
