// ─── OmniArena Extension — Background Service Worker ─────────────────────────
//
// Responsibilities:
//  1. Receive OMNIARENA_SEND_PROMPT from bridge-content.ts (web app → extension)
//  2. For each platform: find/open tab, wait for load, send SEND_PROMPT to content script
//  3. Relay RESPONSE_* messages from content scripts back to the web app tab
//
// Message flow:
//   bridge-content.ts → runtime.sendMessage → HERE
//   HERE → tabs.sendMessage → content-<platform>.ts
//   content-<platform>.ts → runtime.sendMessage → HERE
//   HERE → tabs.sendMessage → bridge-content.ts → postMessage → web app

import type {
  WebToExtensionPayload,
  ExtensionToWebPayload,
  ContentToBackgroundMessage,
  PlatformId,
} from './shared/messages';

const PLATFORM_URLS: Record<string, string> = {
  chatgpt: 'https://chatgpt.com/',
  claude:  'https://claude.ai/',
  gemini:  'https://gemini.google.com/',
  grok:    'https://grok.com/',
  qwen:    'https://chat.qwen.ai/',
  copilot: 'https://copilot.microsoft.com/',
  meta:    'https://www.meta.ai/',
  kimi:    'https://kimi.moonshot.cn/',
  manus:   'https://manus.im/',
  vibe:    'https://vibe.dev/',
  deepseek: 'https://chat.deepseek.com/',
  mistral: 'https://chat.mistral.ai/',
};

/** tabId of the OmniArena web app tab (set when ping received) */
let webAppTabId: number | null = null;

/** Cache of platform → tabId so we reuse existing tabs */
const platformTabIds = new Map<string, number>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findOrOpenTab(platformId: string): Promise<number> {
  const baseUrl = PLATFORM_URLS[platformId];
  if (!baseUrl) throw new Error(`Unknown platform: ${platformId}`);

  // Try cached tabId first
  const cached = platformTabIds.get(platformId);
  if (cached !== undefined) {
    try {
      const tab = await chrome.tabs.get(cached);
      if (tab.url && tab.url.includes(new URL(baseUrl).hostname)) return cached;
    } catch {
      platformTabIds.delete(platformId);
    }
  }

  // Search all open tabs for matching hostname
  const targetHost = new URL(baseUrl).hostname;
  const allTabs = await chrome.tabs.query({});
  const existing = allTabs.find((t) => t.url && t.url.includes(targetHost));

  if (existing && existing.id !== undefined) {
    platformTabIds.set(platformId, existing.id);
    return existing.id;
  }

  // Open new background tab if none found
  const newTab = await chrome.tabs.create({ url: baseUrl, active: false });
  if (!newTab.id) throw new Error(`Failed to create tab for ${platformId}`);
  platformTabIds.set(platformId, newTab.id);
  return newTab.id;
}

function waitForTabLoad(tabId: number, timeoutMs = 30_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error(`Tab ${tabId} load timeout`));
    }, timeoutMs);

    const listener = (
      updatedId: number,
      info: chrome.tabs.TabChangeInfo
    ) => {
      if (updatedId === tabId && info.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 1500);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    // Already complete?
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 1000);
      }
    }).catch(() => {});
  });
}

/** Forward a message to the web app bridge-content.ts */
async function notifyWebApp(payload: ExtensionToWebPayload): Promise<void> {
  // If webAppTabId is not set, find the active or open OmniArena tab
  if (!webAppTabId) {
    const candidateTabs = await chrome.tabs.query({});
    const webTab = candidateTabs.find((t) =>
      t.url && (t.url.includes('localhost:3000') || t.url.includes('localhost:3001'))
    );
    if (webTab?.id) {
      webAppTabId = webTab.id;
    }
  }

  if (!webAppTabId) return;

  try {
    await chrome.tabs.sendMessage(webAppTabId, payload);
  } catch {
    // If sendMessage failed, re-search web tab once
    try {
      const candidateTabs = await chrome.tabs.query({});
      const webTab = candidateTabs.find((t) =>
        t.url && (t.url.includes('localhost:3000') || t.url.includes('localhost:3001'))
      );
      if (webTab?.id && webTab.id !== webAppTabId) {
        webAppTabId = webTab.id;
        await chrome.tabs.sendMessage(webAppTabId, payload);
      }
    } catch {
      // Tab closed or navigated away
    }
  }
}

/** Ensure platform content script is injected into tab */
async function ensureContentScriptInjected(tabId: number, platformId: string): Promise<void> {
  const scriptFile = `content-${platformId}.js`;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [scriptFile],
    });
    // Brief settling delay after injection
    await new Promise((r) => setTimeout(r, 400));
  } catch {
    // Script might already be present from manifest content_scripts
  }
}

// ─── Platform dispatch ────────────────────────────────────────────────────────

async function dispatchToPlatform(
  platformId: string,
  prompt: string,
  conversationId: string,
  turnId: string
): Promise<void> {
  const platform = platformId as PlatformId;

  try {
    const tabId = await findOrOpenTab(platformId);
    await waitForTabLoad(tabId);

    // Ensure content script is injected even on pre-existing tabs
    await ensureContentScriptInjected(tabId, platformId);

    // Send prompt to platform content script
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'SEND_PROMPT', prompt, conversationId, turnId });
    } catch {
      // Re-inject and retry once
      await ensureContentScriptInjected(tabId, platformId);
      await chrome.tabs.sendMessage(tabId, { type: 'SEND_PROMPT', prompt, conversationId, turnId });
    }
  } catch (err) {
    await notifyWebApp({
      type: 'OMNIARENA_RESPONSE_ERROR',
      platform,
      conversationId,
      turnId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ─── Message Listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    message: WebToExtensionPayload | ContentToBackgroundMessage,
    sender,
    sendResponse
  ) => {
    // ── Messages from bridge-content.ts (web app) ──
    if (message.type === 'OMNIARENA_PING') {
      if (sender.tab?.id) webAppTabId = sender.tab.id;
      sendResponse({ type: 'OMNIARENA_PONG', version: '1.0.0' });
      return false;
    }

    if (message.type === 'OMNIARENA_SEND_PROMPT') {
      if (sender.tab?.id) webAppTabId = sender.tab.id;

      const { platforms, prompt, conversationId, turnId } = message;

      // Fan-out: each platform is independent and parallel
      for (const platformId of platforms) {
        dispatchToPlatform(platformId, prompt, conversationId, turnId);
      }

      sendResponse({ ok: true });
      return false;
    }

    // ── Messages from content scripts (AI platform pages) ──
    const relay = message as ContentToBackgroundMessage;

    if (relay.type === 'RESPONSE_START') {
      notifyWebApp({ type: 'OMNIARENA_RESPONSE_START', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId });
    } else if (relay.type === 'RESPONSE_CHUNK') {
      notifyWebApp({ type: 'OMNIARENA_RESPONSE_CHUNK', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId, delta: relay.delta });
    } else if (relay.type === 'RESPONSE_DONE') {
      notifyWebApp({ type: 'OMNIARENA_RESPONSE_DONE', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId, fullText: relay.fullText });
    } else if (relay.type === 'RESPONSE_ERROR') {
      notifyWebApp({ type: 'OMNIARENA_RESPONSE_ERROR', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId, error: relay.error });
    }

    return false;
  }
);

// Keep platform tab associations clean when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  for (const [platformId, id] of platformTabIds) {
    if (id === tabId) platformTabIds.delete(platformId);
  }
  if (webAppTabId === tabId) webAppTabId = null;
});
