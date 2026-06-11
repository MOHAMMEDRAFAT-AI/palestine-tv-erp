import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1a5632",
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4caf50",
          600: "#1a5632",
          700: "#0f3d22",
          800: "#0a2e19",
          900: "#051f11",
        },
        secondary: {
          DEFAULT: "#c8a445",
          50: "#fdf8e8",
          100: "#f9edc5",
          200: "#f0d98a",
          300: "#e6c54f",
          400: "#dbb95e",
          500: "#c8a445",
          600: "#a8832e",
          700: "#88621f",
          800: "#684118",
          900: "#483010",
        },
      },
    },
  },
  plugins: [],
};

export default config;
