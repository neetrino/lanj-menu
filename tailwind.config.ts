import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#faaa77',
          header: '#d9824f',
          accent: '#c4673a',
          price: '#e8a987',
          border: '#ffa97f',
        },
        surface: {
          page: '#ffffff',
          cream: '#fff8f3',
          card: '#e8d5c4',
        },
        text: {
          primary: '#1a0c06',
          muted: '#8b6555',
          'on-dark-muted': 'rgba(255, 248, 243, 0.65)',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
