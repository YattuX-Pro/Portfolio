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


/* Tailwind v3 ne sait pas appliquer un modificateur d'opacité (`bg-x/10`) à
   une couleur déclarée comme simple `var(--x)` : il lui faut soit un
   `<alpha-value>`, soit une fonction. Sans cela les classes ne sont pas
   générées DU TOUT — silencieusement. C'est ce qui faisait disparaître le
   voile sombre du bandeau tricolore, le fond des entrées actives et tous les
   textes atténués.

   Cette fabrique renvoie la variable telle quelle sans opacité, et un
   color-mix quand une opacité est demandée. */
const v = (name: string) =>
  /* Le type des couleurs de Tailwind v3 n'inclut pas les fonctions dans ses
     déclarations, alors que le runtime les accepte : d'où la conversion. */
  ((({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined
      ? `var(${name})`
      : `color-mix(in oklab, var(${name}) ${Number(opacityValue) * 100}%, transparent)`) as unknown) as string;

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
        bg: v("--bg"),
        surface: v("--surface"),
        ink: v("--text"),
        "ink-muted": v("--ink-muted"),
        line: v("--line"),
        "line-strong": v("--line-strong"),
        brand: {
          DEFAULT: v("--brand"),
          hover: v("--brand-hover"),
          soft: v("--brand-soft"),
        },
        flag: {
          red: v("--flag-red"),
          yellow: v("--flag-yellow"),
          green: v("--flag-green"),
          ink: v("--flag-green-ink"),
        },

        /* ── shadcn ──────────────────────────────────────────────────── */
        background: v("--background"),
        foreground: v("--foreground"),
        card: {
          DEFAULT: v("--card"),
          foreground: v("--card-foreground"),
        },
        popover: {
          DEFAULT: v("--popover"),
          foreground: v("--popover-foreground"),
        },
        primary: {
          DEFAULT: v("--primary"),
          foreground: v("--primary-foreground"),
        },
        secondary: {
          DEFAULT: v("--secondary"),
          foreground: v("--secondary-foreground"),
        },
        muted: {
          DEFAULT: v("--muted"),
          foreground: v("--muted-foreground"),
        },
        accent: {
          DEFAULT: v("--accent"),
          foreground: v("--accent-foreground"),
        },
        destructive: {
          DEFAULT: v("--destructive"),
          foreground: v("--primary-foreground"),
        },
        border: v("--border"),
        input: v("--input"),
        ring: v("--ring"),
        chart: {
          "1": v("--chart-1"),
          "2": v("--chart-2"),
          "3": v("--chart-3"),
          "4": v("--chart-4"),
          "5": v("--chart-5"),
        },
        sidebar: {
          DEFAULT: v("--sidebar"),
          foreground: v("--sidebar-foreground"),
          primary: v("--sidebar-primary"),
          "primary-foreground": v("--sidebar-primary-foreground"),
          accent: v("--sidebar-accent"),
          "accent-foreground": v("--sidebar-accent-foreground"),
          border: v("--sidebar-border"),
          ring: v("--sidebar-ring"),
        },
      },
      /* Tailwind v3 donne au ring une couleur par défaut : blue-500 à 50 %.
         Tout `ring-*` sans couleur explicite affichait donc un liseré bleu,
         hors charte. On le ramène sur l'accent rouge. */
      ringColor: {
        DEFAULT: v("--ring"),
      },
      ringOffsetColor: {
        DEFAULT: v("--background"),
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
          to: { height: v("--radix-accordion-content-height") },
        },
        "accordion-up": {
          from: { height: v("--radix-accordion-content-height") },
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
