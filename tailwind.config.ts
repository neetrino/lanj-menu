import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#faaa77',
          header: '#d9824f',
        },
      },
    },
  },
  plugins: [],
};

export default config;
