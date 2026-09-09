import type { AIPlatformAdapter } from '../adapter';
import { DEEPSEEK_SELECTORS } from './selectors';

function waitForElement(selector: string, timeoutMs = 15000): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }
    const obs = new MutationObserver(() => { const found = document.querySelector(selector); if (found) { obs.disconnect(); resolve(found); } });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { obs.disconnect(); resolve(null); }, timeoutMs);
  });
}

export class DeepSeekAdapter implements AIPlatformAdapter {
  readonly platformId = 'deepseek' as const;

  async isReady(): Promise<boolean> {
    const el = await waitForElement(DEEPSEEK_SELECTORS.input) ?? await waitForElement(DEEPSEEK_SELECTORS.inputFallback, 3000);
    return el !== null;
  }

  async sendPrompt(prompt: string): Promise<void> {
    const inputEl = document.querySelector<HTMLTextAreaElement>(DEEPSEEK_SELECTORS.input) ?? document.querySelector<HTMLTextAreaElement>(DEEPSEEK_SELECTORS.inputFallback);
    if (!inputEl) throw new Error('DeepSeek: input not found');
    inputEl.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(inputEl, prompt);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise<void>((resolve, reject) => {
      let elapsed = 0;
      const iv = setInterval(() => {
        const btn = document.querySelector<HTMLButtonElement>(DEEPSEEK_SELECTORS.sendButton) ?? document.querySelector<HTMLButtonElement>(DEEPSEEK_SELECTORS.sendButtonFallback);
        if (btn && !btn.disabled) { clearInterval(iv); btn.click(); resolve(); return; }
        elapsed += 100;
        if (elapsed > 5000) { clearInterval(iv); reject(new Error('DeepSeek: send button timeout')); }
      }, 100);
    });
  }

  observeResponse(onChunk: (delta: string) => void, onComplete: (fullText: string) => void, onError: (error: string) => void): () => void {
    let lastText = ''; let started = false; let doneTimer: ReturnType<typeof setTimeout> | null = null;
    const getText = () => { const els = document.querySelectorAll(DEEPSEEK_SELECTORS.responseContainer); const latest = els[els.length - 1]; if (!latest) return ''; const md = latest.querySelector(DEEPSEEK_SELECTORS.responseText); return (md ?? latest).textContent ?? ''; };
    const scheduleDone = () => { if (doneTimer) clearTimeout(doneTimer); doneTimer = setTimeout(() => { const stop = document.querySelector(DEEPSEEK_SELECTORS.stopButton); if (!stop && started) { cleanup(); onComplete(lastText); } }, 2000); };
    const obs = new MutationObserver(() => { const cur = getText(); if (!cur || cur === lastText) return; const delta = cur.slice(lastText.length); lastText = cur; if (delta) { started = true; onChunk(delta); scheduleDone(); } });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    const hard = setTimeout(() => { cleanup(); if (started) onComplete(lastText); else onError('DeepSeek: response timeout'); }, 180_000);
    function cleanup() { obs.disconnect(); if (doneTimer) clearTimeout(doneTimer); clearTimeout(hard); }
    return cleanup;
  }
}
