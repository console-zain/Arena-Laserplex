import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cinema: {
          red: "rgb(var(--v3-accent-primary-rgb) / <alpha-value>)",
          gold: "rgb(var(--v3-accent-gold-rgb) / <alpha-value>)",
          ivory: "rgb(var(--v3-canvas-rgb) / <alpha-value>)",
          black: "rgb(var(--v3-canvas-rgb) / <alpha-value>)",
        },
        slate: {
          50: "rgb(var(--v3-slate-50) / <alpha-value>)",
          100: "rgb(var(--v3-slate-100) / <alpha-value>)",
          200: "rgb(var(--v3-slate-200) / <alpha-value>)",
          300: "rgb(var(--v3-slate-300) / <alpha-value>)",
          400: "rgb(var(--v3-slate-400) / <alpha-value>)",
          500: "rgb(var(--v3-slate-500) / <alpha-value>)",
          600: "rgb(var(--v3-slate-600) / <alpha-value>)",
          700: "rgb(var(--v3-slate-700) / <alpha-value>)",
          800: "rgb(var(--v3-slate-800) / <alpha-value>)",
          900: "rgb(var(--v3-slate-900) / <alpha-value>)",
          950: "rgb(var(--v3-slate-950) / <alpha-value>)",
        },
        indigo: {
          50: "rgb(var(--v3-accent-primary-rgb) / 0.08)",
          100: "rgb(var(--v3-accent-primary-rgb) / 0.14)",
          200: "rgb(var(--v3-accent-primary-rgb) / 0.3)",
          300: "rgb(var(--v3-accent-primary-rgb) / 0.8)",
          400: "rgb(var(--v3-accent-primary-rgb) / 0.9)",
          500: "rgb(var(--v3-accent-primary-rgb) / <alpha-value>)",
          600: "rgb(var(--v3-accent-primary-rgb) / <alpha-value>)",
          700: "rgb(var(--v3-accent-primary-rgb) / <alpha-value>)",
          800: "rgb(var(--v3-accent-primary-rgb) / 0.7)",
          900: "rgb(var(--v3-accent-primary-rgb) / 0.5)",
          950: "rgb(var(--v3-accent-primary-rgb) / 0.25)",
        },
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
