// ─── Formatting Utilities ─────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLatency(ms?: number): string {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatTokens(count?: number): string {
  if (!count) return '';
  if (count < 1000) return `${count} tokens`;
  return `${(count / 1000).toFixed(1)}k tokens`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

export function generateConversationTitle(prompt: string): string {
  return truncate(prompt.trim(), 60);
}

export function groupByDate<T extends { createdAt?: string; updatedAt?: string }>(
  items: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  items.forEach((item) => {
    const dateStr = item.updatedAt || item.createdAt || '';
    const label = formatDate(dateStr);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
}
