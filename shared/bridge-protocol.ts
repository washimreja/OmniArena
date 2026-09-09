// ─── OmniArena Bridge Protocol (Single Source of Truth) ──────────────────────
//
// This file is THE contract between:
// • OmniArena Web App (src/lib/extension/bridge.ts)
// • Browser Extension (extension/src/**)
//
// Both sides import from here so the protocol can never drift.
// The extension bundles it with esbuild; the web app typechecks it via the
// root tsconfig. Bump PROTOCOL_VERSION on breaking message changes.
//
// Security invariants (must hold for every message):
// • No passwords, no cookies, no email contents ever travel through here.
// • The extension only uses the user's already-authenticated browser
// session on the platform's own tab.
// • Web origins are allowlisted; unknown origins are ignored.

// ─── Version & Origins ───────────────────────────────────────────────────────

/** Breaking-change counter. Web rejects envelopes with a different major. */
export const PROTOCOL_VERSION = 2;

/** Origins where the OmniArena web app is allowed to run. */
export const WEB_APP_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://omniarena.vercel.app',
] as const;

export function isAllowedWebOrigin(origin: string): boolean {
  return (WEB_APP_ORIGINS as readonly string[]).includes(origin);
}

// ─── Platform / Connector identity ───────────────────────────────────────────

/** Platforms the extension knows how to route to. */
export type PlatformId =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'grok'
  | 'vibe'
  | 'qwen'
  | 'meta'
  | 'kimi'
  | 'copilot'
  | 'manus'
  | 'deepseek'
  | 'perplexity'
  | 'mistral';

/**
 * Live connection state of one platform account, detected by the
 * extension from the user's own logged-in browser session.
 *
 * logged_in → input/composer reachable; account session is active
 * login_required → platform tab exists but the session is not authenticated
 * no_tab → no open tab for this platform (user hasn't visited it)
 * unsupported → no adapter/content script implemented for this platform yet
 * unknown → detection failed; retry later
 */
export type PlatformConnectionStatus =
  | 'logged_in'
  | 'login_required'
  | 'no_tab'
  | 'unsupported'
  | 'unknown';

/** Structured error codes carried alongside human-readable messages. */
export type BridgeErrorCode =
  | 'AUTH_REQUIRED'
  | 'ADAPTER_MISSING'
  | 'TAB_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

// ─── Envelope ────────────────────────────────────────────────────────────────

/** Every postMessage between web ⇄ extension content bridge uses this shape. */
export interface BridgeEnvelope<TPayload = unknown> {
  source: 'OMNIARENA_WEB' | 'OMNIARENA_EXT';
  protocolVersion: number;
  payload: TPayload;
}

// ─── Web App → Extension ─────────────────────────────────────────────────────

export type WebToExtensionPayload =
  | { type: 'OMNIARENA_PING' }
  | { type: 'OMNIARENA_GET_STATUS'; platforms?: PlatformId[] }
  | {
      type: 'OMNIARENA_SEND_PROMPT';
      platforms: PlatformId[];
      prompt: string;
      conversationId: string;
      turnId: string;
    };

// ─── Extension → Web App ─────────────────────────────────────────────────────

export type ExtensionToWebPayload =
  | { type: 'OMNIARENA_EXTENSION_READY'; version: string }
  | { type: 'OMNIARENA_PONG'; version: string; protocolVersion: number }
  | {
      type: 'OMNIARENA_STATUS_REPORT';
      requestId?: string;
      statuses: Partial<Record<PlatformId, PlatformConnectionStatus>>;
    }
  | {
      type: 'OMNIARENA_STATUS_UPDATE';
      platform: PlatformId;
      status: PlatformConnectionStatus;
    }
  | {
      type: 'OMNIARENA_RESPONSE_START';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
    }
  | {
      type: 'OMNIARENA_RESPONSE_CHUNK';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
      delta: string;
    }
  | {
      type: 'OMNIARENA_RESPONSE_DONE';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
      fullText: string;
    }
  | {
      type: 'OMNIARENA_RESPONSE_ERROR';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
      error: string;
      errorCode?: BridgeErrorCode;
    };

// ─── Extension Background → Platform Content Script ──────────────────────────

export type BackgroundToContentMessage =
  | { type: 'SEND_PROMPT'; prompt: string; conversationId: string; turnId: string }
  | { type: 'CHECK_STATUS' };

// ─── Platform Content Script → Extension Background ──────────────────────────

export type ContentToBackgroundMessage =
  | {
      type: 'STATUS_REPORT';
      platform: PlatformId;
      status: PlatformConnectionStatus;
    }
  | { type: 'RESPONSE_START'; platform: PlatformId; conversationId: string; turnId: string }
  | { type: 'RESPONSE_CHUNK'; platform: PlatformId; conversationId: string; turnId: string; delta: string }
  | { type: 'RESPONSE_DONE'; platform: PlatformId; conversationId: string; turnId: string; fullText: string }
  | {
      type: 'RESPONSE_ERROR';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
      error: string;
      errorCode?: BridgeErrorCode;
    };

/** Platforms that currently have an adapter/content script implemented. */
export const ADAPTER_PLATFORMS: PlatformId[] = [
  'chatgpt',
  'claude',
  'gemini',
  'grok',
  'deepseek',
];
