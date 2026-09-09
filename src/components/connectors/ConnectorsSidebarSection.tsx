'use client';

import React from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { useConnectors } from '@/features/connectors/connector-context';
import { ConnectorStatusDot } from './ConnectorStatusDot';
import { ConnectorIcon } from '@/components/icons/ConnectorIcon';
import type { ConnectorId } from '@/types/connectors';

interface ConnectorsSidebarSectionProps {
  collapsed: boolean;
}

// Show these highlighted connectors in the sidebar section
const SIDEBAR_CONNECTOR_IDS: ConnectorId[] = [
  'chatgpt',
  'claude',
  'gemini',
  'grok',
  'qwen',
];

export function ConnectorsSidebarSection({ collapsed }: ConnectorsSidebarSectionProps) {
  const { connectors, getConnectorStatus, openModal, isConnectorActive, toggleConnector } =
    useConnectors();

  const sidebarConnectors = SIDEBAR_CONNECTOR_IDS.map((id) =>
    connectors.find((c) => c.id === id)
  ).filter(Boolean);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-3 border-t border-border-subtle">
        {sidebarConnectors.slice(0, 3).map((conn) => {
          if (!conn) return null;
          const status = getConnectorStatus(conn.id);
          return (
            <button
              key={conn.id}
              type="button"
              onClick={openModal}
              title={`${conn.name} (${status.replace('_', ' ')})`}
              className="relative p-1 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <ConnectorIcon connectorId={conn.id} size="xs" showBackground={false} />
              <span className="absolute -top-0.5 -right-0.5">
                <ConnectorStatusDot status={status} size="sm" />
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={openModal}
          title="Manage Connectors"
          className="w-7 h-7 mt-1 rounded-lg bg-bg-surface hover:bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          <SlidersHorizontal size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 py-3 border-t border-border-subtle">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Connectors
        </span>
        <button
          type="button"
          onClick={openModal}
          title="Manage all connectors"
          className="text-text-muted hover:text-text-primary transition-colors p-0.5 rounded"
        >
          <SlidersHorizontal size={12} />
        </button>
      </div>

      {/* Connectors List */}
      <div className="space-y-1">
        {sidebarConnectors.map((conn) => {
          if (!conn) return null;
          const status = getConnectorStatus(conn.id);
          const active = isConnectorActive(conn.id);

          return (
            <div
              key={conn.id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-bg-elevated/70 transition-colors group cursor-pointer"
              onClick={() => {
                if (conn.supported) toggleConnector(conn.id);
                else openModal();
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ConnectorStatusDot status={status} size="sm" />
                <span
                  className={`truncate font-medium transition-colors ${
                    active ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary'
                  }`}
                >
                  {conn.name}
                </span>
              </div>

              <span className="text-[10px] text-text-muted capitalize">
                {status === 'connected' ? (
                  <span className="text-emerald-400 font-medium">Connected</span>
                ) : status === 'not_connected' ? (
                  <span className="text-text-muted">Not Connected</span>
                ) : (
                  <span className="text-accent/80">Roadmap</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* [+ Manage Connectors] Button */}
      <button
        type="button"
        onClick={openModal}
        className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-btn bg-bg-surface hover:bg-bg-elevated border border-border-subtle hover:border-border-default text-xs font-medium text-text-secondary hover:text-text-primary transition-all shadow-sm"
      >
        <Plus size={13} className="text-accent" />
        <span>Manage Connectors</span>
      </button>
    </div>
  );
}
