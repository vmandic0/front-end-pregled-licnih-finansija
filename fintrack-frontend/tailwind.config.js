/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zlato: {
          50: '#fdf8ee',
          100: '#f9edcc',
          200: '#f2d98a',
          300: '#ebc455',
          400: '#c9a84c',
          500: '#b8962e',
          600: '#9a7a22',
          700: '#7a5f1a',
          800: '#5e4814',
          900: '#3d2f0c',
        }
      }
    },
  },
  plugins: [],
}