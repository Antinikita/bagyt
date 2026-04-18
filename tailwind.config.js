/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#ebfffb',
          100: '#d2fff5',
          200: '#a6fbeb',
          300: '#74f3df',
          400: '#4ce6d0',
          500: '#0deacf',
          600: '#0abba5',
          700: '#0c9587',
          800: '#117468',
          900: '#135f55',
          950: '#053a35',
        },
        deep: {
          500: '#255c60',
          600: '#1e465b',
          700: '#103648',
          800: '#0a2a38',
          900: '#061b25',
        },
        onBrand: '#052e2a',
      },
      boxShadow: {
        brand: '0 20px 60px -15px rgba(13, 234, 207, 0.35)',
        pill: '0 6px 14px -6px rgba(10, 187, 165, 0.55)',
        logo: '0 8px 20px -6px rgba(13, 234, 207, 0.45)',
      },
      backgroundImage: {
        'grad-wordmark': 'linear-gradient(90deg, #2da7e6, #0abba5)',
        'grad-pill': 'linear-gradient(135deg, #0deacf, #0abba5)',
        'grad-guest': 'linear-gradient(135deg, #ffffff, #e3eef1, #ebfffb)',
        'grad-guest-dark': 'linear-gradient(135deg, #061b25, #0a2a38, #103648)',
        'grad-ai': 'linear-gradient(135deg, #ebfffb, #effaf8)',
        'grad-cta-deep': 'linear-gradient(135deg, #1e465b, #103648)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-6px)' },
          '30%': { transform: 'translateX(6px)' },
          '45%': { transform: 'translateX(-4px)' },
          '60%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-2px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        shake: 'shake 400ms ease-in-out',
        'slide-up': 'slide-up 250ms ease-out both',
      },
    },
  },
  plugins: [],
};
