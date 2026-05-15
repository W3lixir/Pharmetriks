import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // LYNA palette — mirrors the HTML app's CSS variables.
        ink:        '#00003D',
        'ink-2':    '#0600AB',
        accent:     '#0033FF',
        'accent-soft':   '#977DFF',
        'accent-soft-2': '#b8a4ff',
        pink:       '#FFCCF2',
        'pink-soft':'#F2E6EE',
      },
      borderRadius: {
        glass: '18px',
      },
      boxShadow: {
        glass: '0 8px 28px rgba(6,0,171,0.12)',
        'glass-lg': '0 24px 60px rgba(0,0,61,0.22)',
      },
      backgroundImage: {
        'lyna-page':
          'radial-gradient(1100px 700px at -10% -10%, #FFCCF2 0%, transparent 55%), ' +
          'radial-gradient(900px 600px at 110% 10%, #977DFF 0%, transparent 60%), ' +
          'radial-gradient(1200px 800px at 50% 120%, #0033FF 0%, transparent 60%), ' +
          'linear-gradient(180deg, #F2E6EE 0%, #efe7ff 60%, #e3ddff 100%)',
        'lyna-cta':
          'linear-gradient(135deg, #0033FF 0%, #977DFF 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
