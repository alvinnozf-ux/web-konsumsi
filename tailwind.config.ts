import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e3a8a",
          900: "#1e3a8a",
        },
        navy: {
          600: "#1e3a5f",
          700: "#162d4a",
          800: "#0f2035",
          900: "#0a1628",
        },
        success: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
      },
    },
  },
  // Safelist arbitrary opacity classes used in Sidebar & components
  safelist: [
    "bg-white/[0.08]",
    "bg-white/[0.05]",
    "border-white/[0.08]",
    "text-navy-700",
    "bg-navy-700",
    "bg-navy-800",
    "bg-navy-900",
  ],
  plugins: [],
};

export default config;
