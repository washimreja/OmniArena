// ─── Gemini DOM Selectors ─────────────────────────────────────────────────────
// Update when Google changes the Gemini UI at gemini.google.com

export const GEMINI_SELECTORS = {
  /** Main prompt input (rich text) */
  input: 'div.ql-editor[contenteditable="true"]',
  inputFallback: 'rich-textarea .ql-editor',

  /** Send button */
  sendButton: 'button.send-button',
  sendButtonFallback: 'button[aria-label="Send message"]',

  /** Stop/cancel button present while generating */
  stopButton: 'button[aria-label="Stop response"]',

  /** Response container */
  responseContainer: 'model-response',
  /** Text within response */
  responseText: '.markdown',
  responseTextFallback: 'message-content',
} as const;
