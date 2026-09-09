// ─── ChatGPT Content Script Entry Point ───────────────────────────────────────
//
// Injected into chatgpt.com by the extension.
// Listens for SEND_PROMPT from background.ts, runs the adapter, streams results.

import { ChatGPTAdapter } from './adapter';
import type { BackgroundToContentMessage, ContentToBackgroundMessage } from '../../shared/messages';

const adapter = new ChatGPTAdapter();

/** Send a message back to background.ts */
function respond(msg: ContentToBackgroundMessage): void {
  chrome.runtime.sendMessage(msg).catch(() => {
    // Background may not be listening yet; safe to ignore
  });
}

chrome.runtime.onMessage.addListener(
  (message: BackgroundToContentMessage, _sender, sendResponse) => {
    if (message.type !== 'SEND_PROMPT') return false;

    const { prompt, conversationId, turnId } = message;

    (async () => {
      try {
        // 1. Check readiness
        const ready = await adapter.isReady();
        if (!ready) {
          respond({
            type: 'RESPONSE_ERROR',
            platform: 'chatgpt',
            conversationId,
            turnId,
            error: 'ChatGPT page is not ready or not logged in. Please open chatgpt.com and log in.',
          });
          return;
        }

        // 2. Inject prompt + trigger send
        await adapter.sendPrompt(prompt);

        // 3. Announce stream start
        respond({ type: 'RESPONSE_START', platform: 'chatgpt', conversationId, turnId });

        // 4. Stream response back chunk by chunk
        adapter.observeResponse(
          (delta) => {
            respond({ type: 'RESPONSE_CHUNK', platform: 'chatgpt', conversationId, turnId, delta });
          },
          (fullText) => {
            respond({ type: 'RESPONSE_DONE', platform: 'chatgpt', conversationId, turnId, fullText });
          },
          (error) => {
            respond({ type: 'RESPONSE_ERROR', platform: 'chatgpt', conversationId, turnId, error });
          }
        );
      } catch (err) {
        respond({
          type: 'RESPONSE_ERROR',
          platform: 'chatgpt',
          conversationId,
          turnId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    sendResponse({ received: true });
    return true; // keep message channel open
  }
);
