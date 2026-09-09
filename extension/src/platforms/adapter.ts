// ─── Platform Adapter Interface ───────────────────────────────────────────────
//
// Every AI platform must implement this interface.
// Keeping logic separate from selectors means UI changes only require updating
// the selectors.ts file for that platform — the adapter logic stays the same.

import type { PlatformId, PlatformConnectionStatus } from '../shared/messages';

export interface AIPlatformAdapter {
  /** Identifier matching PlatformId */
  readonly platformId: PlatformId;

  /**
   * Reports whether the user's account session is usable on this tab.
   * Default implementation (see content-runner.ts) treats a reachable
   * composer input as logged in. Adapters may override with sharper
   * detection (e.g. avatar/sign-in button probes) — but must never read
   * credentials, cookies, or email content.
   */
  detectConnection?(): Promise<PlatformConnectionStatus>;

  /**
   * Returns true when the page is loaded, the input is available, and the user
   * appears to be logged in. Must resolve within a reasonable timeout.
   */
  isReady(): Promise<boolean>;

  /**
   * Injects the prompt text into the platform's input field and triggers send.
   * Throws if the input or send button cannot be found.
   */
  sendPrompt(prompt: string): Promise<void>;

  /**
   * Sets up a MutationObserver on the response area.
   * - onChunk: called with each incremental text delta as it streams in
   * - onComplete: called once with the full final text when generation stops
   * - onError: called if something goes wrong during observation
   *
   * Returns a cleanup function to stop observing.
   */
  observeResponse(
    onChunk: (delta: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void
  ): () => void;
}
