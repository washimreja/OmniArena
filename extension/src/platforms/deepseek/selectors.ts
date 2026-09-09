// ─── DeepSeek DOM Selectors (chat.deepseek.com) ──────────────────────────────
export const DEEPSEEK_SELECTORS = {
  input: 'textarea#chat-input',
  inputFallback: 'textarea[placeholder]',
  sendButton: 'button[type="submit"]',
  sendButtonFallback: 'div[class*="send"]',
  stopButton: 'button[aria-label="stop"]',
  responseContainer: 'div[class*="assistant"]',
  responseText: 'div[class*="markdown"]',
} as const;
