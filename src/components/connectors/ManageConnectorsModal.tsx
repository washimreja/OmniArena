'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useConnectors } from '@/features/connectors/connector-context';
import { ConnectorCard } from './ConnectorCard';

type TabFilter = 'all' | 'connected';

const EXTENSION_URL = 'https://github.com/washimreja/OmniArena#extension';

/**
 * Calm, minimal connector manager.
 * Header → one-line extension note → All/Connected tabs → card grid → Done.
 * Everything that does not help the user act has been removed.
 */
export function ManageConnectorsModal() {
  const { connectors, isModalOpen, closeModal, getConnectorStatus, isExtensionInstalled } =
    useConnectors();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Close on Escape while open.
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  const connectedCount = connectors.filter(
    (connector) => getConnectorStatus(connector.id) === 'connected'
  ).length;

  const visibleConnectors = connectors.filter((connector) => {
    if (activeTab === 'all') return true;
    return getConnectorStatus(connector.id) === 'connected';
  });

  const tabs: { id: TabFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: connectors.length },
    { id: 'connected', label: 'Connected', count: connectedCount },
  ];

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Connect AI accounts"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pb-4 pt-5">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Connect AI Accounts</h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Use your existing AI accounts directly inside OmniArena.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
                aria-label="Close modal"
              >
                <X size={17} />
              </button>
            </div>

            {/* Compact extension note — only while the extension is missing */}
            {!isExtensionInstalled && (
              <div className="mx-6 mb-4 flex items-center justify-between gap-3 rounded-btn border border-border-subtle bg-bg-elevated/60 px-3.5 py-2.5">
                <p className="text-[11px] text-text-secondary">
                  Connect your AI accounts through the OmniArena browser extension.
                </p>
                <a
                  href={EXTENSION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold text-accent transition-colors hover:text-accent-hover"
                >
                  Get Extension
                  <ExternalLink size={11} />
                </a>
              </div>
            )}

            {/* Tabs: All / Connected */}
            <div className="flex items-center gap-1 border-b border-border-subtle px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    '-mb-px border-b-2 px-1 pb-2.5 pt-1 text-xs font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-accent text-text-primary'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  )}
                  aria-pressed={activeTab === tab.id}
                >
                  {tab.label}
                  <span className="ml-1.5 text-[10px] text-text-muted">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleConnectors.map((connector) => (
                  <ConnectorCard key={connector.id} connector={connector} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-border-subtle px-6 py-3.5">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-btn bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
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
