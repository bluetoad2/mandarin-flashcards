import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        hanzi: ["var(--font-hanzi)", "var(--font-serif)", "serif"],
      },
      colors: {
        // Warm paper and ink — the base of the whole interface.
        paper: {
          DEFAULT: "#F4F0E6",
          card: "#FDFBF6",
          bright: "#FFFFFF",
        },
        ink: {
          50: "#F4F0E6",
          100: "#EDE8DC",
          200: "#DED7C7",
          300: "#B0A996",
          400: "#8C8677",
          500: "#6B665A",
          600: "#4A463D",
          700: "#33302A",
          800: "#1F1D18",
          900: "#141310",
        },
        // Cinnabar seal red — the single accent.
        cinnabar: {
          50: "#FBF1EE",
          100: "#F5E2DD",
          200: "#E8C3BA",
          400: "#D9695A",
          500: "#C8402F",
          600: "#A83A2A",
          700: "#8C3A2B",
        },
        // Jade — reserved for mastery and correct answers.
        jade: {
          50: "#EFF6F2",
          100: "#DDEBE3",
          500: "#3F8A65",
          600: "#337052",
          700: "#2A5C45",
        },
      },
      borderRadius: {
        // Crisp, editorial corners rather than pillowy ones.
        DEFAULT: "2px",
        sm: "2px",
        md: "3px",
        lg: "4px",
        xl: "4px",
        "2xl": "6px",
        "3xl": "6px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
