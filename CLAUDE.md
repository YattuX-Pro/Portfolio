# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # dev server (falls back off :3000 if taken — read the port it prints)
npm run build     # production build; runs tsc, does NOT run ESLint
npm run start     # serve the production build
npm run lint      # eslint . — must be run manually, the build does NOT run it
npx tsc --noEmit  # typecheck alone
```

Next 16 removed `next lint`, so `lint` calls `eslint .` directly against the flat config in `eslint.config.mjs` (ESLint 9). Next 16 also dropped support for the `eslint` key in `next.config.mjs` — don't re-add `ignoreDuringBuilds` there, it is silently ignored and logs a warning. ESLint never runs as part of `npm run build`, so run it explicitly before considering work done. `src/` is currently lint-clean; keep it that way. There is no test suite.

## What this is

Single-page personal portfolio (Next.js 16 App Router, React 19, TypeScript strict, Tailwind 3, Framer Motion 12). All user-facing copy is in **French**; `<html lang="fr">`. Deployed at yattara.dev.

The site was rebuilt from a dark, 3D-heavy design into a **light editorial** one. Only five runtime dependencies remain: `next`, `react`, `react-dom`, `framer-motion`, `react-icons`. If you find yourself reaching for `three`, `@react-three/*`, or a UI kit, that contradicts the design direction — ask first.

## Architecture

One route. `src/app/page.tsx` renders `PortfolioApp`, a `"use client"` component that composes every section and owns the layout container:

```
layout.tsx  → fonts + globals.css, no visual chrome
page.tsx    → PortfolioApp
              ├─ NavBar        (fixed, z-50, own scroll-spy)
              └─ main
                 ├─ section id="home"     → Hero → HeroContent
                 ├─ FlagRule              (tricolor divider)
                 ├─ section id="skills"   → Skills
                 ├─ FlagRule
                 ├─ section id="projects" → Projects
                 ├─ FlagRule
                 └─ section id="footer"   → Footer
```

Navigation is `document.getElementById(id).scrollIntoView()` against those section ids — there is no router. Adding or renaming a section means updating both `PortfolioApp`'s JSX **and** `NAV_LINKS` in `src/components/main/NavBar.tsx`, which derives its scroll-spy `SECTION_IDS` from that array.

## The three systems to respect

Most of the design lives in three shared primitives. Changes that bypass them are what will make this site drift back toward the generic.

### 1. Color — tokens in `globals.css`, one accent

Every color is a CSS variable on `:root`, surfaced to Tailwind in `tailwind.config.ts` as `bg-bg`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, `bg-flag-*`. Never hardcode a hex in a component.

The palette is a warm off-white neutral plus **one** interactive accent (`--accent`, the Guinean flag red `#CE1126`). The accent covers buttons, links, hovers and focus rings — nothing else. Resist adding a second interactive color.

**Contrast is load-bearing here, not decorative.** The flag's yellow (`#FCD116`) measures **1.41:1** on the cream background and the official green (`#009460`) measures **3.72:1**. Consequences, already enforced in the code:

- Yellow appears **only** inside `FlagRule`, which is `aria-hidden` and conveys nothing. It must never carry text, an icon, or an informative graphic.
- Green passes the 3:1 bar for graphics (the skill bars) but **fails** the 4.5:1 bar for text. `--flag-green-ink` (`#00713F`, 5.85:1) exists for green text.
- `--muted` was deliberately darkened to `#55524C` (7.45:1) after the first pass read as too faint. Don't lighten it back.

If a request would put yellow on text, say so rather than shipping it.

### 2. Motion — one spec, in `Reveal.tsx`

`src/components/Reveal.tsx` is the single animation vocabulary: fade + `translateY(16px)`, 550 ms, ease `[0.16, 1, 0.3, 1]`, `once: true`, 60 ms stagger between siblings. It exports `Reveal` (a wrapper), plus `revealGroup`/`revealItem` variants for staggered children and the shared `EASE`/`DURATION` constants.

Use it. Do not introduce parallax, tilt-on-hover, scale transforms, scroll-driven cameras, or a second easing curve — that vocabulary is exactly what the redesign removed. `prefers-reduced-motion` is honored globally in `globals.css`.

### 3. Typography — one family, three roles

Two fonts load via `next/font/google` in `layout.tsx` (self-hosted, no external requests, no CLS): **IBM Plex Sans** and **IBM Plex Mono**. Hierarchy comes from weight and tracking, not from switching families:

| Role | Treatment | Tailwind |
|---|---|---|
| Title | Plex Sans 600, tracking `-0.03em`/`-0.035em` | `font-display font-semibold` |
| Body | Plex Sans 400, 18px, leading 1.7 | `font-sans` |
| Meta | Plex Mono, uppercase, tracking `0.14em`, 11px | `.meta` (component class) |

The mono is the site's only "tech" signal — section numbers, stack tags, labels. Keeping it rare is what makes it work. `--font-display` is a separate token that currently points at Plex Sans; it exists so a display face can be reintroduced in one line without touching components.

An earlier pass used Instrument Serif for titles and was rejected as too faint — it ships in a **single weight (400)**, with no bold available. Check the weight range in `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` before proposing any font.

## Shared components

- `Reveal.tsx` — the animation spec (above).
- `FlagRule.tsx` — the tricolor bar (red → yellow → green, Guinea's order). Decorative and `aria-hidden`. Parameterized by `thickness`, `width`, `delay`. Used under the hero title and as the section divider.
- `SectionHeader.tsx` — mono number + label + title + optional intro. Every section below the hero uses it; the numbers (`01`, `02`, `03`) are manual, so renumber if you reorder sections.

## Content location

Section content is hardcoded **inside its component**, not in a shared data file: `PROJECTS` in `main/Projects.tsx`, `CATEGORIES` (skills with levels) in `main/Skills.tsx`, `STATS`/`STACK`/`SOCIALS` in `sub/HeroContent.tsx`, `EMAIL`/`LINKS` in `main/Footer.tsx`. The old `src/constants/index.ts` and `utils/motion.ts` were deleted along with the components that used them.

Images and the CV live in `public/` and are referenced by absolute path (`/next.png`, `/cv/CV_Yattara_Aboubacar.pdf`). Note the mixed-case extensions on project screenshots (`.PNG`) — they matter on case-sensitive filesystems.

## Gotchas

- **`react-icons` v5 mixes Heroicons generations.** `react-icons/hi` is v1 (`HiMail`, `HiExternalLink`), `react-icons/hi2` is v2 (`HiEnvelope`, `HiArrowUpRight`). A wrong-generation name imports as `undefined` and fails at render, not at typecheck. Verify with `node -e 'console.log(typeof require("react-icons/hi2").HiEnvelope)'`.
- **Framer Motion v12 types `ease` as a tuple.** Import `EASE` from `Reveal.tsx` rather than writing a bare array literal, which fails typecheck under `strict`.
- **`scaleX` animations need `origin-left`**, otherwise bars grow from the center. Both `FlagRule` and the skill bars in `Skills.tsx` depend on this.
