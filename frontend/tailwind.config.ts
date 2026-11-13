import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F8FAFC",
        muted: "#94A3B8",
        paper: "#0B1120",
        surface: "#131D33",
        forest: "#0F172A",
        brand: "#4F46E5",
        cobalt: "#3B82F6",
        indigo: "#6366F1",
        amber: "#F59E0B",
        gold: "#FBBF24",
        emerald: "#10B981",
        rose: "#F43F5E",
        lime: "#6366F1",
        line: "rgba(148, 163, 184, 0.14)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 14px 40px -10px rgba(0,0,0,0.45)",
        glow: "0 0 25px rgba(99, 102, 241, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(148, 163, 184, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
