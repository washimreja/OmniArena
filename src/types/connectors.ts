// ─── OmniArena Connector Types ───────────────────────────────────────────────
//
// OmniArena Connectors Hub: Connect your own logged-in AI accounts.
// "One Dashboard. Multiple AI Accounts. Your Own Connections."

export type ConnectorId =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'grok'
  | 'deepseek'
  | 'mistral'
  | 'qwen'
  | 'copilot'
  | 'meta'
  | 'kimi'
  | 'manus'
  | 'vibe';

export type ConnectorTier = 'primary' | 'secondary' | 'extended';

export type ConnectorWave = 1 | 2 | 3;

export type ConnectorStatus = 'connected' | 'not_connected' | 'connecting' | 'coming_soon';

export interface OmniConnector {
  /** Unique platform identifier */
  id: ConnectorId;
  /** Display name (e.g. "ChatGPT", "Claude", "Gemini", "Grok") */
  name: string;
  /** Brand / Company (e.g. "OpenAI", "Anthropic", "Google", "xAI") */
  providerName: string;
  /** Category description (e.g. "Frontier Reasoning", "Autonomous Agent") */
  category: string;
  /** Short description of capabilities */
  description: string;
  /** Direct URL to open account / chat page */
  websiteUrl: string;
  /** Brand color (hex) */
  brandColor: string;
  /** Tier: primary (core), secondary (popular), extended (roadmap) */
  tier: ConnectorTier;
  /** Implementation wave */
  wave: ConnectorWave;
  /** Whether the adapter/extension currently supports this connector */
  supported: boolean;
  /** If not yet supported or in future wave */
  isComingSoon?: boolean;
}

export interface ConnectorState {
  id: ConnectorId;
  status: ConnectorStatus;
  isActiveInArena: boolean;
  lastConnectedAt?: number;
}
