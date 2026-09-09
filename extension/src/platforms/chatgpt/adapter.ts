import type { AIPlatformAdapter } from '../adapter';
import { CHATGPT_SELECTORS } from './selectors';

/** Find the first matching element from a list of candidate selectors */
function queryAny<T extends Element = HTMLElement>(
  selectors: readonly string[],
  root: ParentNode = document
): T | null {
  for (const selector of selectors) {
    try {
      const el = root.querySelector<T>(selector);
      if (el) return el;
    } catch {
      // Ignore invalid or pseudo-class syntax unsupported in current context
    }
  }
  return null;
}

/** Wait for at least one element matching any of the candidate selectors */
function waitForAny<T extends Element = HTMLElement>(
  selectors: readonly string[],
  timeoutMs = 15000
): Promise<T | null> {
  return new Promise((resolve) => {
    const existing = queryAny<T>(selectors);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = queryAny<T>(selectors);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });
}

/** Wait for a send button to become enabled */
function waitForSendEnabled(timeoutMs = 6000): Promise<HTMLButtonElement | null> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const interval = setInterval(() => {
      const btn = queryAny<HTMLButtonElement>(CHATGPT_SELECTORS.sendButtons);
      if (btn && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true') {
        clearInterval(interval);
        resolve(btn);
        return;
      }
      elapsed += 100;
      if (elapsed >= timeoutMs) {
        clearInterval(interval);
        // Return button even if disabled as fallback
        resolve(btn);
      }
    }, 100);
  });
}

export class ChatGPTAdapter implements AIPlatformAdapter {
  readonly platformId = 'chatgpt' as const;
  private preSendTurnCount = 0;

  async isReady(): Promise<boolean> {
    const input = await waitForAny(CHATGPT_SELECTORS.inputs, 15000);
    return input !== null;
  }

  async sendPrompt(prompt: string): Promise<void> {
    const inputEl = await waitForAny<HTMLElement>(CHATGPT_SELECTORS.inputs, 10000);
    if (!inputEl) throw new Error('ChatGPT: input element not found. Please verify ChatGPT is open and logged in.');

    // Count turns before submitting so we only observe the new response
    const existingTurns = document.querySelectorAll(CHATGPT_SELECTORS.assistantTurns[0]);
    this.preSendTurnCount = existingTurns.length;

    inputEl.focus();

    if (inputEl instanceof HTMLTextAreaElement || inputEl instanceof HTMLInputElement) {
      // Set value via native prototype setter so React registers the state change
      const proto = inputEl instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

      if (nativeSetter) {
        nativeSetter.call(inputEl, prompt);
      } else {
        inputEl.value = prompt;
      }

      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Contenteditable (ProseMirror / div)
      document.execCommand('selectAll', false);
      const inserted = document.execCommand('insertText', false, prompt);
      if (!inserted || !inputEl.textContent?.trim()) {
        inputEl.textContent = prompt;
        inputEl.dispatchEvent(new InputEvent('input', { bubbles: true, data: prompt, inputType: 'insertText' }));
      }
    }

    // Wait for Send button to enable
    const sendBtn = await waitForSendEnabled(4000);

    if (sendBtn && !sendBtn.disabled && sendBtn.getAttribute('aria-disabled') !== 'true') {
      sendBtn.click();
      return;
    }

    // Fallback: Dispatch Enter keydown/keyup on input
    const enterDown = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });
    const enterUp = new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    });

    inputEl.dispatchEvent(enterDown);
    inputEl.dispatchEvent(enterUp);

    // If button became clickable after Enter, click it
    setTimeout(() => {
      const lateBtn = queryAny<HTMLButtonElement>(CHATGPT_SELECTORS.sendButtons);
      if (lateBtn && !lateBtn.disabled) lateBtn.click();
    }, 200);
  }

  observeResponse(
    onChunk: (delta: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void
  ): () => void {
    let lastText = '';
    let generationStarted = false;
    let completionTimeout: ReturnType<typeof setTimeout> | null = null;
    let hasCompleted = false;

    const getLatestResponseText = (): string => {
      // Search all candidate turn selectors
      let turns: NodeListOf<Element> | Element[] = [];
      for (const turnSel of CHATGPT_SELECTORS.assistantTurns) {
        turns = document.querySelectorAll(turnSel);
        if (turns.length > 0) break;
      }

      if (turns.length === 0) return '';
      const latestTurn = turns[turns.length - 1];
      if (!latestTurn) return '';

      // Search inside markdown contents
      const markdownEl = queryAny(CHATGPT_SELECTORS.markdownContents, latestTurn);
      const text = (markdownEl ?? latestTurn).textContent ?? '';
      return text.trim();
    };

    const isGenerating = (): boolean => {
      const stopBtn = queryAny(CHATGPT_SELECTORS.stopButtons);
      return stopBtn !== null;
    };

    const scheduleCompletionCheck = () => {
      if (completionTimeout) clearTimeout(completionTimeout);
      // Wait 1.8 seconds after last chunk to verify generation has ceased
      completionTimeout = setTimeout(() => {
        if (hasCompleted) return;
        if (!isGenerating() && generationStarted && lastText.length > 0) {
          hasCompleted = true;
          cleanup();
          onComplete(lastText);
        }
      }, 1800);
    };

    const observer = new MutationObserver(() => {
      if (hasCompleted) return;

      const currentText = getLatestResponseText();
      if (!currentText || currentText === lastText) return;

      const delta = currentText.startsWith(lastText)
        ? currentText.slice(lastText.length)
        : currentText;

      lastText = currentText;

      if (delta) {
        generationStarted = true;
        onChunk(delta);
        scheduleCompletionCheck();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Check periodically in case mutations are batched
    const pollInterval = setInterval(() => {
      if (hasCompleted) return;
      const currentText = getLatestResponseText();
      if (currentText && currentText !== lastText) {
        const delta = currentText.startsWith(lastText)
          ? currentText.slice(lastText.length)
          : currentText;
        lastText = currentText;
        generationStarted = true;
        onChunk(delta);
        scheduleCompletionCheck();
      } else if (generationStarted && !isGenerating() && lastText.length > 0) {
        scheduleCompletionCheck();
      }
    }, 300);

    // Hard timeout — 3 minutes max
    const hardTimeout = setTimeout(() => {
      if (hasCompleted) return;
      hasCompleted = true;
      cleanup();
      if (generationStarted && lastText) {
        onComplete(lastText);
      } else {
        onError('ChatGPT: response timeout — please make sure you are logged into chatgpt.com');
      }
    }, 180_000);

    function cleanup() {
      observer.disconnect();
      clearInterval(pollInterval);
      if (completionTimeout) clearTimeout(completionTimeout);
      clearTimeout(hardTimeout);
    }

    return cleanup;
  }
}

