import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090b10",
        surface: "#10141c",
        panel: "#151a24",
        border: "#252c3a",
        muted: "#8b95a7",
        primary: "#7c6cf2",
        cyan: "#54d2d2",
        success: "#43c59e",
        warning: "#f3b85b",
        danger: "#f06b7a",
      },
      boxShadow: {
        glow: "0 0 32px rgba(124, 108, 242, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
