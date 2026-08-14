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
          50: '#F0F5FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#0F172A',
          DEFAULT: '#1E40AF',
          light: '#F8FAFC',
          accent: '#4F46E5',
        },
        accent: {
          DEFAULT: '#6366F1',
          light: '#EEF2FF',
          dark: '#4338CA',
        },
        sidebar: {
          bg: '#080B09',
          hover: '#121815',
          active: '#00D68F',
          text: '#94a3b8',
          'text-active': '#041a12',
          border: '#1e2923',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'bento': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.04), 0 12px 24px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'bento': '1rem',
      },
      fontSize: {
        'xxs': ['0.65rem', { lineHeight: '0.85rem' }],
      },
    },
  },
  plugins: [],
};
