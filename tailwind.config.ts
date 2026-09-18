import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#0B0F19', // Background: Deep space slate
          900: '#111827', // Surface / Card
          800: '#1F2937', // Border
          700: '#374151',
        },
        purple: {
          500: '#A855F7', // Primary Accent: Electric Purple
          600: '#9333EA',
          400: '#C084FC',
        },
        pink: {
          400: '#F472B6', // Secondary / Warning: Neon Pink
          500: '#EC4899',
        },
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(168, 85, 247, 0.25)',
        'pink-glow': '0 0 25px -5px rgba(244, 114, 182, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
