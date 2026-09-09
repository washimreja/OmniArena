import type { AIPlatformAdapter } from '../adapter';
import { GROK_SELECTORS } from './selectors';

function waitForElement(selector: string, timeoutMs = 15000): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }
    const obs = new MutationObserver(() => { const found = document.querySelector(selector); if (found) { obs.disconnect(); resolve(found); } });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { obs.disconnect(); resolve(null); }, timeoutMs);
  });
}

export class GrokAdapter implements AIPlatformAdapter {
  readonly platformId = 'grok' as const;

  async isReady(): Promise<boolean> {
    const el = await waitForElement(GROK_SELECTORS.input) ?? await waitForElement(GROK_SELECTORS.inputFallback, 3000);
    return el !== null;
  }

  async sendPrompt(prompt: string): Promise<void> {
    const inputEl = document.querySelector<HTMLTextAreaElement>(GROK_SELECTORS.input) ?? document.querySelector<HTMLElement>(GROK_SELECTORS.inputFallback);
    if (!inputEl) throw new Error('Grok: input not found');
    inputEl.focus();
    if (inputEl instanceof HTMLTextAreaElement) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(inputEl, prompt);
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      document.execCommand('selectAll', false);
      document.execCommand('insertText', false, prompt);
      inputEl.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
    await new Promise<void>((resolve, reject) => {
      let elapsed = 0;
      const iv = setInterval(() => {
        const btn = document.querySelector<HTMLButtonElement>(GROK_SELECTORS.sendButton) ?? document.querySelector<HTMLButtonElement>(GROK_SELECTORS.sendButtonFallback);
        if (btn && !btn.disabled) { clearInterval(iv); btn.click(); resolve(); return; }
        elapsed += 100;
        if (elapsed > 5000) { clearInterval(iv); reject(new Error('Grok: send button timeout')); }
      }, 100);
    });
  }

  observeResponse(onChunk: (delta: string) => void, onComplete: (fullText: string) => void, onError: (error: string) => void): () => void {
    let lastText = ''; let started = false; let doneTimer: ReturnType<typeof setTimeout> | null = null;
    const getText = () => { const els = document.querySelectorAll(GROK_SELECTORS.responseContainer); const latest = els[els.length - 1]; if (!latest) return ''; const md = latest.querySelector(GROK_SELECTORS.responseText); return (md ?? latest).textContent ?? ''; };
    const scheduleDone = () => { if (doneTimer) clearTimeout(doneTimer); doneTimer = setTimeout(() => { const stop = document.querySelector(GROK_SELECTORS.stopButton); if (!stop && started) { cleanup(); onComplete(lastText); } }, 2000); };
    const obs = new MutationObserver(() => { const cur = getText(); if (!cur || cur === lastText) return; const delta = cur.slice(lastText.length); lastText = cur; if (delta) { started = true; onChunk(delta); scheduleDone(); } });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    const hard = setTimeout(() => { cleanup(); if (started) onComplete(lastText); else onError('Grok: response timeout'); }, 180_000);
    function cleanup() { obs.disconnect(); if (doneTimer) clearTimeout(doneTimer); clearTimeout(hard); }
    return cleanup;
  }
}
