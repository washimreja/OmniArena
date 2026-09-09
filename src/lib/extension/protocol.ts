// ─── OmniArena Web ↔ Extension Protocol (web-side re-export) ─────────────────
//
// Re-exports the canonical contract from shared/bridge-protocol.ts and adds
// the small runtime guards the web bridge needs. The extension imports the
// same canonical file, so both sides share one source of truth.

export type {
  PlatformId,
  PlatformConnectionStatus,
  BridgeErrorCode,
  BridgeEnvelope,
  WebToExtensionPayload,
  ExtensionToWebPayload,
  BackgroundToContentMessage,
  ContentToBackgroundMessage,
} from '../../../shared/bridge-protocol';

export {
  PROTOCOL_VERSION,
  WEB_APP_ORIGINS,
  isAllowedWebOrigin,
  ADAPTER_PLATFORMS,
} from '../../../shared/bridge-protocol';

export const WEB_SOURCE = 'OMNIARENA_WEB' as const;
export const EXT_SOURCE = 'OMNIARENA_EXT' as const;

import type { ExtensionToWebPayload } from '../../../shared/bridge-protocol';

const EXT_PAYLOAD_TYPES = new Set([
  'OMNIARENA_EXTENSION_READY',
  'OMNIARENA_PONG',
  'OMNIARENA_STATUS_REPORT',
  'OMNIARENA_STATUS_UPDATE',
  'OMNIARENA_RESPONSE_START',
  'OMNIARENA_RESPONSE_CHUNK',
  'OMNIARENA_RESPONSE_DONE',
  'OMNIARENA_RESPONSE_ERROR',
]);

/** Narrow an unknown window message into a validated bridge envelope. */
export function isBridgeEnvelope(data: unknown): data is { source: typeof EXT_SOURCE; protocolVersion: number; payload: unknown } {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as { source?: unknown; protocolVersion?: unknown };
  return candidate.source === EXT_SOURCE;
}

/** Runtime guard for ExtensionToWebPayload (protocol is postMessage-borne). */
export function isExtensionToWebPayload(payload: unknown): payload is ExtensionToWebPayload {
  if (!payload || typeof payload !== 'object') return false;
  return EXT_PAYLOAD_TYPES.has((payload as { type?: unknown }).type as string);
}
