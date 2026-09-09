'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ConnectorId, ConnectorStatus, OmniConnector } from '@/types/connectors';
import { OMNI_CONNECTORS, getConnector } from '@/lib/constants/connectors';
import { extensionBridge } from '@/lib/extension/bridge';

const ACTIVE_STORAGE_KEY = 'omniarena_active_connectors_v1';
const STATUS_STORAGE_KEY = 'omniarena_connector_statuses_v1';

const DEFAULT_ACTIVE: ConnectorId[] = ['chatgpt', 'claude', 'gemini'];

const DEFAULT_STATUSES: Record<ConnectorId, ConnectorStatus> = {
  chatgpt: 'connected',
  claude: 'connected',
  gemini: 'connected',
  grok: 'not_connected',
  deepseek: 'connected',
  mistral: 'coming_soon',
  qwen: 'not_connected',
  copilot: 'not_connected',
  meta: 'coming_soon',
  kimi: 'coming_soon',
  manus: 'coming_soon',
  vibe: 'coming_soon',
};

interface ConnectorContextValue {
  connectors: OmniConnector[];
  activeConnectorIds: ConnectorId[];
  statuses: Record<ConnectorId, ConnectorStatus>;
  isModalOpen: boolean;
  isExtensionInstalled: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleConnector: (id: ConnectorId) => void;
  setConnectorActive: (id: ConnectorId, active: boolean) => void;
  setConnectorStatus: (id: ConnectorId, status: ConnectorStatus) => void;
  connectAccount: (id: ConnectorId) => void;
  getConnectorStatus: (id: ConnectorId) => ConnectorStatus;
  isConnectorActive: (id: ConnectorId) => boolean;
}

const ConnectorContext = createContext<ConnectorContextValue | null>(null);

export function ConnectorProvider({ children }: { children: React.ReactNode }) {
  const [activeConnectorIds, setActiveConnectorIds] = useState<ConnectorId[]>(DEFAULT_ACTIVE);
  const [statuses, setStatuses] = useState<Record<ConnectorId, ConnectorStatus>>(DEFAULT_STATUSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    let parsedActive: ConnectorId[] | null = null;
    let parsedStatuses: Partial<Record<ConnectorId, ConnectorStatus>> | null = null;

    try {
      const storedActive = localStorage.getItem(ACTIVE_STORAGE_KEY);
      if (storedActive) {
        const parsed = JSON.parse(storedActive);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedActive = parsed;
        }
      }

      const storedStatuses = localStorage.getItem(STATUS_STORAGE_KEY);
      if (storedStatuses) {
        parsedStatuses = JSON.parse(storedStatuses);
      }
    } catch {
      // Ignore
    }

    const frameId = window.requestAnimationFrame(() => {
      if (parsedActive) setActiveConnectorIds(parsedActive);
      if (parsedStatuses) setStatuses((prev) => ({ ...prev, ...parsedStatuses }));
      setHydrated(true);
    });

    // Check extension availability
    extensionBridge.isInstalled().then((installed) => {
      setIsExtensionInstalled(installed);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // Save to localStorage whenever activeConnectorIds changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(activeConnectorIds));
    } catch {
      // Ignore quota errors
    }
  }, [activeConnectorIds, hydrated]);

  // Save to localStorage whenever statuses changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      // Ignore quota errors
    }
  }, [statuses, hydrated]);

  const toggleConnector = useCallback((id: ConnectorId) => {
    setActiveConnectorIds((prev) => {
      if (prev.includes(id)) {
        // Keep at least one active
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }, []);

  const setConnectorActive = useCallback((id: ConnectorId, active: boolean) => {
    setActiveConnectorIds((prev) => {
      if (active) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      if (prev.length === 1 && prev.includes(id)) return prev;
      return prev.filter((item) => item !== id);
    });
  }, []);

  const setConnectorStatus = useCallback((id: ConnectorId, status: ConnectorStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const connectAccount = useCallback((id: ConnectorId) => {
    const connector = getConnector(id);
    if (!connector) return;

    // Open the official AI platform website in a new tab so user logs in
    window.open(connector.websiteUrl, '_blank', 'noopener,noreferrer');

    // Mark as connected or connecting
    if (connector.supported) {
      setStatuses((prev) => ({ ...prev, [id]: 'connected' }));
      // Automatically activate it in Arena
      setActiveConnectorIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  }, []);

  const getConnectorStatus = useCallback(
    (id: ConnectorId): ConnectorStatus => {
      return statuses[id] ?? 'not_connected';
    },
    [statuses]
  );

  const isConnectorActive = useCallback(
    (id: ConnectorId): boolean => {
      return activeConnectorIds.includes(id);
    },
    [activeConnectorIds]
  );

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const value = useMemo<ConnectorContextValue>(
    () => ({
      connectors: OMNI_CONNECTORS,
      activeConnectorIds,
      statuses,
      isModalOpen,
      isExtensionInstalled,
      openModal,
      closeModal,
      toggleConnector,
      setConnectorActive,
      setConnectorStatus,
      connectAccount,
      getConnectorStatus,
      isConnectorActive,
    }),
    [
      activeConnectorIds,
      statuses,
      isModalOpen,
      isExtensionInstalled,
      openModal,
      closeModal,
      toggleConnector,
      setConnectorActive,
      setConnectorStatus,
      connectAccount,
      getConnectorStatus,
      isConnectorActive,
    ]
  );

  return <ConnectorContext.Provider value={value}>{children}</ConnectorContext.Provider>;
}

export function useConnectors() {
  const context = useContext(ConnectorContext);
  if (!context) {
    throw new Error('useConnectors must be used within a ConnectorProvider');
  }
  return context;
}
