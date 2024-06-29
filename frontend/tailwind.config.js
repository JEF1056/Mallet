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
      },
    },
  },
  daisyui: {
    themes: ["dim"],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
