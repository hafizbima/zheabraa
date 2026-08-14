/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#dceeff',
          100: '#c3e2ff',
          200: '#9ecdfd',
          300: '#6fb5ff',
          400: '#4da2ff',
          500: '#2f8bf5',
          600: '#1f6fe0',
          700: '#1d58b0',
          800: '#1e4688',
          900: '#1c3a66',
        },
        carbon: '#000000',
        paper: '#ffffff',
        sky: '#dceeff',
        mist: '#e9e9e9',
        concrete: '#cccccc',
        mint: '#55db9c',
        lavender: '#e9ccff',
        ember: '#ff5c8a',
        sunburst: '#c9d9ff',
        violet: '#7c6cf0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Bowlby One"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        carbon: '4px 4px 0 0 #000000',
        'carbon-sm': '2px 2px 0 0 #000000',
      },
    },
  },
  plugins: [],
}