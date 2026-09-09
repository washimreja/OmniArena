// ─── Claude DOM Selectors (claude.ai) ────────────────────────────────────────
export const CLAUDE_SELECTORS = {
  input: 'div[contenteditable="true"][data-placeholder]',
  inputFallback: '.ProseMirror[contenteditable="true"]',
  sendButton: 'button[aria-label="Send Message"]',
  sendButtonFallback: 'button[type="submit"]',
  stopButton: 'button[aria-label="Stop Response"]',
  responseContainer: '[data-is-streaming]',
  responseText: '.prose',
  responseTextFallback: '.font-claude-message',
} as const;
