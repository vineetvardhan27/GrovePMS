import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand / Neutral Palette
        brand: {
          forest: "#1F3D3A",
          "forest-light": "#2E5A54",
          sand: "#F6F2EC",
          "sand-dark": "#EAE3D6",
        },
        ink: {
          DEFAULT: "#22221F",
          muted: "#5C5B54",
        },
        border: {
          subtle: "#DDD5C6",
        },
        // Status Colors (Functional - PRD & Design System)
        status: {
          green: "#2E7D4F", // Available, Fully Paid, Clean
          red: "#C4392B", // Occupied, No Payment
          amber: "#D68A2C", // Arriving Today, Advance Received
          blue: "#2B5C8A", // Reserved, Credit-Pay Later
          orange: "#D9662B", // Cleaning Required
          slate: "#4A4A47", // Maintenance, Blocked
        },
        // Semantic Action & Feedback Colors
        action: {
          primary: "#1F3D3A",
          danger: "#A6291D",
        },
        feedback: {
          success: "#2E7D4F",
          error: "#A6291D",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      fontSize: {
        display: ["2rem", { lineHeight: "2.5rem", fontWeight: "600" }], // 32px
        h1: ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }], // 24px
        h2: ["1.125rem", { lineHeight: "1.75rem", fontWeight: "600" }], // 18px
        body: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }], // 16px
        "body-lg": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "400" }], // 18px
        caption: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }], // 14px
        tiny: ["0.75rem", { lineHeight: "1rem", fontWeight: "500" }], // 12px
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
