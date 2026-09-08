import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0A0A0F',
          surface:  '#111118',
          elevated: '#1A1A24',
          hover:    '#22223A',
        },
        border: {
          subtle:  '#1E1E2E',
          default: '#2A2A3A',
          strong:  '#3A3A50',
        },
        text: {
          primary:   '#F0F0F5',
          secondary: '#8888A0',
          muted:     '#44445A',
        },
        accent: {
          DEFAULT: '#6C63FF',
          hover:   '#7B73FF',
          glow:    'rgba(108,99,255,0.15)',
          subtle:  'rgba(108,99,255,0.08)',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error:   '#EF4444',
          info:    '#3B82F6',
        },
        provider: {
          openai:    '#10A37F',
          anthropic: '#CC785C',
          google:    '#4285F4',
          grok:      '#1DA1F2',
          mock:      '#8888A0',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
        'badge': '6px',
        'btn': '8px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.25s ease-out forwards',
        'pulse-dot':     'pulse-dot 1.4s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'scale-in':      'scale-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
