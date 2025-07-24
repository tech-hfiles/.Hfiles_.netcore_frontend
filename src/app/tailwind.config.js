// tailwind.config.js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        montserrat: ["var(--font-montserrat)"],
        redhat: ["var(--font-red-hat)"],
        geist: ["var(--font-geist-sans)"],
        geistMono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};
