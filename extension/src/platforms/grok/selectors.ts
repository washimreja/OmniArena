// ─── Grok DOM Selectors (grok.com) ───────────────────────────────────────────
export const GROK_SELECTORS = {
  input: 'textarea[placeholder]',
  inputFallback: 'div[contenteditable="true"]',
  sendButton: 'button[type="submit"]',
  sendButtonFallback: 'button[aria-label="Send"]',
  stopButton: 'button[aria-label="Stop"]',
  responseContainer: '[class*="message"][class*="assistant"]',
  responseText: '[class*="prose"], [class*="markdown"]',
} as const;
