// ─── OmniArena Orchestrator ───────────────────────────────────────────────────
//
// Decides HOW to route prompts to AI Connectors:
//
//   Extension mode  → extensionBridge.sendPrompt(connectorIds) → real AI websites
//   Demo mode       → MockProvider(connectorId) → simulated streaming responses
//
// The conversation store calls orchestrate() and receives streaming updates via
// the onUpdate callback keyed by ConnectorId.

import type { OrchestratorOptions, PlatformId } from '@/types/ai';
import type { ConnectorId } from '@/types/connectors';
import { mockProvider } from './providers/mock';
import { extensionBridge } from '@/lib/extension/bridge';

// ─── Extension Mode ───────────────────────────────────────────────────────────

async function orchestrateViaExtension(options: OrchestratorOptions): Promise<void> {
  const {
    connectorIds,
    generateOptions,
    onUpdate,
    conversationId = 'unknown',
    turnId = 'unknown',
  } = options;

  // Mark all selected connectors as waiting
  for (const id of connectorIds) {
    onUpdate(id, { status: 'waiting', content: '' });
  }

  // Map connector IDs directly to extension platform IDs
  const platforms = connectorIds as PlatformId[];

  if (platforms.length === 0) return;

  // Track accumulated text per connector
  const accumulated = new Map<ConnectorId, string>();

  // Register response listener BEFORE sending
  const cleanup = extensionBridge.onResponse((platform, event) => {
    const connectorId = platform as ConnectorId;
    if (!connectorIds.includes(connectorId)) return;

    if (event.type === 'start') {
      accumulated.set(connectorId, '');
      onUpdate(connectorId, { status: 'generating', content: '' });
    } else if (event.type === 'chunk') {
      const prev = accumulated.get(connectorId) ?? '';
      const next = prev + event.delta;
      accumulated.set(connectorId, next);
      onUpdate(connectorId, { status: 'generating', content: next });
    } else if (event.type === 'done') {
      const fullText = event.fullText || accumulated.get(connectorId) || '';
      onUpdate(connectorId, {
        status: 'completed',
        content: fullText,
        completedAt: Date.now(),
      });
    } else if (event.type === 'error') {
      onUpdate(connectorId, {
        status: 'failed',
        error: event.error,
      });
    }
  });

  // Send to all connectors in parallel
  extensionBridge.sendPrompt(platforms, generateOptions.prompt, conversationId, turnId);

  // Wait for all platforms to complete (done or error)
  await new Promise<void>((resolve) => {
    const pending = new Set(platforms);

    const doneCleanup = extensionBridge.onResponse((platform, event) => {
      if (!pending.has(platform)) return;
      if (event.type === 'done' || event.type === 'error') {
        pending.delete(platform);
        if (pending.size === 0) {
          doneCleanup();
          resolve();
        }
      }
    });

    // Safety timeout: resolve after 3 minutes regardless
    setTimeout(() => {
      doneCleanup();
      resolve();
    }, 180_000);
  });

  cleanup();
}

// ─── Demo Mode (Mock) ─────────────────────────────────────────────────────────

async function orchestrateViaMock(options: OrchestratorOptions): Promise<void> {
  const { connectorIds, generateOptions, onUpdate } = options;

  connectorIds.forEach((id) => {
    onUpdate(id, { status: 'waiting', content: '' });
  });

  await Promise.allSettled(
    connectorIds.map(async (connectorId) => {
      try {
        onUpdate(connectorId, { status: 'generating', content: '' });

        let accumulated = '';
        const result = await mockProvider.generate(
          connectorId,
          generateOptions,
          (chunk) => {
            if (!chunk.done) {
              accumulated += chunk.delta;
              onUpdate(connectorId, { status: 'generating', content: accumulated });
            }
          }
        );

        onUpdate(connectorId, {
          status: 'completed',
          content: result.content,
          latencyMs: result.latencyMs,
          tokenCount: result.tokenCount,
          completedAt: Date.now(),
        });
      } catch (error) {
        onUpdate(connectorId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function orchestrate(options: OrchestratorOptions): Promise<void> {
  // Check if the OmniArena browser extension is active
  const isExtensionAvailable = await extensionBridge.isInstalled();

  if (isExtensionAvailable) {
    await orchestrateViaExtension(options);
  } else {
    // Explicit notice: No fake/mock responses. Require extension connection.
    for (const connectorId of options.connectorIds) {
      options.onUpdate(connectorId, {
        status: 'failed',
        error: 'OmniArena Extension not loaded. Please open chrome://extensions, enable "Developer mode", click "Load unpacked", and select F:\\WASHIM-PROJECT\\OmniArena\\extension\\dist to connect to your real ChatGPT tab.',
      });
    }
  }
}

