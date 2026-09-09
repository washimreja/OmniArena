'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OmniConnector } from '@/types/connectors';
import { ConnectorIcon } from '@/components/icons/ConnectorIcon';
import { useConnectors } from '@/features/connectors/connector-context';

interface ConnectorCardProps {
  connector: OmniConnector;
}

/**
 * Minimal connector row: logo, name, company — and a single action.
 * No wave badges, no marketing copy, no category labels.
 * Connection status (● Connected / Connect / Coming Soon) and Arena
 * selection (✓) are the only signals shown.
 */
export function ConnectorCard({ connector }: ConnectorCardProps) {
  const { getConnectorStatus, isConnectorActive, toggleConnector, connectAccount } =
    useConnectors();

  const status = getConnectorStatus(connector.id);
  const isActive = isConnectorActive(connector.id);
  const isConnected = status === 'connected';
  const isComingSoon = status === 'coming_soon' || connector.isComingSoon;

  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-xl border px-4 py-3.5 transition-colors duration-150',
        isActive
          ? 'border-border-default bg-bg-elevated/60'
          : 'border-border-subtle bg-bg-surface/40 hover:border-border-default hover:bg-bg-surface'
      )}
    >
      {/* Logo */}
      <ConnectorIcon connectorId={connector.id} size="md" />

      {/* Name + company */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{connector.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-text-muted">{connector.providerName}</p>
      </div>

      {/* Single right-side action / status */}
      {isConnected ? (
        <div className="flex flex-shrink-0 items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Connected
          </span>
          <button
            type="button"
            onClick={() => toggleConnector(connector.id)}
            aria-pressed={isActive}
            title={isActive ? 'In the Arena — click to remove' : 'Add to the Arena'}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-[5px] border transition-colors',
              isActive
                ? 'border-accent bg-accent text-white'
                : 'border-border-strong text-transparent hover:border-accent/60'
            )}
          >
            <Check size={11} strokeWidth={3} />
          </button>
        </div>
      ) : isComingSoon ? (
        <span className="flex-shrink-0 text-[11px] text-text-muted">Coming Soon</span>
      ) : (
        <button
          type="button"
          onClick={() => connectAccount(connector.id)}
          className="flex-shrink-0 rounded-badge border border-border-default px-3 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
        >
          Connect
        </button>
      )}
    </div>
  );
}
