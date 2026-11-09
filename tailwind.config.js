/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
      },
      colors: {
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        tactile: '0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'tactile-sm': '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        'tactile-lg': '0 16px 32px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'tactile-modal': '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      transitionDuration: {
        120: '120ms',
        160: '160ms',
        200: '200ms',
        260: '260ms',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        'draw-check': {
          from: { strokeDashoffset: '24' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 260ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-out': 'fade-out 160ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        shake: 'shake 240ms cubic-bezier(0.23, 1, 0.32, 1)',
        'draw-check': 'draw-check 300ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
    },
  },
  plugins: [],
}
