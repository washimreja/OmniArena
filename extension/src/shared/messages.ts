// ─── OmniArena Extension — Shared Message Types ───────────────────────────────
//
// Communication flows:
//
//   Web App  ──postMessage──▶  bridge-content.ts  ──sendMessage──▶  background.ts
//   Web App  ◀──postMessage──  bridge-content.ts  ◀──sendMessage──  background.ts
//   background.ts  ──sendMessage──▶  content-<platform>.ts
//   content-<platform>.ts  ──sendMessage──▶  background.ts

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

// ─── Web App → Extension (via postMessage wrapping) ───────────────────────────

export type WebToExtensionPayload =
  | { type: 'OMNIARENA_PING' }
  | {
      type: 'OMNIARENA_SEND_PROMPT';
      platforms: PlatformId[];
      prompt: string;
      conversationId: string;
      turnId: string;
    };

// ─── Extension → Web App (via postMessage wrapping) ───────────────────────────

export type ExtensionToWebPayload =
  | { type: 'OMNIARENA_EXTENSION_READY' }
  | { type: 'OMNIARENA_PONG'; version: string }
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
    };

// ─── Background → Content Script ──────────────────────────────────────────────

export type BackgroundToContentMessage = {
  type: 'SEND_PROMPT';
  prompt: string;
  conversationId: string;
  turnId: string;
};

// ─── Content Script → Background ──────────────────────────────────────────────

export type ContentToBackgroundMessage =
  | {
      type: 'RESPONSE_START';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
    }
  | {
      type: 'RESPONSE_CHUNK';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
      delta: string;
    }
  | {
      type: 'RESPONSE_DONE';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
      fullText: string;
    }
  | {
      type: 'RESPONSE_ERROR';
      platform: PlatformId;
      conversationId: string;
      turnId: string;
      error: string;
    };
