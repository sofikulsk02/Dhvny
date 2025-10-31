/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #9333ea)",
          hover: "var(--color-primary-hover, #7e22ce)",
          light: "var(--color-primary-light, #f3e8ff)",
        },
      },
      backgroundColor: {
        'base': 'rgb(255 255 255 / <alpha-value>)',
        'base-dark': 'rgb(17 24 39 / <alpha-value>)',
      },
      textColor: {
        'base': 'rgb(17 24 39 / <alpha-value>)',
        'base-dark': 'rgb(243 244 246 / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
