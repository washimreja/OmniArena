import type { OrchestratorOptions } from '@/types/ai';
import { registry } from './provider-registry';

export async function orchestrate(options: OrchestratorOptions): Promise<void> {
  const { models, generateOptions, onUpdate } = options;

  // Mark all as waiting
  models.forEach((model) => {
    onUpdate(model.modelKey, { status: 'waiting', content: '' });
  });

  // Fan out in parallel — each model is independent
  await Promise.allSettled(
    models.map(async (model) => {
      try {
        onUpdate(model.modelKey, { status: 'generating', content: '' });

        const provider = registry.resolve(model.provider, model.modelKey);

        let accumulated = '';
        const result = await provider.generate(
          model.modelKey,
          generateOptions,
          (chunk) => {
            if (!chunk.done) {
              accumulated += chunk.delta;
              onUpdate(model.modelKey, {
                status: 'generating',
                content: accumulated,
              });
            }
          }
        );

        onUpdate(model.modelKey, {
          status: 'completed',
          content: result.content,
          latencyMs: result.latencyMs,
          tokenCount: result.tokenCount,
          completedAt: Date.now(),
        });
      } catch (error) {
        onUpdate(model.modelKey, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })
  );
}
