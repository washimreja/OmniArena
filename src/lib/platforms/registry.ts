// ─── AI Platform Registry ─────────────────────────────────────────────────────
//
// Metadata for each browser-based AI platform that OmniArena can integrate with.
// Adding a new platform requires:
// 1. Adding its entry here
// 2. Creating extension/src/platforms//{selectors,adapter,content}.ts

import type { PlatformId } from '@/types/ai';

export interface AIPlatform {
  id: PlatformId;
  name: string;
  url: string;
  /** Short tagline shown in UI */
  tagline: string;
  /** Brand hex color */
  color: string;
  /** Whether the extension content script is implemented */
  isSupported: boolean;
  /** Coming soon — UI shows badge but disables selection */
  isComingSoon?: boolean;
}

export const AI_PLATFORMS: AIPlatform[] = [
  {
    id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com',
    tagline: 'OpenAI', color: '#10A37F', isSupported: true,
  },
  {
    id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com',
    tagline: 'Google', color: '#4285F4', isSupported: true,
  },
  {
    id: 'claude', name: 'Claude', url: 'https://claude.ai',
    tagline: 'Anthropic', color: '#CC785C', isSupported: true,
  },
  {
    id: 'grok', name: 'Grok', url: 'https://grok.com',
    tagline: 'xAI', color: '#1DA1F2', isSupported: true,
  },
  {
    id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com',
    tagline: 'DeepSeek AI', color: '#5B8DEE', isSupported: true,
  },
  {
    id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai',
    tagline: 'Perplexity AI', color: '#20B8CD', isSupported: false, isComingSoon: true,
  },
  {
    id: 'copilot', name: 'Copilot', url: 'https://copilot.microsoft.com',
    tagline: 'Microsoft', color: '#0078D4', isSupported: false, isComingSoon: true,
  },
  {
    id: 'mistral', name: 'Mistral', url: 'https://chat.mistral.ai',
    tagline: 'Mistral AI', color: '#FF7000', isSupported: false, isComingSoon: true,
  },
];

export const PLATFORM_MAP = new Map(
  AI_PLATFORMS.map((p) => [p.id, p])
);

export function getPlatform(id: PlatformId): AIPlatform | undefined {
  return PLATFORM_MAP.get(id);
}

export const SUPPORTED_PLATFORMS = AI_PLATFORMS.filter((p) => p.isSupported);
