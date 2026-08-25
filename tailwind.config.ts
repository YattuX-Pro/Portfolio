import type { Config } from "tailwindcss";

/* Deux systèmes de couleurs cohabitent :

   1. Les tokens du site — bg, surface, ink, ink-muted, line, brand, flag-*.
      Ils portent le portfolio public. `brand` s'appelait `accent` et
      `ink-muted` s'appelait `muted` : renommés parce que shadcn revendique
      `accent` et `muted` pour d'autres usages (fonds de survol et fond
      discret), et qu'une collision sur ces noms aurait fait dériver les
      couleurs du site public.

   2. Les tokens sémantiques de shadcn — background, foreground, primary,
      muted, accent, border… Définis dans globals.css, ils POINTENT sur les
      tokens du site. L'admin utilise donc les composants shadcn tels quels
      tout en restant dans la charte. */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Site ────────────────────────────────────────────────────── */
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--text)",
        "ink-muted": "var(--ink-muted)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          soft: "var(--brand-soft)",
        },
        flag: {
          red: "var(--flag-red)",
          yellow: "var(--flag-yellow)",
          green: "var(--flag-green)",
          ink: "var(--flag-green-ink)",
        },

        /* ── shadcn ──────────────────────────────────────────────────── */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--primary-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      /* Tailwind v3 donne au ring une couleur par défaut : blue-500 à 50 %.
         Tout `ring-*` sans couleur explicite affichait donc un liseré bleu,
         hors charte. On le ramène sur l'accent rouge. */
      ringColor: {
        DEFAULT: "var(--ring)",
      },
      ringOffsetColor: {
        DEFAULT: "var(--background)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "62ch",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.16, 1, 0.3, 1)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    /* Les composants shadcn utilisent @container, natif en Tailwind v4 mais
       fourni par un plugin en v3. Sans lui les classes @container/@lg sont
       simplement absentes du CSS. */
    require("@tailwindcss/container-queries"),
  ],
};
export default config;
