import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F0E8",
        nude: "#E8D8C8",
        beige: "#D2BBA7",
        mocha: "#A9826D",
        cocoa: "#795B4B",
        cream: "#FFFDFC",
        textPrimary: "#3F3029",
        textSecondary: "#857366",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(63, 48, 41, 0.05), 0 2px 6px -1px rgba(63, 48, 41, 0.03)",
        card: "0 2px 10px rgba(121, 91, 75, 0.05)",
        elevated: "0 12px 32px -4px rgba(63, 48, 41, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
