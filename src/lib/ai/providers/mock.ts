import type { AIProvider, GenerateOptions, GenerateResult, StreamChunk } from '@/types/ai';

// Mock responses — authentic to each AI platform connector personality
const MOCK_RESPONSES: Record<string, string[]> = {
  chatgpt: [
    `**ChatGPT (OpenAI) Analysis:**

This is an insightful question that touches on fundamental principles and practical trade-offs. Let's break this down systematically:

1. **First Principles**: Structured frameworks consistently outperform ad-hoc approaches across distributed architectures and complex logic.
2. **Practical Application**: In production, optimize for maintainability and clear failure boundaries. The 80/20 rule applies — 80% of value comes from 20% of high-impact simplicity.
3. **Recommended Execution**:
   - Start with a clean contract / interface
   - Validate early with end-to-end telemetry
   - Refactor iteratively based on empirical data rather than speculation

The key takeaway is that **clarity beats cleverness** in durable engineering.`,
  ],

  claude: [
    `**Claude (Anthropic) Perspective:**

I find this question genuinely fascinating because it reveals a subtle tension worth examining deeply.

The conventional consensus is partially right, but misses an essential nuance: *context dictates architecture*. What thrives under one set of constraints can fail under another.

**When the standard approach excels:**
- Stable requirements with predictable lifecycle patterns
- Teams prioritizing consensus and established conventions
- When consistency matters more than micro-optimization

**When you should intentionally deviate:**
- Novel problem spaces with unmapped design primitives
- High-concurrency or low-latency domains where generalized abstractions leak
- When the architectural cost of conformity exceeds the cost of a focused pattern

My honest assessment: don't look for a single universal formula. The true mastery is knowing *which trade-off to choose deliberately*.`,
  ],

  gemini: [
    `**Gemini (Google) Synthesis:**

Drawing across multimodal knowledge and systems engineering patterns, here is a structured synthesis:

| Dimension | Criticality | Strategic Consideration |
|---|---|---|
| **Architectural Cohesion** | High | Unify state contracts across boundaries |
| **Operational Reversibility**| High | Favor two-way doors over irreversible commitments |
| **Execution Velocity** | Medium | Balance thorough validation against time-to-value |

**Key Recommendations:**
1. Establish verifiable success metrics upfront.
2. Use modular, connector-based decoupling to isolate external platform dependencies.
3. Run automated lint, build, and contract verification on every state boundary.

This strategy ensures high reliability while keeping the system agile and extensible.`,
  ],

  grok: [
    `**Grok (xAI) Take:**

Let's cut right through the marketing fluff and get to what actually works.

Most people overcomplicate this because over-engineering feels like progress. It isn't. The simplest solution that solves 95% of the real problem with zero moving parts is almost always the winner.

**The unvarnished truth:**
- Don't build for hypothetical million-user scale on day one.
- Eliminate intermediaries wherever possible — connect directly.
- If an abstraction takes longer to explain than the problem it solves, delete it.

Keep it fast, keep it honest, and ship what actually moves the needle.`,
  ],

  deepseek: [
    `**DeepSeek AI Technical Breakdown:**

From a computational and algorithmic standpoint, let's analyze the mathematical structure and computational cost:

1. **Complexity Profile**:
   - Time Complexity: O(N) linear iteration over active connector streams.
   - Memory Overhead: O(1) state per active session worker.

2. **Step-by-Step Logic**:
   - Step 1: Disambiguate request inputs and enforce strict type guards.
   - Step 2: Route concurrently to independent workers without head-of-line blocking.
   - Step 3: Stream incremental deltas directly to client buffers for sub-millisecond perceived latency.

Empirical benchmarks demonstrate that asynchronous pipelining produces optimal throughput with minimal CPU overhead.`,
  ],

  mistral: [
    `**Mistral AI Summary:**

Here is a focused, high-precision European perspective on the challenge:

- **Core Axiom**: Lean, modular components beat monolithic designs every time.
- **Key Strategy**: Decouple the user intent layer from the platform automation layer.
- **Actionable Step**: Validate each connector as an independent worker with isolated error boundaries.

Simple, elegant, and exceptionally efficient.`,
  ],

  qwen: [
    `**Qwen Studio (Alibaba Cloud) Assessment:**

Combining comprehensive multilingual knowledge and deep engineering paradigms:

- **System Reliability**: Ensure graceful fallbacks when individual platform connections experience transient latency or rate limits.
- **Context Depth**: Structure the prompt routing so that model capabilities are utilized with maximal semantic precision.
- **Best Practice**: Treat each platform connector as a dedicated peer node in a federated intelligence grid.`,
  ],

  copilot: [
    `**Microsoft Copilot Grounded Response:**

Here is a practical, enterprise-grade summary grounded in modern development best practices:

- **Integration**: Seamless connectivity across daily workflows and developer tools.
- **Security**: Direct user-controlled browser session authentication eliminates API credential leaks.
- **Productivity**: Broadcast prompts to multiple platforms simultaneously to cross-verify facts, code solutions, and creative copy in one unified view.`,
  ],

  meta: [
    `**Meta AI (Llama) Response:**

Harnessing open-weight research and community-driven AI architecture:

Open collaboration and transparent standards drive the fastest innovation. By letting users connect directly to their choice of AI accounts, OmniArena fosters true model independence and freedom from vendor lock-in.`,
  ],

  kimi: [
    `**Kimi (Moonshot AI) Long-Context Analysis:**

Deep contextual analysis reveals that coherence across extended interactions is paramount. By capturing complete conversation history and orchestrating across multiple intelligent agents, you gain diverse analytical depth that a single platform cannot replicate alone.`,
  ],

  manus: [
    `**Manus AI Autonomous Workflow Plan:**

Autonomous execution sequence initialized:
1. Parse user intent and identify required domain competencies.
2. Delegate subtasks across connected platform agents in parallel.
3. Consolidate results, synthesize conflicts, and output verified deliverable.

End-to-end task progression complete with zero friction.`,
  ],

  vibe: [
    `**Vibe AI Rapid Flow:**

Everything is flowing smoothly! The code is clean, the architecture is decoupled, the vibes are immaculate. Ready to iterate and ship at lightning speed! ⚡`,
  ],
};

// Also support legacy model keys if any exist in older stored turns
MOCK_RESPONSES['gpt-4o'] = MOCK_RESPONSES.chatgpt;
MOCK_RESPONSES['gpt-4o-mini'] = MOCK_RESPONSES.chatgpt;
MOCK_RESPONSES['claude-3-5-sonnet'] = MOCK_RESPONSES.claude;
MOCK_RESPONSES['claude-3-haiku'] = MOCK_RESPONSES.claude;
MOCK_RESPONSES['gemini-1-5-pro'] = MOCK_RESPONSES.gemini;
MOCK_RESPONSES['gemini-flash'] = MOCK_RESPONSES.gemini;
MOCK_RESPONSES['grok-2'] = MOCK_RESPONSES.grok;

export class MockProvider implements AIProvider {
  readonly id = 'mock' as const;
  readonly displayName = 'Mock Provider';

  supportsModel(): boolean {
    return true;
  }

  async generate(
    modelKey: string,
    options: GenerateOptions,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<GenerateResult> {
    const startTime = Date.now();
    const responses = MOCK_RESPONSES[modelKey] ?? MOCK_RESPONSES.chatgpt;
    const response = responses[Math.floor(Math.random() * responses.length)];

    const chars = response.split('');
    const chunkSize = Math.max(3, Math.floor(chars.length / 28));

    for (let i = 0; i < chars.length; i += chunkSize) {
      const delta = chars.slice(i, i + chunkSize).join('');
      await new Promise((resolve) => setTimeout(resolve, 25 + Math.random() * 20));
      onChunk?.({ delta, done: false });
    }

    onChunk?.({ delta: '', done: true });

    return {
      content: response,
      latencyMs: Date.now() - startTime,
      tokenCount: Math.round(response.length / 4),
    };
  }

  isAvailable(): boolean {
    return true;
  }
}

export const mockProvider = new MockProvider();
