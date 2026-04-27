import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#faf8f5",
          ink: "#1a1a1a",
          muted: "#6b6b6b",
          line: "#e8e1d6",
          accent: "#8b7355",
          soft: "#ede7dd",
          cream: "#f4efe7",
          orange: "#E8601C",
          "orange-dark": "#C54F13"
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["clamp(2.75rem,6vw,5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2rem,4.5vw,4rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.5rem,3vw,2.5rem)", { lineHeight: "1.2" }]
      },
      maxWidth: { prose: "65ch", container: "1440px" },
      spacing: {
        "section": "clamp(4rem,10vw,9rem)",
        "section-sm": "clamp(3rem,6vw,6rem)"
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: []
};
export default config;
