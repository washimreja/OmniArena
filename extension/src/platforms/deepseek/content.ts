import { DeepSeekAdapter } from './adapter';
import type { BackgroundToContentMessage, ContentToBackgroundMessage } from '../../shared/messages';

const adapter = new DeepSeekAdapter();
function respond(msg: ContentToBackgroundMessage): void { chrome.runtime.sendMessage(msg).catch(() => {}); }

chrome.runtime.onMessage.addListener((message: BackgroundToContentMessage, _sender, sendResponse) => {
  if (message.type !== 'SEND_PROMPT') return false;
  const { prompt, conversationId, turnId } = message;
  (async () => {
    try {
      const ready = await adapter.isReady();
      if (!ready) { respond({ type: 'RESPONSE_ERROR', platform: 'deepseek', conversationId, turnId, error: 'DeepSeek page not ready or not logged in.' }); return; }
      await adapter.sendPrompt(prompt);
      respond({ type: 'RESPONSE_START', platform: 'deepseek', conversationId, turnId });
      adapter.observeResponse(
        (delta) => respond({ type: 'RESPONSE_CHUNK', platform: 'deepseek', conversationId, turnId, delta }),
        (fullText) => respond({ type: 'RESPONSE_DONE', platform: 'deepseek', conversationId, turnId, fullText }),
        (error) => respond({ type: 'RESPONSE_ERROR', platform: 'deepseek', conversationId, turnId, error })
      );
    } catch (err) { respond({ type: 'RESPONSE_ERROR', platform: 'deepseek', conversationId, turnId, error: err instanceof Error ? err.message : String(err) }); }
  })();
  sendResponse({ received: true });
  return true;
});
