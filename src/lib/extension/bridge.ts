// ─── OmniArena Extension Bridge (Web App side) ────────────────────────────────
//
// The web app uses window.postMessage to communicate with the extension
// bridge-content.ts, which relays messages to/from the background service worker.
//
// Message contracts are imported from shared/bridge-protocol.ts — the single
// source of truth shared with the extension itself, so the two can never drift.
//
// Usage:
// import { extensionBridge } from '@/lib/extension/bridge';
// const installed = await extensionBridge.isInstalled();
// const cleanup = extensionBridge.onResponse((platform, event) => { ... });
// const statuses = await extensionBridge.getStatus(); // v2
// extensionBridge.sendPrompt(['chatgpt', 'gemini'], prompt, convId, turnId);

import type {
  PlatformId,
  PlatformConnectionStatus,
  ExtensionToWebPayload,
  WebToExtensionPayload,
} from '@/lib/extension/protocol';
import {
  PROTOCOL_VERSION,
  WEB_SOURCE,
  EXT_SOURCE,
  isBridgeEnvelope,
  isExtensionToWebPayload,
} from '@/lib/extension/protocol';

export type PlatformResponseEvent =
  | { type: 'start' }
  | { type: 'chunk'; delta: string }
  | { type: 'done'; fullText: string }
  | { type: 'error'; error: string; errorCode?: string };

export type ResponseCallback = (
  platform: PlatformId,
  event: PlatformResponseEvent
) => void;

export type StatusCallback = (
  platform: PlatformId,
  status: PlatformConnectionStatus
) => void;

type StatusResolver = {
  resolve: (statuses: Partial<Record<PlatformId, PlatformConnectionStatus>>) => void;
  timer: ReturnType<typeof setTimeout>;
};

class ExtensionBridge {
  /** null = not yet checked, true/false = result of ping */
  private _installed: boolean | null = null;
  private _listeners = new Set<ResponseCallback>();
  private _statusListeners = new Set<StatusCallback>();
  /** Pending OMNIARENA_GET_STATUS request → resolver */
  private _pendingStatusRequests = new Set<StatusResolver>();

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('message', this._handleMessage.bind(this));
  }

  private _handleMessage(event: MessageEvent): void {
    if (event.source !== window) return;
    if (!isBridgeEnvelope(event.data)) return;
    const data = event.data;
    // Accept v1 (no version field) for backward compatibility with older builds.
    if (typeof data.protocolVersion === 'number' && data.protocolVersion !== PROTOCOL_VERSION) return;

    const payload = data.payload as ExtensionToWebPayload;
    if (!isExtensionToWebPayload(payload)) return;

    const { type } = payload;

    // Ready signals
    if (type === 'OMNIARENA_EXTENSION_READY' || type === 'OMNIARENA_PONG') {
      this._installed = true;
      return;
    }

    // Status report → resolve pending getStatus() + notify listeners
    if (type === 'OMNIARENA_STATUS_REPORT') {
      for (const pending of this._pendingStatusRequests) {
        clearTimeout(pending.timer);
        pending.resolve(payload.statuses ?? {});
      }
      this._pendingStatusRequests.clear();
      for (const [platform, status] of Object.entries(payload.statuses ?? {})) {
        for (const cb of this._statusListeners) cb(platform as PlatformId, status);
      }
      return;
    }

    // Single status update push
    if (type === 'OMNIARENA_STATUS_UPDATE') {
      for (const cb of this._statusListeners) cb(payload.platform, payload.status);
      return;
    }

    // Response events — forward to listeners
    const platform = payload.platform as PlatformId;
    if (!platform) return;

    let evt: PlatformResponseEvent | null = null;

    if (type === 'OMNIARENA_RESPONSE_START') {
      evt = { type: 'start' };
    } else if (type === 'OMNIARENA_RESPONSE_CHUNK') {
      evt = { type: 'chunk', delta: payload.delta };
    } else if (type === 'OMNIARENA_RESPONSE_DONE') {
      evt = { type: 'done', fullText: payload.fullText };
    } else if (type === 'OMNIARENA_RESPONSE_ERROR') {
      evt = { type: 'error', error: payload.error, errorCode: payload.errorCode };
    }

    if (evt) {
      for (const cb of this._listeners) cb(platform, evt);
    }
  }

  private _post(payload: WebToExtensionPayload): void {
    window.postMessage({ source: WEB_SOURCE, protocolVersion: PROTOCOL_VERSION, payload }, '*');
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
   * Ask the extension to probe every (or the given) platform's account state
   * using the user's own logged-in browser tabs. Never touches credentials.
   * Resolves {} when the extension is absent or times out (1.5s + probe time).
   */
  async getStatus(platforms?: PlatformId[]): Promise<Partial<Record<PlatformId, PlatformConnectionStatus>>> {
    if (typeof window === 'undefined') return {};
    if (this._installed === false) return {};

    return new Promise((resolve) => {
      const resolver: StatusResolver = {
        resolve,
        timer: setTimeout(() => {
          this._pendingStatusRequests.delete(resolver);
          resolve({});
        }, 15_000),
      };
      this._pendingStatusRequests.add(resolver);
      this._post(platforms ? { type: 'OMNIARENA_GET_STATUS', platforms } : { type: 'OMNIARENA_GET_STATUS' });
    });
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

  /**
   * Register a callback for connection-status updates (STATUS_REPORT /
   * STATUS_UPDATE). Returns a cleanup function to unregister.
   */
  onStatus(callback: StatusCallback): () => void {
    this._statusListeners.add(callback);
    return () => this._statusListeners.delete(callback);
  }
}

// Singleton instance shared across the app
export const extensionBridge = new ExtensionBridge();
