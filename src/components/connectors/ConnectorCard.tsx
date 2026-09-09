'use client';

import React from 'react';
import { ExternalLink, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OmniConnector } from '@/types/connectors';
import { ConnectorIcon } from '@/components/icons/ConnectorIcon';
import { ConnectorStatusDot } from './ConnectorStatusDot';
import { useConnectors } from '@/features/connectors/connector-context';

interface ConnectorCardProps {
  connector: OmniConnector;
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  const {
    getConnectorStatus,
    isConnectorActive,
    toggleConnector,
    connectAccount,
  } = useConnectors();

  const status = getConnectorStatus(connector.id);
  const isActive = isConnectorActive(connector.id);
  const isConnected = status === 'connected';
  const isWave1 = connector.wave === 1;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200',
        isActive && isConnected
          ? 'bg-bg-elevated/70 border-border-strong shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
          : 'bg-bg-surface/50 border-border-subtle hover:border-border-default hover:bg-bg-surface'
      )}
    >
      {/* Top row: Icon + Names + Wave Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <ConnectorIcon connectorId={connector.id} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary truncate">
                {connector.name}
              </h3>
              <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-bg-elevated border border-border-subtle">
                {connector.providerName}
              </span>
            </div>
            <p className="text-[11px] text-text-muted truncate mt-0.5">
              {connector.category}
            </p>
          </div>
        </div>

        {/* Wave indicator badge */}
        <span
          className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0',
            connector.wave === 1
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : connector.wave === 2
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
          )}
        >
          {isWave1 ? 'Live' : `Wave ${connector.wave}`}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
        {connector.description}
      </p>

      {/* Bottom controls */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle gap-2">
        {/* Status dot */}
        <div className="flex items-center gap-2">
          <ConnectorStatusDot status={status} showLabel size="sm" />
        </div>

        {/* Action button */}
        <div className="flex items-center gap-1.5">
          {/* Open Account Website button */}
          <button
            type="button"
            onClick={() => connectAccount(connector.id)}
            title={`Open ${connector.name} in new tab to log in`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text-primary px-2 py-1 rounded bg-bg-elevated hover:bg-bg-hover transition-colors"
          >
            <span>{isConnected ? 'Open Tab' : 'Connect'}</span>
            <ExternalLink size={11} className="opacity-70" />
          </button>

          {/* Arena prompt toggle */}
          {connector.supported && (
            <button
              type="button"
              onClick={() => toggleConnector(connector.id)}
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md transition-all',
                isActive
                  ? 'bg-accent text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              {isActive ? (
                <>
                  <Check size={12} />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <Plus size={12} />
                  <span>Add to Arena</span>
                </>
              )}
            </button>
          )}

          {!connector.supported && (
            <span className="text-[10px] text-text-muted italic px-2 py-1">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
