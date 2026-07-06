import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta MagicFT (verde "cancha" + acento eléctrico)
        pitch: {
          950: "#0a1410",
          900: "#0d1a14",
          800: "#12241c",
          700: "#193026",
        },
        accent: {
          DEFAULT: "#22d3a6",
          soft: "#5eead4",
        },
        risk: {
          low: "#22c55e",
          mid: "#eab308",
          high: "#f97316",
          extreme: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};

export default config;
