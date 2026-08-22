/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Instrument Sheet world — engineering workbook tokens.
        sheet: {
          DEFAULT: '#FAFBFC', // graph-paper ground
          raise: '#FFFFFF', // cards / instruments placed on the sheet
          inset: '#F0F4F8', // sunken wells, table heads
        },
        ink: {
          DEFAULT: '#16233B', // primary text, primary controls
          deep: '#101A2E', // sidebar spine, dark panels
          soft: '#3D4D68', // secondary text
          faint: '#5B6B84', // muted labels (4.5:1 on sheet)
          line: '#D7E0EC', // hairline grid on white
          lineStrong: '#C3D0E0',
          edge: '#26334D', // dark-surface hairline
        },
        instrument: {
          DEFAULT: '#E8501A', // the measurement red — accents, marks, key CTAs
          deep: '#BC3E0E', // red for small text (contrast-safe)
          wash: '#FBEDE5', // red-tinted fills
        },
        pass: {
          DEFAULT: '#1E7A55',
          deep: '#155C3F',
          wash: '#E7F3ED',
        },
        warn: {
          DEFAULT: '#96660F',
          wash: '#F9F0DA',
        },
        info: {
          DEFAULT: '#2E6E8E',
          wash: '#E9F2F7',
        },
        sidebar: {
          bg: '#101A2E',
          hover: '#1B2A45',
          text: '#AEBDD3',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        hairline: '0 1px 2px rgba(22, 35, 59, 0.08)',
        raise: '0 1px 2px rgba(22, 35, 59, 0.05), 0 6px 20px rgba(22, 35, 59, 0.07)',
        lift: '0 2px 4px rgba(22, 35, 59, 0.06), 0 14px 36px rgba(22, 35, 59, 0.12)',
        pop: '0 4px 8px rgba(22, 35, 59, 0.08), 0 24px 64px rgba(22, 35, 59, 0.18)',
      },
      fontSize: {
        xxs: ['0.6875rem', { lineHeight: '1rem' }], // 11px floor — nothing smaller ships
      },
    },
  },
  plugins: [],
};
