import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          50: '#fbf3f4',
          100: '#f4e1e4',
          300: '#d99aa6',
          500: '#9c3a4f',
          600: '#82283c',
          700: '#6b1f30',
          800: '#4f1724',
          900: '#2c0f16',
        },
        gold: {
          200: '#efdcb2',
          300: '#e2c487',
          400: '#d2a95f',
          500: '#b98b3e',
        },
        cream: '#fbf7f1',
        ink: '#211b19',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 40px -24px rgba(44, 15, 22, 0.35)',
        phone: '0 40px 80px -30px rgba(44, 15, 22, 0.55)',
      },
    },
  },
  plugins: [],
} satisfies Config;
