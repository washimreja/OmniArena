import type { Conversation } from '@/types/app';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'user-1',
    title: 'Explain quantum computing to a 10-year-old',
    isArchived: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastMessage: 'Explain quantum computing to a 10-year-old',
  },
  {
    id: 'conv-2',
    userId: 'user-1',
    title: 'Best architecture for a SaaS product',
    isArchived: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    lastMessage: 'Best architecture for a SaaS product',
  },
  {
    id: 'conv-3',
    userId: 'user-1',
    title: 'React vs Vue vs Svelte in 2025',
    isArchived: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastMessage: 'React vs Vue vs Svelte in 2025',
  },
  {
    id: 'conv-4',
    userId: 'user-1',
    title: 'Write a haiku about machine learning',
    isArchived: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastMessage: 'Write a haiku about machine learning',
  },
  {
    id: 'conv-5',
    userId: 'user-1',
    title: 'How does the human brain store memories?',
    isArchived: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastMessage: 'How does the human brain store memories?',
  },
  {
    id: 'conv-6',
    userId: 'user-1',
    title: 'Best investment strategies for 2025',
    isArchived: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastMessage: 'Best investment strategies for 2025',
  },
];

export const SUGGESTED_PROMPTS = [
  { id: 'sp1', text: 'Compare the best approaches to learn programming in 2025', category: 'learning' },
  { id: 'sp2', text: 'Explain the difference between AI, ML, and deep learning', category: 'ai' },
  { id: 'sp3', text: 'Write a compelling product launch announcement', category: 'writing' },
  { id: 'sp4', text: 'What are the pros and cons of remote work?', category: 'work' },
  { id: 'sp5', text: 'Explain how blockchain works in simple terms', category: 'tech' },
  { id: 'sp6', text: 'Design a morning routine for peak productivity', category: 'productivity' },
];
