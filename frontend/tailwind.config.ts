import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        heaven: {
          'bg-dark':  '#12121f',
          'bg-card':  '#1c1c30',
          'bg-light': '#f0eefa',
          'dark':     '#12121f',
          'gold':     '#d4a843',
          'lilac':    '#c9b8e8',
          'mint':     '#b8e8d4',
          'rose':     '#f0c4d4',
          'cream':    '#f5e6c8',
          'sky':      '#b8d4f0',
          'text':     '#f5f5f0',
          'muted':    '#9b99b0',
          'divider':  '#2e2e4a',
        },
      },
      boxShadow: {
        'heaven-cta':  '0 0 24px rgba(201,184,232,0.35)',
        'heaven-card': '0 4px 32px rgba(18,18,31,0.7)',
        'heaven-glow': '0 0 20px rgba(184,232,212,0.25)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
