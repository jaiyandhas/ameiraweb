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
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          900: '#001a40',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          800: '#27272a',
          900: '#18181b',
        }
      },
      fontSize: {
        'xs': ['13px', '18px'],
        'sm': ['15px', '22px'],
        'base': ['17px', '26px'], // Large, highly readable baseline font for non-technical users
        'lg': ['20px', '28px'],
        'xl': ['24px', '32px'],
        '2xl': ['30px', '38px'],
        '3xl': ['38px', '46px'],
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
      }
    },
  },
  plugins: [],
}
