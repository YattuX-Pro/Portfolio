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

Personal portfolio plus an admin console (Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Framer Motion 12). All user-facing copy is in **French**; `<html lang="fr">`. Deployed at yattara.dev.

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

Every color is a CSS variable on `:root`, surfaced to Tailwind through the `@theme inline` block in `globals.css` as `bg-bg`, `text-ink`, `text-ink-muted`, `border-line`, `bg-brand`, `bg-flag-*`. Never hardcode a hex in a component.

**Tailwind 4 is CSS-first: there is no `tailwind.config.ts`.** The whole theme lives in `src/app/globals.css` — `@theme inline` for the scale, `@utility` for custom classes, `@custom-variant dark` to bind `dark:` to the class instead of `prefers-color-scheme`. The `inline` keyword is load-bearing: it makes utilities point at the variable rather than copy its value, which is what lets `.admin` restyle the entire palette by cascade.

Do not reintroduce Tailwind 3. The shadcn/base-ui components here rely on ~100 variants of the form `data-open:`, `data-active:`, `data-checked:`, `data-horizontal:`, which **v3 does not generate at all, silently** — the failure mode is a component that renders with no styling rather than a build error.

The palette is a warm off-white neutral plus **one** interactive accent (`--accent`, the Guinean flag red `#CE1126`). The accent covers buttons, links, hovers and focus rings — nothing else. Resist adding a second interactive color.

**Contrast is load-bearing here, not decorative.** The flag's yellow (`#FCD116`) measures **1.41:1** on the cream background and the official green (`#009460`) measures **3.72:1**. Consequences, already enforced in the code:

- Yellow appears **only** inside `FlagRule`, which is `aria-hidden` and conveys nothing. It must never carry text, an icon, or an informative graphic.
- Green **fails** the 4.5:1 bar for text (it clears 3:1, so it is fine for graphics). `--flag-green-ink` (`#00713F`, 5.85:1) exists for green text.
- `--muted` was deliberately darkened to `#55524C` (7.45:1) after the first pass read as too faint. Don't lighten it back.

If a request would put yellow on text, say so rather than shipping it.

### 2. Motion — one spec, in `Reveal.tsx`

`src/components/Reveal.tsx` is the single animation vocabulary: fade + `translateY(16px)`, 550 ms, ease `[0.16, 1, 0.3, 1]`, `once: true`, 60 ms stagger between siblings. It exports `Reveal` (a wrapper), plus `revealGroup`/`revealItem` variants for staggered children and the shared `EASE`/`DURATION`/`STAGGER` constants. **Import those constants — never retype the numbers.** `Skills.tsx` had `0.55` and `0.05` written by hand and was running its stagger at 50 ms while the rest of the site ran at 60 ms.

Use it. Do not introduce parallax, tilt-on-hover, card scale-on-hover, scroll-driven cameras, or a second easing curve — that vocabulary is exactly what the redesign removed.

**Sanctioned extensions** (all reuse `EASE`, none moves a block of content):

- `scaleX` + `origin-left` to *draw a rule* — `FlagRule`, and the brand rule under a project title on row hover. This is the one legitimate use of a scale transform; `ease-soft` in Tailwind is the same curve as `EASE`, so it is not a second easing curve.
- A shared `layoutId` indicator that *slides* between states — the active underline in `NavBar` travels between sections instead of cross-fading.
- Scroll-linked *indicators* (the 2 px progress line at the bottom of `NavBar`). An indicator is not a scroll-driven camera. Hide these under `motion-reduce:hidden` — see below.
- Hover micro-interactions at 200–300 ms (colour, opacity, `translate-x-0.5`). The 550 ms spec is for scroll reveals; a hover must feel immediate.

**`prefers-reduced-motion` needs BOTH halves.** The media query in `globals.css` only neutralizes `animation-duration`/`transition-duration` — i.e. CSS animations. Framer Motion does not use CSS transitions: it rewrites inline `transform`/`opacity` every frame, so that media query never reached it and reduced-motion visitors still saw every reveal play in full. `src/components/MotionRoot.tsx` (`MotionConfig reducedMotion="user"`) wraps the whole public site and closes that gap. A value bound straight to a `MotionValue` (the scroll progress line) is a binding rather than an animation, so `MotionConfig` cannot neutralize it either — such elements need `motion-reduce:hidden`.

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
- `MotionRoot.tsx` — `MotionConfig reducedMotion="user"` around the whole public site. Mounted in `PortfolioApp`; without it Framer ignores `prefers-reduced-motion` entirely.
- `FlagRule.tsx` — the tricolor bar (red → yellow → green, Guinea's order). Decorative and `aria-hidden`. Parameterized by `thickness`, `width`, `delay`. Used under the hero title and as the section divider.
- `SectionHeader.tsx` — mono number + label + title + optional intro. Every section below the hero uses it; the numbers (`01`, `02`, `03`) are manual, so renumber if you reorder sections.

## Content location

Skills carry **no self-rated percentage** — that system was removed deliberately, so adding a competency never requires inventing a number. Don't reintroduce it.

Section content is hardcoded **inside its component**, not in a shared data file: `PROJECTS` in `main/Projects.tsx`, `CATEGORIES` in `main/Skills.tsx`, `STATS`/`STACK`/`SOCIALS` in `sub/HeroContent.tsx`, `EMAIL`/`LINKS` in `main/Footer.tsx`. The old `src/constants/index.ts` and `utils/motion.ts` were deleted along with the components that used them.

Images and the CV live in `public/` and are referenced by absolute path (`/next.png`, `/cv/CV_Yattara_Aboubacar.pdf`). Note the mixed-case extensions on project screenshots (`.PNG`) — they matter on case-sensitive filesystems.

## Gotchas

- **`react-icons` v5 mixes Heroicons generations.** `react-icons/hi` is v1 (`HiMail`, `HiExternalLink`), `react-icons/hi2` is v2 (`HiEnvelope`, `HiArrowUpRight`). A wrong-generation name imports as `undefined` and fails at render, not at typecheck. Verify with `node -e 'console.log(typeof require("react-icons/hi2").HiEnvelope)'`.
- **Framer Motion v12 types `ease` as a tuple.** Import `EASE` from `Reveal.tsx` rather than writing a bare array literal, which fails typecheck under `strict`.
- **`scaleX` animations need `origin-left`**, otherwise bars grow from the center. `FlagRule` depends on this.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
