'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/home/EmptyState';
import { useConversationStore } from '@/features/conversations/conversation-store';
import { useConnectors } from '@/features/connectors/connector-context';
import type { OmniConnector } from '@/types/connectors';

export default function AppHomePage() {
  const router = useRouter();
  const { connectors, activeConnectorIds, toggleConnector, openModal } = useConnectors();
  const { activeConversationId, createConversation, hydrated, submitPrompt } = useConversationStore();

  const activeConnectors = activeConnectorIds
    .map((id) => connectors.find((c) => c.id === id))
    .filter((c): c is OmniConnector => Boolean(c));

  useEffect(() => {
    if (hydrated && activeConversationId) {
      router.replace(`/app/chat/${activeConversationId}`);
    }
  }, [activeConversationId, hydrated, router]);

  const handleSubmit = useCallback((prompt: string) => {
    const conversation = createConversation();
    void submitPrompt(conversation.id, prompt, activeConnectorIds);
    router.push(`/app/chat/${conversation.id}`);
  }, [createConversation, router, activeConnectorIds, submitPrompt]);

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">Loading Arena…</div>;
  }

  return (
    <EmptyState
      activeConnectors={activeConnectors}
      onRemoveConnector={toggleConnector}
      onOpenManageConnectors={openModal}
      onSubmit={handleSubmit}
    />
  );
}
