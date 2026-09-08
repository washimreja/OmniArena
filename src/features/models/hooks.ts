'use client';

import { useState, useCallback } from 'react';
import { MOCK_MODELS, DEFAULT_SELECTED_MODELS } from './registry';
import type { AIModel } from '@/types/ai';

export function useSelectedModels() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(DEFAULT_SELECTED_MODELS);

  const selectedModels: AIModel[] = selectedKeys
    .map((key) => MOCK_MODELS.find((m) => m.modelKey === key))
    .filter((m): m is AIModel => Boolean(m));

  const toggle = useCallback((modelKey: string) => {
    setSelectedKeys((prev) =>
      prev.includes(modelKey)
        ? prev.filter((k) => k !== modelKey)
        : [...prev, modelKey]
    );
  }, []);

  const isSelected = useCallback(
    (modelKey: string) => selectedKeys.includes(modelKey),
    [selectedKeys]
  );

  const clear = useCallback(() => setSelectedKeys([]), []);
  const reset = useCallback(() => setSelectedKeys(DEFAULT_SELECTED_MODELS), []);

  return { selectedModels, selectedKeys, toggle, isSelected, clear, reset };
}
