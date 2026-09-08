'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/home/EmptyState';
import { useConversationStore } from '@/features/conversations/conversation-store';
import { useSelectedModels } from '@/features/models/hooks';

export default function AppHomePage() {
  const router = useRouter();
  const { selectedModels, selectedKeys, toggle } = useSelectedModels();
  const { activeConversationId, createConversation, hydrated, submitPrompt } = useConversationStore();

  useEffect(() => {
    if (hydrated && activeConversationId) {
      router.replace(`/app/chat/${activeConversationId}`);
    }
  }, [activeConversationId, hydrated, router]);

  const handleSubmit = useCallback((prompt: string) => {
    const conversation = createConversation();
    void submitPrompt(conversation.id, prompt, selectedKeys);
    router.push(`/app/chat/${conversation.id}`);
  }, [createConversation, router, selectedKeys, submitPrompt]);

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">Loading Arena…</div>;
  }

  return (
    <EmptyState
      selectedModels={selectedModels}
      selectedKeys={selectedKeys}
      onToggleModel={toggle}
      onRemoveModel={toggle}
      onSubmit={handleSubmit}
    />
  );
}
