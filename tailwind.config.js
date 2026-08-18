/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fcf8f6',
          100: '#f8f0ed',
          200: '#f0dfd9',
          300: '#e3c5b9',
          400: '#d2a493',
          500: '#bc7d66',
          600: '#a7624c',
          700: '#8e4d31',
          800: '#76402b',
          900: '#623828',
        },
        sage: {
          50: '#f5f6f4',
          100: '#e8ebe5',
          200: '#d1d6cb',
          300: '#b1bba9',
          400: '#8f9a84',
          500: '#717c66',
          600: '#585e4c',
          700: '#464a3d',
          800: '#3a3d33',
          900: '#32342c',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serifTitle: ['Cormorant Garamond', 'serif'],
        'serif-title': ['Cormorant Garamond', 'serif'],
      }
    },
  },
  plugins: [],
}

