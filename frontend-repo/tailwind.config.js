/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.10)",
        glow: "0 18px 45px rgba(20, 184, 166, 0.18)",
      },
    },
  },
  plugins: [],
};
