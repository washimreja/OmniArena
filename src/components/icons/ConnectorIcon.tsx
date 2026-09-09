import React from 'react';
import { SiAnthropic, SiGoogle } from '@icons-pack/react-simple-icons';
import { cn } from '@/lib/utils/cn';
import type { ConnectorId } from '@/types/connectors';
import { getConnector } from '@/lib/constants/connectors';

const SIZE_CLASSES = {
  xs: 'w-4 h-4 text-[10px]',
  sm: 'w-5 h-5 text-xs',
  md: 'w-7 h-7 text-sm',
  lg: 'w-9 h-9 text-base',
  xl: 'w-11 h-11 text-lg',
} as const;

interface ConnectorIconProps {
  connectorId: ConnectorId;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  showBackground?: boolean;
}

function OpenAIIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 0 0-.856 0l-5.97 3.473Zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 0 1 .476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163ZM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898ZM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128Zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472Zm-5.637-5.303-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 0 1 4.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 0 1-.476 0Zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523Zm5.899 2.83a5.947 5.947 0 0 0 5.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0 0 10.205 0a5.947 5.947 0 0 0-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26 0 1.88-.309a5.96 5.96 0 0 0 4.162 1.713Z" />
    </svg>
  );
}

function GrokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="m9.27 15.29 7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292ZM7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 0 0-1.829-1A8.975 8.975 0 0 0 5.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815Z" />
    </svg>
  );
}

function CopilotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M12 2a4 4 0 0 1 4 4v1.5a1.5 1.5 0 0 1-1.5 1.5H9.5A1.5 1.5 0 0 1 8 7.5V6a4 4 0 0 1 4-4Zm6.8 6.5a4.2 4.2 0 0 1 1.2 3v1a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 12.5v-1a4.2 4.2 0 0 1 1.2-3 5.9 5.9 0 0 0 1.9 1.3A3.5 3.5 0 0 0 9.5 11h5c.85 0 1.63-.3 2.25-.8a5.9 5.9 0 0 0 2.05-1.7ZM8.5 18h7a2.5 2.5 0 0 1 2.5 2.5v.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-.5A2.5 2.5 0 0 1 8.5 18Z" />
    </svg>
  );
}

function QwenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2Zm0 3.3 5.5 3.1-5.5 3.1-5.5-3.1L12 5.3Zm-6 5.8 5 2.8v5.6l-5-2.8v-5.6Zm7 8.4v-5.6l5-2.8v5.6l-5 2.8Z" />
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M16.97 4.24c-1.89 0-3.5 1.05-4.97 2.76-1.47-1.71-3.08-2.76-4.97-2.76C3.12 4.24 0 7.37 0 12.02c0 4.67 3.12 7.74 7.03 7.74 2.37 0 4.26-1.15 5.57-2.85 1.31 1.7 3.2 2.85 5.57 2.85 3.91 0 7.03-3.07 7.03-7.74 0-4.65-3.12-7.78-7.03-7.78h-.2Zm.16 12.92c-1.99 0-3.53-1.44-4.52-3.41-.33-.67-.6-1.41-.61-1.45l-.01-.01c-.01.04-.28.78-.61 1.45-.99 1.97-2.53 3.41-4.52 3.41-2.42 0-4.32-2.12-4.32-5.13 0-3.02 1.9-5.15 4.32-5.15 1.7 0 3.06 1.04 4.09 2.77l.02.04c.15.25.3.54.45.85.15-.31.3-.6.45-.85l.02-.04c1.03-1.73 2.39-2.77 4.09-2.77 2.42 0 4.32 2.13 4.32 5.15 0 3.01-1.9 5.13-4.32 5.13h-.02Z" />
    </svg>
  );
}

function KimiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M6 3h3v7.5l5.5-7.5H19l-6.5 8.5L19 21h-4.5L9 13.5V21H6V3Z" />
    </svg>
  );
}

function ManusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <path d="M12 7v5l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DeepSeekIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.12.74 4.07 1.97 5.61L3.5 21l3.65-1.35C8.61 20.37 10.24 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9Zm-1 13.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8Z" />
    </svg>
  );
}

function MistralIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M3 5h3v14H3V5zm5 4h3v10H8V9zm5-2h3v12h-3V7zm5 6h3v6h-3v-6z" />
    </svg>
  );
}

function VibeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true" fill="currentColor">
      <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9Zm7.5-4.5v9l7-4.5-7-4.5Z" />
    </svg>
  );
}

export function ConnectorIcon({
  connectorId,
  size = 'md',
  className,
  showBackground = true,
}: ConnectorIconProps) {
  const connector = getConnector(connectorId);
  const color = connector?.brandColor ?? '#8888A0';

  let IconComponent: React.ReactNode;

  switch (connectorId) {
    case 'chatgpt':
      IconComponent = <OpenAIIcon />;
      break;
    case 'claude':
      IconComponent = <SiAnthropic className="w-[60%] h-[60%]" />;
      break;
    case 'gemini':
      IconComponent = <SiGoogle className="w-[60%] h-[60%]" />;
      break;
    case 'grok':
      IconComponent = <GrokIcon />;
      break;
    case 'deepseek':
      IconComponent = <DeepSeekIcon />;
      break;
    case 'mistral':
      IconComponent = <MistralIcon />;
      break;
    case 'copilot':
      IconComponent = <CopilotIcon />;
      break;
    case 'qwen':
      IconComponent = <QwenIcon />;
      break;
    case 'meta':
      IconComponent = <MetaIcon />;
      break;
    case 'kimi':
      IconComponent = <KimiIcon />;
      break;
    case 'manus':
      IconComponent = <ManusIcon />;
      break;
    case 'vibe':
      IconComponent = <VibeIcon />;
      break;
    default:
      IconComponent = <span>✦</span>;
  }

  if (!showBackground) {
    return (
      <div
        className={cn('inline-flex items-center justify-center flex-shrink-0', SIZE_CLASSES[size], className)}
        style={{ color }}
        aria-label={connector?.name ?? connectorId}
      >
        {IconComponent}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center flex-shrink-0 transition-transform',
        SIZE_CLASSES[size],
        className
      )}
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}35`,
      }}
      aria-label={connector?.name ?? connectorId}
    >
      {IconComponent}
    </div>
  );
}
