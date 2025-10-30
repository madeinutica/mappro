/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.js",
    "./App.jsx",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2C8BC7', // Map Blue
        },
        secondary: {
          DEFAULT: '#2FB4A5', // Home Teal
        },
        neutral: {
          dark: '#333333', // Graphite Gray
          light: '#F8F8F8', // Cloud White
          cream: '#FFFFFF', // Pure White (changed from off-white)
        },
        accent: {
          DEFAULT: '#BFD4E0', // Blueprint Gray
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        lato: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};