import type { ArenaResponse } from '@/types/ai';
import type { ArenaVerdictData, ModelReview, ReviewProvider, ReviewRequest } from './types';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hash(value: string): number {
  return Array.from(value).reduce((total, character) => (
    (total * 31 + character.charCodeAt(0)) % 997
  ), 0);
}

function getConnectorKey(res: ArenaResponse): string {
  return res.connectorId || res.model?.modelKey || 'chatgpt';
}

function getConnectorName(res: ArenaResponse): string {
  return res.connectorName || res.model?.displayName || 'AI Platform';
}

function scoreResponse(response: ArenaResponse, prompt: string): number {
  const lengthSignal = Math.min(Math.round(response.content.length / 70), 12);
  const modelSignal = hash(`${getConnectorKey(response)}:${prompt}`) % 13;
  return 72 + lengthSignal + modelSignal;
}

function getStrengths(response: ArenaResponse): string[] {
  const strengths = ['Clear framing of the core answer'];
  if (response.content.length > 900) strengths.push('Strong depth and supporting context');
  else strengths.push('Efficient, easy-to-scan explanation');
  if (/\d\.|\*\*|\|/.test(response.content)) strengths.push('Well-structured presentation');
  return strengths;
}

function getWeaknesses(response: ArenaResponse): string[] {
  if (response.content.length > 1300) return ['Could be more concise for a quick decision'];
  if (response.content.length < 650) return ['Could include more context or concrete examples'];
  return ['Would benefit from a slightly more explicit tradeoff summary'];
}

function buildReviews(responses: ArenaResponse[], prompt: string): ModelReview[] {
  return responses.map((target, index) => {
    const reviewer = responses[(index + 1) % responses.length];
    const strengths = getStrengths(target);
    const weaknesses = getWeaknesses(target);

    return {
      id: `review-${target.id}`,
      reviewerModelKey: getConnectorKey(reviewer),
      targetModelKey: getConnectorKey(target),
      score: scoreResponse(target, prompt),
      strengths,
      weaknesses,
      summary: `${getConnectorName(reviewer)} found ${getConnectorName(target)} clear and structured, with a tradeoff in ${weaknesses[0].toLowerCase()}`,
    };
  });
}

function buildVerdict(responses: ArenaResponse[], reviews: ModelReview[]): ArenaVerdictData {
  const ranked = [...reviews].sort((a, b) => b.score - a.score);
  const bestReview = ranked[0];
  const quickResponse = [...responses].sort((a, b) => a.content.length - b.content.length)[0];
  const deepResponse = [...responses].sort((a, b) => b.content.length - a.content.length)[0];
  const isTie = ranked.length > 1 && ranked[0].score - ranked[1].score <= 2;

  return {
    outcome: isTie ? 'tie' : 'winner',
    bestOverallModelKey: bestReview.targetModelKey,
    bestForQuickAnswerModelKey: getConnectorKey(quickResponse),
    bestForDeepExplanationModelKey: getConnectorKey(deepResponse),
    confidence: isTie ? 'low' : bestReview.score >= 90 ? 'high' : 'medium',
    reasoning: isTie
      ? 'The leading responses make different tradeoffs well, so the best choice depends on the depth you need.'
      : `Best balance of clarity, completeness, and practical usefulness for this prompt.`,
    strengths: bestReview.strengths,
    tradeoffs: bestReview.weaknesses,
  };
}

export const mockReviewProvider: ReviewProvider = {
  async review(request: ReviewRequest) {
    await sleep(700);
    const completedResponses = request.responses.filter((response) => response.status === 'completed');

    if (completedResponses.length < 2) {
      throw new Error('At least two completed responses are required for a comparison.');
    }

    const reviews = buildReviews(completedResponses, request.prompt);
    return { reviews, verdict: buildVerdict(completedResponses, reviews) };
  },
};
