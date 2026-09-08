import type { AIProvider, GenerateOptions, GenerateResult, StreamChunk } from '@/types/ai';

// Mock responses — different per model to make comparison meaningful
const MOCK_RESPONSES: Record<string, string[]> = {
  'gpt-4o': [
    `**GPT-4o Analysis:**

This is a thoughtful question that touches on several key dimensions. Let me break this down systematically:

1. **First principle**: The core concept here is well-established in the literature. Multiple studies have confirmed that structured approaches yield better outcomes.

2. **Practical application**: In real-world scenarios, you'll want to consider the trade-offs between complexity and maintainability. The 80/20 rule often applies — 80% of value comes from 20% of the implementation.

3. **Recommended approach**: Start with a minimal viable solution, validate your assumptions, then iterate. This reduces risk and accelerates learning.

The key insight is that **clarity beats cleverness** in most professional contexts. I recommend documenting your reasoning as you go.`,
  ],
  'gpt-4o-mini': [
    `**Quick Answer (GPT-4o Mini):**

Here's a concise breakdown:

- **Core idea**: Focus on the fundamentals before adding complexity
- **Key steps**: Plan → Execute → Validate → Iterate
- **Watch out for**: Over-engineering in early stages

The most effective strategy is to start simple and expand incrementally based on real feedback rather than assumptions.`,
  ],
  'claude-3-5-sonnet': [
    `**Claude's Perspective:**

I find this question genuinely interesting because it reveals a deeper tension worth exploring.

The conventional wisdom here is partially correct, but misses something important: *context determines strategy*. What works brilliantly in one situation can fail spectacularly in another.

Let me offer a more nuanced view:

**When the standard approach works well:**
- Teams with established conventions
- Projects with stable, well-understood requirements
- Situations where consistency matters more than optimization

**When you should deviate:**
- Novel problems without established patterns
- When evidence contradicts conventional approaches
- When the cost of conformity exceeds the cost of deviation

My honest assessment: most practitioners apply solutions too uniformly. The meta-skill is knowing *when* to use which approach, not mastering any single approach.`,
  ],
  'claude-3-haiku': [
    `**Claude Haiku:**

Three key points:

1. **Start with clarity** — Define the problem precisely before proposing solutions
2. **Prefer reversibility** — Choose approaches you can undo or adjust
3. **Measure outcomes** — Track what actually matters, not what's easy to measure

Simple, but most problems stem from skipping step one.`,
  ],
  'gemini-1-5-pro': [
    `**Gemini 1.5 Pro Response:**

Drawing on broad contextual understanding, here's my comprehensive analysis:

**Situational Assessment:**
The question points to a class of problems where multiple valid approaches exist. The selection criteria should be:

| Factor | Weight | Consideration |
|--------|--------|---------------|
| Complexity | High | Simpler is usually better |
| Reversibility | High | Prefer undoable decisions |
| Speed | Medium | Balance thoroughness vs. urgency |
| Team alignment | Medium | Consensus improves execution |

**My Recommendation:**

Given typical constraints, I'd suggest a **hybrid approach**:
1. Establish clear success metrics upfront
2. Use established patterns as a starting point
3. Document deviations and their rationale
4. Review and adjust at regular intervals

This balances predictability with adaptability — which is usually the optimal position.`,
  ],
  'gemini-flash': [
    `**Gemini Flash (Fast Response):**

Here are the key points:

• Define success criteria first
• Use proven patterns where available  
• Document your reasoning
• Build in review checkpoints
• Prefer incremental over big-bang changes

Speed tip: The fastest path to good is usually iterating on *something* rather than perfecting *nothing*.`,
  ],
  'grok-2': [
    `**Grok-2 Analysis:**

Let's cut through the noise on this.

The conventional answer you'll find everywhere focuses on [standard approach], but there's a more interesting angle worth considering: **most frameworks are solutions to problems that existed 5–10 years ago**.

What's actually happening in leading organizations right now:

**The shift:** Moving from reactive to proactive patterns. Instead of responding to problems as they emerge, high-performing teams are building predictive systems that surface issues before they become costly.

**Practical implication:** The question isn't just "what's the right answer" but "what system produces consistently good answers over time?"

Build the system, not just the solution. That's the contrarian take that tends to be correct more often than not.`,
  ],
};

function getResponse(modelKey: string): string {
  const responses = MOCK_RESPONSES[modelKey];
  if (responses && responses.length > 0) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return `**${modelKey} Response:**\n\nThis is a mock response from the ${modelKey} model. Real AI integration coming in Phase 11.\n\nFor now, this demonstrates the multi-model comparison UI working end-to-end with realistic response formatting.`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MockProvider: AIProvider = {
  id: 'mock',
  displayName: 'Mock Provider',

  supportsModel(modelKey: string): boolean {
    return modelKey.trim().length > 0;
  },

  async generate(
    modelKey: string,
    _options: GenerateOptions,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<GenerateResult> {
    const startTime = Date.now();
    const fullResponse = getResponse(modelKey);

    // Simulate network latency before first token
    const initialDelay = 300 + Math.random() * 700;
    await sleep(initialDelay);

    if (onChunk) {
      // Stream tokens with variable speed
      const words = fullResponse.split('');
      let buffer = '';

      for (let i = 0; i < words.length; i++) {
        buffer += words[i];

        // Emit in small chunks for realistic streaming
        if (buffer.length >= 3 || i === words.length - 1) {
          onChunk({ delta: buffer, done: false });
          buffer = '';
          // Variable delay between chunks (4–20ms)
          await sleep(4 + Math.random() * 16);
        }
      }

      onChunk({ delta: '', done: true });
    }

    const latencyMs = Date.now() - startTime;

    return {
      content: fullResponse,
      latencyMs,
      tokenCount: Math.floor(fullResponse.split(' ').length * 1.3),
    };
  },

  isAvailable(): boolean {
    return true;
  },
};
