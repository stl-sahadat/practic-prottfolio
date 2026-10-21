/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sketch: ['"Gloria Hallelujah"', 'cursive'],
        hand: ['Caveat', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        paper: {
          50: '#fdfbf7',
          100: '#faf8f2',
          200: '#f4ede1',
          800: '#2b2a27',
          900: '#1c1b19',
        },
        ink: {
          DEFAULT: '#1c1c1c',
          light: '#3a3a3a',
          faint: '#777777'
        }
      }
    },
  },
  plugins: [],
}
