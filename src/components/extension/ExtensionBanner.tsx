'use client';

import { useEffect, useState } from 'react';
import { extensionBridge } from '@/lib/extension/bridge';

/**
 * Shows a non-intrusive banner when the OmniArena extension is not detected.
 * Disappears automatically once the extension is installed and active.
 */
export function ExtensionBanner() {
  const [status, setStatus] = useState<'checking' | 'installed' | 'missing'>('checking');

  useEffect(() => {
    let cancelled = false;
    extensionBridge.isInstalled().then((installed) => {
      if (!cancelled) setStatus(installed ? 'installed' : 'missing');
    });
    return () => { cancelled = true; };
  }, []);

  if (status !== 'missing') return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-3 px-4 py-2.5 bg-bg-elevated border-b border-amber-500/20 text-xs"
    >
      <span className="text-amber-400 text-sm leading-none">⚡</span>
      <span className="text-text-muted flex-1">
        <span className="text-amber-400 font-medium">Demo Mode</span>
        {' — OmniArena Extension not detected. Install it to use your real AI accounts.'}
      </span>
      <a
        href="https://github.com/washimreja/OmniArena#extension"
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap transition-colors"
      >
        Install →
      </a>
    </div>
  );
}
