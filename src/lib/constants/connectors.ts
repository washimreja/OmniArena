import type { OmniConnector, ConnectorId, ConnectorWave, ConnectorTier } from '@/types/connectors';

// ─── OmniArena Official Connectors Registry ──────────────────────────────────
//
// 12 AI Connectors organized across Primary, Secondary, and Extended tiers:
//
// Primary (Core AI Platforms):
// 1. ChatGPT (OpenAI)
// 2. Claude (Anthropic)
// 3. Gemini (Google)
// 4. Grok (xAI)
//
// Secondary (High-Demand Frontier Platforms):
// 5. DeepSeek (DeepSeek AI)
// 6. Mistral (Mistral AI)
// 7. Qwen Studio (Alibaba Cloud)
// 8. Microsoft Copilot (Microsoft)
//
// Extended (Autonomous & Emerging AI):
// 9. Meta AI (Meta)
// 10. Kimi (Moonshot AI)
// 11. Manus (Manus AI)
// 12. Vibe (Vibe AI)

export const OMNI_CONNECTORS: OmniConnector[] = [
  // ─── Primary Connectors ───────────────────────────────────────────────────
  {
    id: 'chatgpt', name: 'ChatGPT', providerName: 'OpenAI',
    category: 'Frontier Reasoning & Coding',
    description: 'Advanced reasoning, coding, and creative problem solving with GPT-4o and o1.',
    websiteUrl: 'https://chatgpt.com', brandColor: '#10A37F',
    tier: 'primary', wave: 1, supported: true,
  },
  {
    id: 'claude', name: 'Claude', providerName: 'Anthropic',
    category: 'Constitutional AI & Nuance',
    description: 'Nuanced writing, meticulous document review, and high-accuracy code synthesis with Sonnet.',
    websiteUrl: 'https://claude.ai', brandColor: '#CC785C',
    tier: 'primary', wave: 1, supported: true,
  },
  {
    id: 'gemini', name: 'Gemini', providerName: 'Google',
    category: 'Multimodal Intelligence',
    description: 'Fast reasoning, million-token context processing, and native multimodal comprehension.',
    websiteUrl: 'https://gemini.google.com', brandColor: '#4285F4',
    tier: 'primary', wave: 1, supported: true,
  },
  {
    id: 'grok', name: 'Grok', providerName: 'xAI',
    category: 'Real-time Truth-Seeking AI',
    description: 'Real-time social pulse, candid viewpoints, and cutting-edge vision understanding.',
    websiteUrl: 'https://grok.com', brandColor: '#1DA1F2',
    tier: 'primary', wave: 2, supported: true,
  },

  // ─── Secondary Connectors ─────────────────────────────────────────────────
  {
    id: 'deepseek', name: 'DeepSeek', providerName: 'DeepSeek AI',
    category: 'Open Reasoning Champion',
    description: 'High-efficiency open reasoning and competitive coding benchmark excellence.',
    websiteUrl: 'https://chat.deepseek.com', brandColor: '#5B8DEE',
    tier: 'secondary', wave: 2, supported: true,
  },
  {
    id: 'mistral', name: 'Mistral', providerName: 'Mistral AI',
    category: 'European Frontier AI',
    description: 'Precision multilingual models and efficient open-weight performance.',
    websiteUrl: 'https://chat.mistral.ai', brandColor: '#FF7000',
    tier: 'secondary', wave: 2, supported: false, isComingSoon: true,
  },
  {
    id: 'qwen', name: 'Qwen Studio', providerName: 'Alibaba Cloud',
    category: 'Multilingual & Code Champion',
    description: 'World-class mathematics, coding, and multilingual knowledge powered by Qwen 2.5.',
    websiteUrl: 'https://chat.qwen.ai', brandColor: '#615CED',
    tier: 'secondary', wave: 2, supported: false, isComingSoon: true,
  },
  {
    id: 'copilot', name: 'Microsoft Copilot', providerName: 'Microsoft',
    category: 'Web Grounded Assistant',
    description: 'Web-connected daily copilot with Bing grounding and Microsoft ecosystem cohesion.',
    websiteUrl: 'https://copilot.microsoft.com', brandColor: '#0078D4',
    tier: 'secondary', wave: 2, supported: false, isComingSoon: true,
  },

  // ─── Extended Connectors ──────────────────────────────────────────────────
  {
    id: 'meta', name: 'Meta AI', providerName: 'Meta',
    category: 'Open Source Powerhouse',
    description: 'Powered by open-weights Llama 3 models across conversational and creative domains.',
    websiteUrl: 'https://www.meta.ai', brandColor: '#0668E1',
    tier: 'extended', wave: 3, supported: false, isComingSoon: true,
  },
  {
    id: 'kimi', name: 'Kimi', providerName: 'Moonshot AI',
    category: 'Ultra Long-Context Specialist',
    description: 'Pioneering long-document analysis, cross-file research, and precise context retrieval.',
    websiteUrl: 'https://kimi.moonshot.cn', brandColor: '#3245FF',
    tier: 'extended', wave: 3, supported: false, isComingSoon: true,
  },
  {
    id: 'manus', name: 'Manus', providerName: 'Manus AI',
    category: 'Autonomous General Agent',
    description: 'Autonomous multi-step execution agent executing complex workflows end-to-end.',
    websiteUrl: 'https://manus.im', brandColor: '#E53E3E',
    tier: 'extended', wave: 3, supported: false, isComingSoon: true,
  },
  {
    id: 'vibe', name: 'Vibe', providerName: 'Vibe AI',
    category: 'Creative AI & Rapid Flow',
    description: 'Intuitive creative copilot designed for fast vibe-coding and agile prototyping.',
    websiteUrl: 'https://vibe.dev', brandColor: '#8B5CF6',
    tier: 'extended', wave: 3, supported: false, isComingSoon: true,
  },
];

export const WAVE_METADATA: Record<ConnectorWave, { title: string; subtitle: string; badge: string }> = {
  1: { title: 'Wave 1 — Live Now', subtitle: 'Core frontier models ready for immediate browser tab automation.', badge: 'Live' },
  2: { title: 'Wave 2 — Next Wave', subtitle: 'High-demand web platforms currently integrated or in adapter pipeline.', badge: 'Wave 2' },
  3: { title: 'Wave 3 — Roadmap', subtitle: 'Autonomous agents and specialized international platforms coming next.', badge: 'Roadmap' },
};

export const TIER_METADATA: Record<ConnectorTier, { label: string; badge: string }> = {
  primary: { label: 'Primary Connectors', badge: 'Core' },
  secondary: { label: 'Secondary Connectors', badge: 'Popular' },
  extended: { label: 'Extended Connectors', badge: 'Roadmap' },
};

export function getConnector(id: ConnectorId): OmniConnector | undefined {
  return OMNI_CONNECTORS.find((c) => c.id === id);
}

export function getConnectorsByWave(wave: ConnectorWave): OmniConnector[] {
  return OMNI_CONNECTORS.filter((c) => c.wave === wave);
}

export function getConnectorsByTier(tier: ConnectorTier): OmniConnector[] {
  return OMNI_CONNECTORS.filter((c) => c.tier === tier);
}

export const SUPPORTED_CONNECTORS = OMNI_CONNECTORS.filter((c) => c.supported);
