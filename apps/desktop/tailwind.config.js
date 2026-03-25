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
          bg: 'var(--mc-bg)',
          surface: 'var(--mc-surface)',
          border: 'var(--mc-border)',
          text: 'var(--mc-text)',
          muted: 'var(--mc-muted)',
          accent: 'var(--mc-accent)',
          warning: 'var(--mc-warning)',
          destructive: 'var(--mc-destructive)',
        },
      },
      fontFamily: {
        sans: ['"Outfit"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
