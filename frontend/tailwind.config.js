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
        themeOrangeDarker:"#FF7700",
        themeCyan:"#2196f3",
        themeGrey:"#bebbb4",
        uiYellow:"#FFEFBA",
        uiOrange:"#fb9480"
      }
    },
  },
  plugins: [],
}