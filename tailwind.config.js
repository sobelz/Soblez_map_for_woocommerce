/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        white:"#ffffff",
        black:"#000000",
        darkBlue:"#202380",
        blue:"#201DC3",
        yellow:"#FFB300",
        green:"#00E099",
        primary:"#F2F4F3",
        secondary:"#737373",
        
      }
    },
  },
  plugins: [],
}

