/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.{js,ts,jsx,tsx}",
    "node_modules/react-daisyui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        128: "32rem",
        144: "36rem",
        160: "40rem",
        256: "64rem",
      },
      flexGrow: {
        1: "1",
        2: "2",
      },
    },
  },
  daisyui: {
    themes: ["dim"],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
