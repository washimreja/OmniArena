// ─── OmniArena Orchestrator ───────────────────────────────────────────────────
//
// Routes prompts to AI Connectors through the browser extension:
//
// orchestrate() → extensionBridge.sendPrompt(connectorIds) → real AI website
// tabs via the user's own logged-in sessions.
//
// Without the extension, orchestrate() returns an HONEST failure per connector
// — it never fabricates responses. (The hub's demo statuses are independent
// UI defaults, clearly labelled by the Demo Mode banner.)

import type { OrchestratorOptions, PlatformId } from '@/types/ai';
import type { ConnectorId } from '@/types/connectors';
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
      const fullText = event.fullText ?? accumulated.get(connectorId) ?? '';
      onUpdate(connectorId, {
        status: 'completed',
        content: fullText,
        completedAt: Date.now(),
      });
    } else if (event.type === 'error') {
      onUpdate(connectorId, {
        status: 'failed',
        error: event.errorCode === 'AUTH_REQUIRED'
          ? `${connectorId}: login required — open the platform tab, sign in, then retry.`
          : event.error,
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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function orchestrate(options: OrchestratorOptions): Promise<void> {
  // Check if the OmniArena browser extension is active
  const isExtensionAvailable = await extensionBridge.isInstalled();

  if (isExtensionAvailable) {
    await orchestrateViaExtension(options);
  } else {
    // Explicit notice: no fake/mock responses — real execution requires the
    // OmniArena browser extension (see README → Extension for setup).
    for (const connectorId of options.connectorIds) {
      options.onUpdate(connectorId, {
        status: 'failed',
        error: 'OmniArena Extension not connected. Install it and load it via chrome://extensions → Developer mode → Load unpacked → OmniArena/extension/dist, then reload this page.',
      });
    }
  }
}
