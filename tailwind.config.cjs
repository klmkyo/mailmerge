/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    screens: {
      'sm': {max: '1599px'},
      // => @media (min-width: 1599px) { ... }
    },

  },
  plugins: [],
};
