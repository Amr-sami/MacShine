/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './renderer/index.html',
    './renderer/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mc: {
          bg: '#0d0f0e',
          surface: '#161a18',
          border: '#2a2e2b',
          accent: '#4ade80',
          'accent-dim': '#22c55e',
          warning: '#f59e0b',
          destructive: '#f87171',
          text: '#e2e8e0',
          muted: '#6b7a6e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
