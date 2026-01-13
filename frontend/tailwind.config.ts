import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Custom color scheme from Gemini recommendations
        background: {
          DEFAULT: "#0A0D18",
          secondary: "#151A2C",
        },
        foreground: "#E0E6F0",
        primary: {
          DEFAULT: "#BD93F9",
          foreground: "#0A0D18",
        },
        secondary: {
          DEFAULT: "#151A2C",
          foreground: "#E0E6F0",
        },
        accent: {
          bullish: "#50FA7B",
          bearish: "#FF5555",
          volume: "#8BE9FD",
          smart: "#BD93F9",
          highlight: "#FFCB6B",
        },
        muted: {
          DEFAULT: "#1E2336",
          foreground: "#8B92A5",
        },
        card: {
          DEFAULT: "#151A2C",
          foreground: "#E0E6F0",
        },
        border: "#2A2F45",
        input: "#1E2336",
        ring: "#BD93F9",
        destructive: {
          DEFAULT: "#FF5555",
          foreground: "#E0E6F0",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(189, 147, 249, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(189, 147, 249, 0.6)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(100px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(100px) rotate(-360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite",
        orbit: "orbit 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
