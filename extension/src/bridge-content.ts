// ─── OmniArena Bridge Content Script ─────────────────────────────────────────
//
// Injected ONLY into allowlisted OmniArena web origins (see
// shared/bridge-protocol.ts → WEB_APP_ORIGINS, mirrored in manifest.json).
// Acts as a two-way bridge between the OmniArena Next.js app and the
// extension background service worker.
//
// Web App → Extension:
// window.postMessage({ source: 'OMNIARENA_WEB', payload: {...} })
// → chrome.runtime.sendMessage(payload)
// → background.ts
//
// Extension → Web App:
// background.ts → chrome.tabs.sendMessage(webAppTabId, payload)
// → chrome.runtime.onMessage (here)
// → window.postMessage({ source: 'OMNIARENA_EXT', payload: {...} })
//
// Security: every window message is validated for same-window source,
// allowlisted origin, envelope shape, and known payload type before relay.

const WEB_SOURCE = 'OMNIARENA_WEB';
const EXT_SOURCE = 'OMNIARENA_EXT';
const PROTOCOL_VERSION = 2;

/** Payload types the bridge is willing to relay — nothing else passes. */
const WEB_TO_EXTENSION_TYPES = new Set([
  'OMNIARENA_PING',
  'OMNIARENA_GET_STATUS',
  'OMNIARENA_SEND_PROMPT',
]);

// ─── Web App → Extension ──────────────────────────────────────────────────────

window.addEventListener('message', (event) => {
  // Only accept messages from this exact window.
  if (event.source !== window) return;
  // Defense in depth: the content script should only ever run on
  // allowlisted origins, but verify anyway.
  if (!isAllowedOrigin(event.origin)) return;
  if (!event.data || event.data.source !== WEB_SOURCE) return;

  const payload = event.data.payload;
  if (!payload || typeof payload.type !== 'string') return;
  if (!WEB_TO_EXTENSION_TYPES.has(payload.type)) return;

  chrome.runtime.sendMessage(payload)
  .then((response) => {
    if (response !== undefined) {
      window.postMessage(envelope(response), '*');
    }
  })
  .catch((err) => {
    // Extension might not be ready yet; surface the error to the web app
    window.postMessage(envelope({
      type: 'OMNIARENA_RESPONSE_ERROR',
      error: err?.message ?? 'Extension communication failed',
      errorCode: 'UNKNOWN',
    }), '*');
  });
});

// ─── Extension → Web App ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  window.postMessage(envelope(message), '*');
  sendResponse({ received: true });
  return true;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAllowedOrigin(origin: string): boolean {
  return (
    origin === 'http://localhost:3000' ||
    origin === 'http://localhost:3001' ||
    origin === 'https://omniarena.vercel.app'
  );
}

function envelope(payload: unknown): { source: string; protocolVersion: number; payload: unknown } {
  return { source: EXT_SOURCE, protocolVersion: PROTOCOL_VERSION, payload };
}

// ─── Announce readiness ───────────────────────────────────────────────────────

function broadcastReady() {
  window.postMessage(envelope({ type: 'OMNIARENA_EXTENSION_READY', version: '1.1.0' }), '*');
}

broadcastReady();
// Repeat shortly after load to ensure SPA hydration caught it
setTimeout(broadcastReady, 300);
setTimeout(broadcastReady, 1000);
