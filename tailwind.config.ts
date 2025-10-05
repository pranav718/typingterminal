import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'matrix-primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'matrix-light': 'rgb(var(--color-light) / <alpha-value>)',
        'matrix-bg': 'rgb(var(--color-bg) / <alpha-value>)',
        'matrix-bg-darker': 'rgb(var(--color-bg-darker) / <alpha-value>)',
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
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;