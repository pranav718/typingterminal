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
        'matrix-primary': '#41ff5f',
        'matrix-light': '#7bff9a',
        'matrix-bg': '#00120b',
        'matrix-bg-darker': '#000a06',
        'error': '#ff5555',
        'warning': '#ff9f40',
      },
      fontFamily: {
        // ✅ NEW: Multiple font options
        'jetbrains': ['"JetBrains Mono"', 'monospace'],
        'geist': ['"Geist Mono"', 'monospace'],
        'fira': ['"Fira Code"', 'monospace'],
      },
      dropShadow: {
        'glow-sm': '0 0 8px rgba(65, 255, 95, 0.2)',
        'glow': '0 0 8px rgba(65, 255, 95, 0.3)',
        'glow-md': '0 0 16px rgba(65, 255, 95, 0.3)',
        'glow-lg': '0 0 20px rgba(65, 255, 95, 0.4)',
        'glow-xl': '0 0 24px rgba(65, 255, 95, 0.5)',
        'error-glow': '0 0 8px rgba(255, 85, 85, 0.4)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(65, 255, 95, 0.3)',
        'glow-sm': '0 0 16px rgba(65, 255, 95, 0.2)',
        'glow-md': '0 4px 20px rgba(65, 255, 95, 0.3)',
        'glow-lg': '0 8px 24px rgba(65, 255, 95, 0.2)',
        'glow-hover': '0 6px 24px rgba(65, 255, 95, 0.5)',
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