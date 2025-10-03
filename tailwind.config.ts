import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'matrix-primary': '#00ff88',
        'matrix-dark': '#00cc66',
        'matrix-light': '#7ce38b',
        'matrix-bg': '#0a0f0a',
        'matrix-bg-darker': '#050805',
        'paper-primary': '#2c3e50',
        'paper-dark': '#1a252f',
        'paper-light': '#546e7a',
        'paper-bg': '#f5f5f5',
        'paper-bg-darker': '#ffffff',
        'ocean-primary': '#00d9ff',
        'ocean-dark': '#00b8d4',
        'ocean-light': '#4dd0e1',
        'ocean-bg': '#0a1929',
        'ocean-bg-darker': '#001e3c',
        'sunset-primary': '#ff9f40',
        'sunset-dark': '#ff6f00',
        'sunset-light': '#ffb74d',
        'sunset-bg': '#1a0a2e',
        'sunset-bg-darker': '#0f0520',
        'error': '#ff5555',
        'warning': '#ff9f40',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'shake-subtle': 'shake-subtle 0.3s ease-in-out',
        'shake-medium': 'shake-medium 0.4s ease-in-out',
        'shake-strong': 'shake-strong 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'blink': 'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        'shake-subtle': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-1px)' },
          '75%': { transform: 'translateX(1px)' },
        },
        'shake-medium': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'shake-strong': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 16px rgba(0, 255, 136, 0.5)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 24px rgba(0, 255, 136, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;