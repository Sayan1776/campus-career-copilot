/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF9E6',
          100: '#FFF0B8',
          200: '#FFE58A',
          500: '#F5C542',
          600: '#C89012',
          700: '#9A6B00',
          800: '#14213D',
          900: '#10182B',
          DEFAULT: '#14213D',
          light: '#FBF7EE',
          accent: '#F5C542',
        },
        accent: {
          DEFAULT: '#F5C542',
          light: '#FFF4C7',
          dark: '#9A6B00',
        },
        sidebar: {
          bg: '#10182B',
          hover: '#192643',
          active: '#F5C542',
          text: '#C9D4E6',
          'text-active': '#111827',
          border: '#263452',
        },
      },
      boxShadow: {
        subtle: '0 10px 24px rgba(20, 33, 61, 0.08)',
        card: '0 18px 42px rgba(20, 33, 61, 0.10)',
        elevated: '0 28px 70px rgba(20, 33, 61, 0.16)',
        bento: '0 24px 60px rgba(20, 33, 61, 0.12)',
      },
      borderRadius: {
        bento: '0.875rem',
      },
      fontSize: {
        xxs: ['0.65rem', { lineHeight: '0.85rem' }],
      },
    },
  },
  plugins: [],
};