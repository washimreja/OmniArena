'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PROVIDERS_ORDER, PROVIDER_DISPLAY, getModelsByProvider } from '@/features/models/registry';
import { ProviderIcon } from '@/components/icons/ProviderIcon';

interface ModelSelectorProps {
  selectedKeys: string[];
  onToggle: (modelKey: string) => void;
  className?: string;
}

export function ModelSelector({ selectedKeys, onToggle, className }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const modelsByProvider = getModelsByProvider();
  const selectedCount = selectedKeys.length;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-btn border text-xs transition-colors',
          open
            ? 'border-accent/40 bg-accent/10 text-accent'
            : 'border-border-subtle bg-bg-elevated text-text-secondary hover:text-text-primary hover:border-border-strong'
        )}
        aria-expanded={open}
        aria-label="Select AI models"
      >
        <Cpu size={13} />
        <span className="font-medium">{selectedCount === 0 ? 'Select models' : `${selectedCount} models`}</span>
        <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-full left-0 mb-2 w-72 bg-[#15151F] border border-border-default rounded-[10px] shadow-2xl z-40 overflow-hidden"
            >
              <div className="px-3.5 py-3 border-b border-border-subtle">
                <p className="text-sm font-semibold text-text-primary">Select models</p>
                <p className="text-[11px] text-text-muted mt-0.5">Choose models to compare</p>
              </div>

              <div className="max-h-80 overflow-y-auto px-2 py-2.5">
                {PROVIDERS_ORDER.map((providerId) => {
                  const models = modelsByProvider[providerId];
                  if (!models?.length) return null;
                  const providerInfo = PROVIDER_DISPLAY[providerId];

                  return (
                    <div key={providerId} className="mb-3 last:mb-0">
                      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                        {providerInfo?.label ?? providerId}
                      </p>
                      <div className="space-y-0.5">
                        {models.map((model) => {
                          const isSelected = selectedKeys.includes(model.modelKey);
                          return (
                            <button
                              type="button"
                              key={model.modelKey}
                              onClick={() => onToggle(model.modelKey)}
                              className={cn(
                                'w-full flex items-center gap-2.5 px-2 py-2 rounded-btn text-left transition-colors',
                                isSelected ? 'bg-accent/10 text-text-primary' : 'hover:bg-bg-hover text-text-secondary'
                              )}
                            >
                              <ProviderIcon provider={model.provider} size="sm" />
                              <p className="flex-1 text-xs font-medium truncate">{model.displayName}</p>
                              <span className={cn(
                                'w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors',
                                isSelected ? 'bg-accent border-accent' : 'border-border-strong'
                              )}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-3.5 py-2.5 border-t border-border-subtle">
                <p className="text-[11px] text-text-muted">{selectedCount} model{selectedCount !== 1 ? 's' : ''} selected</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
