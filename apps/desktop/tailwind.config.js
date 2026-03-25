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
          'mc-bg': 'var(--mc-bg)',
          'mc-surface': 'var(--mc-surface)',
          'mc-border': 'var(--mc-border)',
          'mc-text': 'var(--mc-text)',
          'mc-muted': 'var(--mc-muted)',
          'mc-accent': 'var(--mc-accent)',
          'mc-warning': 'var(--mc-warning)',
          'mc-destructive': 'var(--mc-destructive)',
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
