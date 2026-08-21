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
        bg:          "var(--bg)",
        surface:     "var(--surface)",
        ink:         "var(--text)",
        muted:       "var(--muted)",
        line:        "var(--line)",
        "line-strong": "var(--line-strong)",
        accent:      "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-soft":  "var(--accent-soft)",
        flag: {
          red:    "var(--flag-red)",
          yellow: "var(--flag-yellow)",
          green:  "var(--flag-green)",
          ink:    "var(--flag-green-ink)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "62ch",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
