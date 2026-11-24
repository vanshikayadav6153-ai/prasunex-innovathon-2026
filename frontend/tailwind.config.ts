import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CAMPUS-NEXUS Light Theme: Mint + White + Yellow
        "bg-base": "#FFFFFF",
        "bg-panel": "#F0FAF5",
        border: "#CDEBDD",
        mint: {
          DEFAULT: "#34D399",
          deep: "#047857",
          deeper: "#065F46",
          50: "#F0FAF5",
          100: "#E6F7F0",
          200: "#CDEBDD",
          300: "#A7F3D0",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#0B2E22",
          accent: "#047857",
          glow: "transparent",
        },
        yellow: {
          DEFAULT: "#FACC15",
          hover: "#EAB308",
          tint: "#FEF9C3",
          text: "#713F12",
          50: "#FEFCE8",
          100: "#FEF9C3",
          200: "#FEF08A",
          300: "#FDE047",
          400: "#FACC15",
          500: "#EAB308",
          600: "#CA8A04",
          700: "#713F12",
        },
        "text-primary": "#0B2E22",
        "text-muted": "#4B6B5E",
        placeholder: "#7A968A",

        // Role accent colors
        role: {
          student: "#047857",
          faculty: "#1D4ED8",
          staff: "#BE185D",
          other: "#BE185D",
          admin: "#B91C1C",
        },

        // Backward compatibility mappings ensuring NO dark maroon/black styling anywhere
        burgundy: {
          950: "#FFFFFF",
          900: "#F0FAF5",
          850: "#F0FAF5",
          800: "#E6F7F0",
          750: "#CDEBDD",
          700: "#CDEBDD",
          600: "#34D399",
          500: "#047857",
          DEFAULT: "#F0FAF5",
        },
        darkEmerald: {
          950: "#FFFFFF",
          900: "#F0FAF5",
          850: "#F0FAF5",
          800: "#E6F7F0",
          700: "#CDEBDD",
          600: "#CDEBDD",
          DEFAULT: "#F0FAF5",
        },
        gold: {
          50: "#FEFCE8",
          100: "#FEF9C3",
          200: "#FEF08A",
          300: "#FDE047",
          400: "#FACC15",
          DEFAULT: "#FACC15",
          500: "#FACC15",
          600: "#EAB308",
          700: "#713F12",
          glow: "transparent",
          border: "#CDEBDD",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(11, 46, 34, 0.06)",
        card: "0 1px 2px rgba(11, 46, 34, 0.06)",
        glass: "0 1px 2px rgba(11, 46, 34, 0.06)",
        goldGlow: "none",
        mintGlow: "none",
        heroMockup: "0 4px 12px rgba(11, 46, 34, 0.08)",
        goldBorder: "0 0 0 1px #CDEBDD",
      },
      borderRadius: {
        panel: "12px",
        "2xl": "12px",
        "3xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
