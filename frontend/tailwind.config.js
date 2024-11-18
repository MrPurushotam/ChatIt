/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        themeOrange:"#ee6145",
        themeCyan:"#2196f3",
        themeGrey:"#bebbb4",
      }
    },
  },
  plugins: [],
}