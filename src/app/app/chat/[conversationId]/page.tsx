'use client';

import React, { useEffect, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArenaGrid } from '@/components/arena/ArenaGrid';
import { PromptComposer } from '@/components/chat/PromptComposer';
import { useConnectors } from '@/features/connectors/connector-context';
import { useConversationStore } from '@/features/conversations/conversation-store';
import type { OmniConnector } from '@/types/connectors';

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ChatPage({ params }: PageProps) {
  const { conversationId } = use(params);
  const { connectors, activeConnectorIds, toggleConnector, openModal } = useConnectors();
  const {
    getConversation,
    hydrated,
    isConversationRunning,
    setActiveConversation,
    setResponsePreference,
    submitPrompt,
  } = useConversationStore();

  const router = useRouter();
  const conversation = getConversation(conversationId);
  const isRunning = isConversationRunning(conversationId);

  const activeConnectors = activeConnectorIds
    .map((id) => connectors.find((c) => c.id === id))
    .filter((c): c is OmniConnector => Boolean(c));

  useEffect(() => {
    setActiveConversation(conversationId);
  }, [conversationId, setActiveConversation]);

  // The open conversation was removed (e.g. deleted via the sidebar) → fresh empty Arena.
  useEffect(() => {
    if (hydrated && !conversation) {
      router.replace('/app');
    }
  }, [hydrated, conversation, router]);

  const handleSubmit = useCallback((prompt: string) => {
    void submitPrompt(conversationId, prompt, activeConnectorIds);
  }, [conversationId, activeConnectorIds, submitPrompt]);

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">Loading Arena…</div>;
  }

  if (!conversation) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">This Arena was not found.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main arena area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <AnimatePresence>
          {conversation.turns.map((turn) => {
            const allDone = turn.responses.length > 0 && turn.responses.every(
              (response) => response.status === 'completed' || response.status === 'failed'
            );

            return (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-xl bg-bg-elevated border border-border-default rounded-card px-5 py-3 shadow-sm">
                    <p className="text-sm text-text-primary leading-relaxed">{turn.prompt}</p>
                  </div>
                </div>

                {/* Arena responses — Horizontal Carousel */}
                {turn.responses.length > 0 && (
                  <ArenaGrid
                    responses={turn.responses}
                    allDone={allDone}
                    review={turn.review}
                    preferences={turn.preferences ?? []}
                    onPreference={(responseId, type) => setResponsePreference(conversationId, turn.id, responseId, type)}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {conversation.turns.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-2">
            <p className="text-sm font-medium text-text-secondary">Ready for your prompt</p>
            <p className="text-xs text-text-muted max-w-sm">
              Your prompt will be broadcast simultaneously to all {activeConnectors.length} active connectors.
            </p>
          </div>
        )}
      </div>

      {/* Sticky prompt composer */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-border-subtle bg-bg-base/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <PromptComposer
            onSubmit={handleSubmit}
            activeConnectors={activeConnectors}
            onRemoveConnector={toggleConnector}
            onOpenManageConnectors={openModal}
            disabled={isRunning}
          />
        </div>
      </div>
    </div>
  );
}
