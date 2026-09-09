// ─── OmniArena Extension Bridge (Web App side) ────────────────────────────────
//
// The web app uses window.postMessage to communicate with the extension
// bridge-content.ts, which relays messages to/from the background service worker.
//
// Usage:
//   import { extensionBridge } from '@/lib/extension/bridge';
//   const installed = await extensionBridge.isInstalled();
//   const cleanup = extensionBridge.onResponse((platform, event) => { ... });
//   extensionBridge.sendPrompt(['chatgpt', 'gemini'], prompt, convId, turnId);

import type { PlatformId } from '@/types/ai';

const WEB_SOURCE = 'OMNIARENA_WEB';
const EXT_SOURCE = 'OMNIARENA_EXT';

export type PlatformResponseEvent =
  | { type: 'start' }
  | { type: 'chunk'; delta: string }
  | { type: 'done'; fullText: string }
  | { type: 'error'; error: string };

export type ResponseCallback = (
  platform: PlatformId,
  event: PlatformResponseEvent
) => void;

class ExtensionBridge {
  /** null = not yet checked, true/false = result of ping */
  private _installed: boolean | null = null;
  private _listeners = new Set<ResponseCallback>();

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('message', this._handleMessage.bind(this));
  }

  private _handleMessage(event: MessageEvent): void {
    if (event.source !== window) return;
    if (event.data?.source !== EXT_SOURCE) return;

    const payload = event.data.payload as Record<string, unknown>;
    if (!payload?.type) return;

    const { type } = payload;

    // Ready signals
    if (type === 'OMNIARENA_EXTENSION_READY' || type === 'OMNIARENA_PONG') {
      this._installed = true;
      return;
    }

    // Response events — forward to listeners
    const platform = payload.platform as PlatformId;
    if (!platform) return;

    let evt: PlatformResponseEvent | null = null;

    if (type === 'OMNIARENA_RESPONSE_START') {
      evt = { type: 'start' };
    } else if (type === 'OMNIARENA_RESPONSE_CHUNK') {
      evt = { type: 'chunk', delta: payload.delta as string };
    } else if (type === 'OMNIARENA_RESPONSE_DONE') {
      evt = { type: 'done', fullText: payload.fullText as string };
    } else if (type === 'OMNIARENA_RESPONSE_ERROR') {
      evt = { type: 'error', error: payload.error as string };
    }

    if (evt) {
      for (const cb of this._listeners) cb(platform, evt);
    }
  }

  private _post(payload: unknown): void {
    window.postMessage({ source: WEB_SOURCE, payload }, '*');
  }

  /**
   * Check whether the OmniArena extension is installed and the bridge is ready.
   * Resolves false after 600ms if no response (extension not installed).
   */
  async isInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this._installed !== null) return this._installed;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this._installed = false;
        resolve(false);
      }, 600);

      const handler = (event: MessageEvent) => {
        if (event.data?.source !== EXT_SOURCE) return;
        const t = event.data?.payload?.type;
        if (t === 'OMNIARENA_EXTENSION_READY' || t === 'OMNIARENA_PONG') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          this._installed = true;
          resolve(true);
        }
      };

      window.addEventListener('message', handler);
      this._post({ type: 'OMNIARENA_PING' });
    });
  }

  /** Invalidate cached install state (call after user installs/uninstalls) */
  resetInstallCheck(): void {
    this._installed = null;
  }

  /**
   * Send a prompt to the given platforms via the extension.
   * conversationId + turnId are used by the extension to route responses back.
   */
  sendPrompt(
    platforms: PlatformId[],
    prompt: string,
    conversationId: string,
    turnId: string
  ): void {
    this._post({
      type: 'OMNIARENA_SEND_PROMPT',
      platforms,
      prompt,
      conversationId,
      turnId,
    });
  }

  /**
   * Register a callback to receive streaming response events from any platform.
   * Returns a cleanup function to unregister.
   */
  onResponse(callback: ResponseCallback): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }
}

// Singleton instance shared across the app
export const extensionBridge = new ExtensionBridge();
