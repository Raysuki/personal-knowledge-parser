import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(222 84% 5%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222 84% 5%)",
        muted: "hsl(220 14% 96%)",
        "muted-foreground": "hsl(215 16% 47%)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
