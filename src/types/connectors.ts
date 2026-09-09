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
  id: ConnectorId;
  name: string;
  providerName: string;
  category: string;
  description: string;
  websiteUrl: string;
  brandColor: string;
  tier: ConnectorTier;
  wave: ConnectorWave;
  supported: boolean;
  isComingSoon?: boolean;
}

export interface ConnectorState {
  id: ConnectorId;
  status: ConnectorStatus;
  isActiveInArena: boolean;
  lastConnectedAt?: number;
}
