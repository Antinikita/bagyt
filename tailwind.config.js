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
        // Calmer teal — the "medical-grade" identity. Same family as
        // before but desaturated; brand-500 reads as trustworthy rather
        // than electric.
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Extended slate scale — cool dark surfaces in dark mode without
        // tinting toward teal. Pairs well with the brand teal as accent.
        deep: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        },
        // Warm accent for highlights distinct from the primary CTA —
        // partial-stream badges, "generate anamnesis" emphasis, etc.
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Foreground text on bright brand surfaces. Slightly cooler now
        // to match the deeper teal-700.
        onBrand: '#042f2e',
      },
      boxShadow: {
        // rgba(20, 184, 166) = brand-500 #14b8a6
        brand: '0 20px 60px -15px rgba(20, 184, 166, 0.30)',
        // rgba(13, 148, 136) = brand-600 #0d9488
        pill: '0 6px 14px -6px rgba(13, 148, 136, 0.50)',
        logo: '0 8px 20px -6px rgba(20, 184, 166, 0.40)',
      },
      backgroundImage: {
        // Wordmark keeps the cool blue→teal pivot but lands on the new
        // brand-600 instead of the old electric green-teal.
        'grad-wordmark': 'linear-gradient(90deg, #2da7e6, #0d9488)',
        'grad-pill': 'linear-gradient(135deg, #14b8a6, #0d9488)',
        'grad-guest': 'linear-gradient(135deg, #ffffff, #f1f5f9, #f0fdfa)',
        'grad-guest-dark': 'linear-gradient(135deg, #020617, #0f172a, #1e293b)',
        'grad-ai': 'linear-gradient(135deg, #f0fdfa, #ecfeff)',
        'grad-cta-deep': 'linear-gradient(135deg, #334155, #1e293b)',
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
