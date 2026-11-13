import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F3ED",
        nude: "#EFE4D6",
        beige: "#E3D6C8",
        mocha: "#7B5844",
        cocoa: "#2B1E17",
        cream: "#FFFEFD",
        textPrimary: "#2B1E17",
        textSecondary: "#675549",
        primaryCta: "#7B5844",
        accentSage: "#4F7A62",
        accentTerracotta: "#A26A4D",
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
