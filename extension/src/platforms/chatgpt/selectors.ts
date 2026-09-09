// ─── ChatGPT DOM Selectors ────────────────────────────────────────────────────
//
// Isolated here so UI changes only require updating this file.
// Verified against ChatGPT web UI circa mid-2026.
//
// HOW TO UPDATE: Open chatgpt.com, open DevTools, inspect the input textarea
// and the latest assistant message container. Update selectors below.

export const CHATGPT_SELECTORS = {
  /** Candidate selectors for the main prompt input */
  inputs: [
    '#prompt-textarea',
    'textarea[placeholder*="ChatGPT"]',
    'textarea[aria-label*="ChatGPT"]',
    'textarea[data-id="root"]',
    'textarea.wm-composer-textarea',
    '#mobile-composer-prompt',
    'div[contenteditable="true"][data-id="root"]',
    'div[contenteditable="true"]#prompt-textarea',
    'div[contenteditable="true"]',
    'textarea',
  ],

  /** Candidate selectors for the send button */
  sendButtons: [
    'button[data-testid="send-button"]',
    'button[aria-label="Send prompt"]',
    'button[aria-label="Send message"]',
    'button[aria-label="Submit"]',
    'button.wm-composer-submitButton',
    'button[data-testid="fruitjuice-send-button"]',
    'button:has(svg[data-testid="send-button-icon"])',
  ],

  /** Candidate selectors for the stop button (indicates active generation) */
  stopButtons: [
    'button[data-testid="stop-button"]',
    'button[aria-label="Stop generating"]',
    'button[aria-label="Stop streaming"]',
    'button[aria-label="Stop"]',
  ],

  /** Candidate selectors for assistant message containers */
  assistantTurns: [
    'div[data-message-author-role="assistant"]',
    'div.agent-turn',
    'article[data-testid^="conversation-turn-"]:has([data-message-author-role="assistant"])',
    'div.wm-app-threadViewport > [data-message-author-role="assistant"]',
  ],

  /** Candidate selectors for markdown / text content inside assistant turns */
  markdownContents: [
    '.markdown.prose',
    '.markdown',
    '.prose',
    'div.whitespace-pre-wrap',
    'div[class*="markdown"]',
  ],
} as const;
