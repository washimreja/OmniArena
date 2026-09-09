// ─── OmniArena Extension — Background Service Worker ─────────────────────────
//
// Responsibilities:
// 1. Answer OMNIARENA_PING (extension presence handshake)
// 2. Answer OMNIARENA_GET_STATUS → per-platform connection probe
// (tab exists? content script reachable? user logged in?)
// 3. Receive OMNIARENA_SEND_PROMPT from the web app bridge
// 4. For each platform: find/open tab, wait for load, send SEND_PROMPT
// to the platform content script (routed by connector ID)
// 5. Relay RESPONSE_* / STATUS_UPDATE messages back to the web app tab
//
// Message flow:
// bridge-content.ts → runtime.sendMessage → HERE
// HERE → tabs.sendMessage → content-.ts (content-runner)
// content-.ts → runtime.sendMessage → HERE
// HERE → tabs.sendMessage → bridge-content.ts → postMessage → web app
//
// Security: this worker never touches credentials, cookies, or email data.
// It only observes whether the user's own logged-in tabs can accept a prompt.

import type {
  WebToExtensionPayload,
  ExtensionToWebPayload,
  ContentToBackgroundMessage,
  PlatformId,
  PlatformConnectionStatus,
  BridgeErrorCode,
} from './shared/messages';
import { ADAPTER_PLATFORMS, isAllowedWebOrigin } from '../../shared/bridge-protocol';

const EXT_VERSION = '1.1.0';

const PLATFORM_URLS: Record<PlatformId, string> = {
  chatgpt: 'https://chatgpt.com/',
  claude: 'https://claude.ai/',
  gemini: 'https://gemini.google.com/',
  grok: 'https://grok.com/',
  qwen: 'https://chat.qwen.ai/',
  copilot: 'https://copilot.microsoft.com/',
  meta: 'https://www.meta.ai/',
  kimi: 'https://kimi.moonshot.cn/',
  manus: 'https://manus.im/',
  vibe: 'https://vibe.dev/',
  deepseek: 'https://chat.deepseek.com/',
  mistral: 'https://chat.mistral.ai/',
};

/** tabId of the OmniArena web app tab (set when ping/send received) */
let webAppTabId: number | null = null;

/** Cache of platform → tabId so we reuse existing tabs */
const platformTabIds = new Map<PlatformId, number>();

// ─── Web app tab resolution ───────────────────────────────────────────────────

function matchesWebAppOrigin(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return isAllowedWebOrigin(new URL(url).origin);
  } catch {
    return false;
  }
}

async function findWebAppTab(): Promise<number | null> {
  const tabs = await chrome.tabs.query({});
  const webTab = tabs.find((t) => matchesWebAppOrigin(t.url));
  return webTab?.id ?? null;
}

/** Forward a message to the web app bridge-content.ts */
async function notifyWebApp(payload: ExtensionToWebPayload): Promise<void> {
  if (!webAppTabId) {
    webAppTabId = await findWebAppTab();
  }
  if (!webAppTabId) return;

  try {
    await chrome.tabs.sendMessage(webAppTabId, payload);
  } catch {
    // Re-resolve the web tab once (tab may have navigated or closed)
    try {
      const fresh = await findWebAppTab();
      if (fresh && fresh !== webAppTabId) {
        webAppTabId = fresh;
        await chrome.tabs.sendMessage(webAppTabId, payload);
      }
    } catch {
      // Web app not open right now; drop the message.
    }
  }
}

// ─── Platform tab management ──────────────────────────────────────────────────

async function findOrOpenTab(platformId: string): Promise<number> {
  const baseUrl = PLATFORM_URLS[platformId as PlatformId];
  if (!baseUrl) throw new Error(`Unknown platform: ${platformId}`);

  // Try cached tabId first
  const cached = platformTabIds.get(platformId as PlatformId);
  if (cached !== undefined) {
    try {
      const tab = await chrome.tabs.get(cached);
      if (tab.url && tab.url.includes(new URL(baseUrl).hostname)) return cached;
    } catch {
      platformTabIds.delete(platformId as PlatformId);
    }
  }

  // Search all open tabs for matching hostname
  const targetHost = new URL(baseUrl).hostname;
  const allTabs = await chrome.tabs.query({});
  const existing = allTabs.find((t) => t.url && t.url.includes(targetHost));

  if (existing && existing.id !== undefined) {
    platformTabIds.set(platformId as PlatformId, existing.id);
    return existing.id;
  }

  // Open new background tab if none found
  const newTab = await chrome.tabs.create({ url: baseUrl, active: false });
  if (!newTab.id) throw new Error(`Failed to create tab for ${platformId}`);
  platformTabIds.set(platformId as PlatformId, newTab.id);
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

// ─── Connection status probing ────────────────────────────────────────────────

async function probePlatformStatus(
  platformId: PlatformId,
  timeoutMs = 8_000
): Promise<PlatformConnectionStatus> {
  // No adapter implemented yet → report unsupported (UI shows "Coming Soon").
  if (!ADAPTER_PLATFORMS.includes(platformId)) return 'unsupported';
  if (!PLATFORM_URLS[platformId]) return 'unsupported';

  // Locate a tab without opening new ones — status probes must not spam tabs.
  const baseUrl = PLATFORM_URLS[platformId];
  const targetHost = new URL(baseUrl).hostname;
  const allTabs = await chrome.tabs.query({});
  const tab = allTabs.find((t) => t.url && t.url.includes(targetHost));
  if (!tab?.id) return 'no_tab';

  platformTabIds.set(platformId, tab.id);
  await ensureContentScriptInjected(tab.id, platformId);

  // Ask the content runner to detect the account state.
  const status = await new Promise<PlatformConnectionStatus>((resolve) => {
    const timer = setTimeout(() => resolve('unknown'), timeoutMs);
    try {
      chrome.tabs.sendMessage(tab.id!, { type: 'CHECK_STATUS' }, (response) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) {
          resolve('unknown');
          return;
        }
        const report = response as { type?: string; status?: PlatformConnectionStatus };
        resolve(report?.type === 'STATUS_REPORT' && report.status ? report.status : 'unknown');
      });
    } catch {
      clearTimeout(timer);
      resolve('unknown');
    }
  });

  return status;
}

async function handleGetStatus(platforms?: PlatformId[]): Promise<ExtensionToWebPayload> {
  const requested = platforms?.length ? platforms : ADAPTER_PLATFORMS;
  const statuses = await Promise.all(
    requested.map(async (platformId) => [platformId, await probePlatformStatus(platformId)] as const)
  );
  return {
    type: 'OMNIARENA_STATUS_REPORT',
    statuses: Object.fromEntries(statuses),
  };
}

// ─── Prompt dispatch ──────────────────────────────────────────────────────────

function errorCodeFor(err: unknown): BridgeErrorCode {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
  if (message.includes('load timeout')) return 'TIMEOUT';
  if (message.includes('unknown platform')) return 'ADAPTER_MISSING';
  if (message.includes('failed to create tab')) return 'TAB_ERROR';
  return 'UNKNOWN';
}

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
      errorCode: errorCodeFor(err),
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
      sendResponse({ type: 'OMNIARENA_PONG', version: EXT_VERSION, protocolVersion: 2 });
      return false;
    }

    if (message.type === 'OMNIARENA_GET_STATUS') {
      if (sender.tab?.id) webAppTabId = sender.tab.id;
      void handleGetStatus(message.platforms).then((report) => {
        void notifyWebApp(report);
      });
      sendResponse({ ok: true });
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

    if (relay.type === 'STATUS_REPORT') {
      void notifyWebApp({
        type: 'OMNIARENA_STATUS_UPDATE',
        platform: relay.platform,
        status: relay.status,
      });
    } else if (relay.type === 'RESPONSE_START') {
      void notifyWebApp({ type: 'OMNIARENA_RESPONSE_START', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId });
    } else if (relay.type === 'RESPONSE_CHUNK') {
      void notifyWebApp({ type: 'OMNIARENA_RESPONSE_CHUNK', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId, delta: relay.delta });
    } else if (relay.type === 'RESPONSE_DONE') {
      void notifyWebApp({ type: 'OMNIARENA_RESPONSE_DONE', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId, fullText: relay.fullText });
    } else if (relay.type === 'RESPONSE_ERROR') {
      void notifyWebApp({ type: 'OMNIARENA_RESPONSE_ERROR', platform: relay.platform, conversationId: relay.conversationId, turnId: relay.turnId, error: relay.error, errorCode: relay.errorCode });
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
