import type { AIPlatformAdapter } from '../adapter';
import { CLAUDE_SELECTORS } from './selectors';

function waitForElement(selector: string, timeoutMs = 15000): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }
    const obs = new MutationObserver(() => { const found = document.querySelector(selector); if (found) { obs.disconnect(); resolve(found); } });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { obs.disconnect(); resolve(null); }, timeoutMs);
  });
}

export class ClaudeAdapter implements AIPlatformAdapter {
  readonly platformId = 'claude' as const;

  async isReady(): Promise<boolean> {
    const el = await waitForElement(CLAUDE_SELECTORS.input) ?? await waitForElement(CLAUDE_SELECTORS.inputFallback, 3000);
    return el !== null;
  }

  async sendPrompt(prompt: string): Promise<void> {
    const inputEl = document.querySelector<HTMLElement>(CLAUDE_SELECTORS.input) ?? document.querySelector<HTMLElement>(CLAUDE_SELECTORS.inputFallback);
    if (!inputEl) throw new Error('Claude: input not found');
    inputEl.focus();
    document.execCommand('selectAll', false);
    document.execCommand('insertText', false, prompt);
    inputEl.dispatchEvent(new InputEvent('input', { bubbles: true }));

    await new Promise<void>((resolve, reject) => {
      let elapsed = 0;
      const iv = setInterval(() => {
        const btn = document.querySelector<HTMLButtonElement>(CLAUDE_SELECTORS.sendButton) ?? document.querySelector<HTMLButtonElement>(CLAUDE_SELECTORS.sendButtonFallback);
        if (btn && !btn.disabled) { clearInterval(iv); btn.click(); resolve(); return; }
        elapsed += 100;
        if (elapsed > 5000) { clearInterval(iv); reject(new Error('Claude: send button timeout')); }
      }, 100);
    });
  }

  observeResponse(onChunk: (delta: string) => void, onComplete: (fullText: string) => void, onError: (error: string) => void): () => void {
    let lastText = ''; let started = false; let doneTimer: ReturnType<typeof setTimeout> | null = null;
    const getText = () => { const els = document.querySelectorAll(CLAUDE_SELECTORS.responseContainer); const latest = els[els.length - 1]; if (!latest) return ''; const md = latest.querySelector(CLAUDE_SELECTORS.responseText) ?? latest.querySelector(CLAUDE_SELECTORS.responseTextFallback); return (md ?? latest).textContent ?? ''; };
    const scheduleDone = () => { if (doneTimer) clearTimeout(doneTimer); doneTimer = setTimeout(() => { const stop = document.querySelector(CLAUDE_SELECTORS.stopButton); if (!stop && started) { cleanup(); onComplete(lastText); } }, 2000); };
    const obs = new MutationObserver(() => { const cur = getText(); if (!cur || cur === lastText) return; const delta = cur.slice(lastText.length); lastText = cur; if (delta) { started = true; onChunk(delta); scheduleDone(); } });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    const hard = setTimeout(() => { cleanup(); if (started) onComplete(lastText); else onError('Claude: response timeout'); }, 180_000);
    function cleanup() { obs.disconnect(); if (doneTimer) clearTimeout(doneTimer); clearTimeout(hard); }
    return cleanup;
  }
}
