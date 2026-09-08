'use client';

import React, { useEffect, useCallback } from 'react';
import { use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArenaGrid } from '@/components/arena/ArenaGrid';
import { PromptComposer } from '@/components/chat/PromptComposer';
import { useSelectedModels } from '@/features/models/hooks';
import { useConversationStore } from '@/features/conversations/conversation-store';

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ChatPage({ params }: PageProps) {
  const { conversationId } = use(params);
  const { selectedModels, selectedKeys, toggle } = useSelectedModels();
  const { getConversation, hydrated, isConversationRunning, setActiveConversation, setResponsePreference, submitPrompt } = useConversationStore();
  const conversation = getConversation(conversationId);
  const isRunning = isConversationRunning(conversationId);

  useEffect(() => {
    setActiveConversation(conversationId);
  }, [conversationId, setActiveConversation]);

  const handleSubmit = useCallback((prompt: string) => {
    void submitPrompt(conversationId, prompt, selectedKeys);
  }, [conversationId, selectedKeys, submitPrompt]);

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">Loading Arena…</div>;
  }

  if (!conversation) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">This Arena was not found.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation title bar */}
      {conversation && (
        <div className="px-6 py-3 border-b border-border-subtle">
          <p className="text-xs text-text-muted font-medium truncate">{conversation.title}</p>
        </div>
      )}

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
                <div className="max-w-xl bg-bg-elevated border border-border-default rounded-card px-5 py-3">
                  <p className="text-sm text-text-primary leading-relaxed">{turn.prompt}</p>
                </div>
              </div>

              {/* Arena responses */}
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
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <p className="text-sm text-text-muted">Submit a prompt below to start the Arena.</p>
          </div>
        )}
      </div>

      {/* Sticky prompt composer */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-border-subtle bg-bg-base/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <PromptComposer
            onSubmit={handleSubmit}
            selectedModels={selectedModels}
            selectedKeys={selectedKeys}
            onToggleModel={toggle}
            onRemoveModel={toggle}
            disabled={isRunning}
          />
        </div>
      </div>
    </div>
  );
}
