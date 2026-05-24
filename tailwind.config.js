/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Hind Siliguri', 'sans-serif'],
      },
      colors: {
        primary: '#0F172A',
        accent: '#3B82F6',
        success: '#10B981',
      },
    },
  },
  plugins: [],
};
