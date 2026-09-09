// ─── OmniArena Bridge Content Script ─────────────────────────────────────────
//
// Injected into http://localhost:3000/* by the extension.
// Acts as a two-way bridge between the OmniArena Next.js app and the extension
// background service worker.
//
// Web App → Extension:
//   window.postMessage({ source: 'OMNIARENA_WEB', payload: {...} })
//   → chrome.runtime.sendMessage(payload)
//   → background.ts
//
// Extension → Web App:
//   background.ts → chrome.tabs.sendMessage(webAppTabId, payload)
//   → chrome.runtime.onMessage (here)
//   → window.postMessage({ source: 'OMNIARENA_EXT', payload: {...} })

const WEB_SOURCE = 'OMNIARENA_WEB';
const EXT_SOURCE = 'OMNIARENA_EXT';

// ─── Web App → Extension ──────────────────────────────────────────────────────

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== WEB_SOURCE) return;

  const payload = event.data.payload;

  chrome.runtime.sendMessage(payload)
    .then((response) => {
      if (response !== undefined) {
        window.postMessage({ source: EXT_SOURCE, payload: response }, '*');
      }
    })
    .catch((err) => {
      // Extension might not be ready yet; surface the error to the web app
      window.postMessage({
        source: EXT_SOURCE,
        payload: {
          type: 'OMNIARENA_ERROR',
          error: err?.message ?? 'Extension communication failed',
        },
      }, '*');
    });
});

// ─── Extension → Web App ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  window.postMessage({ source: EXT_SOURCE, payload: message }, '*');
  sendResponse({ received: true });
  return true;
});

// ─── Announce readiness ───────────────────────────────────────────────────────

function broadcastReady() {
  window.postMessage({
    source: EXT_SOURCE,
    payload: { type: 'OMNIARENA_EXTENSION_READY', version: '1.0.0' },
  }, '*');
}

broadcastReady();
// Repeat shortly after load to ensure SPA hydration caught it
setTimeout(broadcastReady, 300);
setTimeout(broadcastReady, 1000);

