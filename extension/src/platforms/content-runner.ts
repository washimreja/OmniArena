// ─── OmniArena Platform Content Runner ────────────────────────────────────────
//
// Shared entry point for every platform content script. Wraps an
// AIPlatformAdapter with the standard background message protocol:
//
// SEND_PROMPT → isReady → sendPrompt → RESPONSE_START → stream → DONE/ERROR
// CHECK_STATUS → detectConnection()/isReady → STATUS_REPORT
//
// Benefits:
// • One audited implementation of the response pipeline (no per-platform drift)
// • Adding a platform = selectors + adapter + a 3-line content.ts
// • Structured AUTH_REQUIRED error codes for the web UI

import type {
  AIPlatformAdapter,
} from './adapter';
import type {
  BackgroundToContentMessage,
  ContentToBackgroundMessage,
  PlatformConnectionStatus,
  BridgeErrorCode,
} from '../shared/messages';

/** Send a message back to background.ts (fire-and-forget, errors ignored). */
function respond(msg: ContentToBackgroundMessage): void {
  void chrome.runtime.sendMessage(msg).catch(() => {
    // Background may be asleep or the channel closing; safe to ignore.
  });
}

/** Default connection detection: composer reachable ⇒ logged in. */
async function defaultDetectConnection(adapter: AIPlatformAdapter): Promise<PlatformConnectionStatus> {
  try {
    const ready = await adapter.isReady();
    return ready ? 'logged_in' : 'login_required';
  } catch {
    return 'unknown';
  }
}

/**
 * Heuristic: does this failure mean the user needs to sign in?
 * Used to tag RESPONSE_ERROR with a structured AUTH_REQUIRED code so the
 * web app can show "Login Required" instead of a generic failure.
 */
export function classifyError(message: string): BridgeErrorCode {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('log in') ||
    normalized.includes('logged in') ||
    normalized.includes('login') ||
    normalized.includes('sign in') ||
    normalized.includes('sign-in') ||
    normalized.includes('not ready')
  ) {
    return 'AUTH_REQUIRED';
  }
  return 'UNKNOWN';
}

export function createContentRunner(adapter: AIPlatformAdapter): void {
  chrome.runtime.onMessage.addListener(
    (message: BackgroundToContentMessage, _sender, sendResponse) => {
      if (message.type === 'CHECK_STATUS') {
        void (async () => {
          const status = adapter.detectConnection
            ? await adapter.detectConnection()
            : await defaultDetectConnection(adapter);
          respond({ type: 'STATUS_REPORT', platform: adapter.platformId, status });
        })();
        sendResponse({ received: true });
        return true;
      }

      if (message.type !== 'SEND_PROMPT') return false;

      const { prompt, conversationId, turnId } = message;

      void (async () => {
        try {
          // 1. Readiness / login gate
          const ready = await adapter.isReady();
          if (!ready) {
            respond({
              type: 'RESPONSE_ERROR',
              platform: adapter.platformId,
              conversationId,
              turnId,
              error: `${adapter.platformId}: page is not ready or not logged in. Open the platform tab and sign in, then retry.`,
              errorCode: 'AUTH_REQUIRED',
            });
            return;
          }

          // 2. Inject prompt + trigger send
          await adapter.sendPrompt(prompt);

          // 3. Announce stream start
          respond({ type: 'RESPONSE_START', platform: adapter.platformId, conversationId, turnId });

          // 4. Stream the response back chunk by chunk
          adapter.observeResponse(
            (delta) => respond({ type: 'RESPONSE_CHUNK', platform: adapter.platformId, conversationId, turnId, delta }),
            (fullText) => respond({ type: 'RESPONSE_DONE', platform: adapter.platformId, conversationId, turnId, fullText }),
            (rawError) => respond({
              type: 'RESPONSE_ERROR',
              platform: adapter.platformId,
              conversationId,
              turnId,
              error: rawError,
              errorCode: classifyError(rawError),
            })
          );
        } catch (err) {
          const messageText = err instanceof Error ? err.message : String(err);
          respond({
            type: 'RESPONSE_ERROR',
            platform: adapter.platformId,
            conversationId,
            turnId,
            error: messageText,
            errorCode: classifyError(messageText),
          });
        }
      })();

      sendResponse({ received: true });
      return true; // keep the message channel open for the async work
    }
  );
}
