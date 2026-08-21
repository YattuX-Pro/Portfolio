# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # dev server (falls back off :3000 if taken — read the port it prints)
npm run build   # production build; runs tsc, does NOT run ESLint
npm run start   # serve the production build
npm run lint    # eslint . — must be run manually, the build does NOT run it
npx tsc --noEmit  # typecheck alone
```

Next 16 removed `next lint`, so `lint` calls `eslint .` directly against the flat config in `eslint.config.mjs` (ESLint 9). Next 16 also dropped support for the `eslint` key in `next.config.mjs` — don't re-add `ignoreDuringBuilds` there, it is silently ignored and logs a warning. ESLint never runs as part of `npm run build`, so run it explicitly before considering work done. There is no test suite.

## What this is

Single-page personal portfolio (Next.js 16 App Router, React 19, TypeScript strict, Tailwind 3, Framer Motion 12, react-three-fiber 9 / drei 10 / three). All user-facing copy is in **French**; `<html lang="fr">`. Deployed at yattara.dev.

## Architecture

The whole site is one route. `src/app/page.tsx` renders `PortfolioApp`, a `"use client"` component that composes every section:

```
layout.tsx  → StarsCanvas (fixed full-screen 3D star field, z-20) + children
page.tsx    → PortfolioApp
              ├─ ScrollProgressBar (fixed, z-60)
              ├─ NavBar            (fixed, z-50, own scroll-spy)
              └─ main (z-30)
                 ├─ Section3D id="home"     → Hero → HeroContent (+ HeroOrb3D canvas)
                 ├─ Section3D id="skills"   → Skills (+ SkillNebula3D canvas)
                 ├─ Section3D id="projects" → Projects
                 └─ section    id="footer"  → Footer
```

Navigation is `document.getElementById(id).scrollIntoView()` against those section ids — there is no router. Adding or renaming a section means updating both `PortfolioApp`'s JSX **and** `NAV_LINKS` in `src/components/main/NavBar.tsx`, which derives its scroll-spy `SECTION_IDS` from that array.

### Layering

Everything is stacked in one fixed z-index scheme. Keep new elements inside it: star canvas `20` (pointer-events none), page content `30`, navbar `50`, scroll progress bar `60`. The star canvas sits *behind* content but *above* the body background, so section backgrounds must stay translucent for it to show through.

### 3D conventions

Each 3D visual is its own `<Canvas>`, not one shared scene: `StartBackGround.tsx` (global stars, mounted in the layout), `sub/HeroOrb3D.tsx`, `sub/SkillNebula3D.tsx`. The per-section ones are imported via `next/dynamic` with `ssr: false` — required, because these modules evaluate `typeof window !== 'undefined' && window.innerWidth < …` at module scope to pick a mobile particle count. Any new 3D component must follow the same pattern.

Star positions come from `maath/random/dist/maath-random.esm` behind a `// @ts-ignore` (untyped deep import). **`maath` is not in `package.json`** — it resolves only as a transitive dependency of `@react-three/drei`. If drei is upgraded or deduped away, these imports break; add `maath` as a direct dependency rather than reworking the import.

Scroll-driven camera work reads `window.scrollY` inside `useFrame` and lerps `state.camera.position` — never store scroll in React state for 3D.

### Animation conventions

Framer Motion v12 types `ease` as a `BezierDefinition` tuple, so every file declares its own
`const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]` rather than a bare array literal (a plain array fails typecheck under `strict`). Reuse that constant for consistency. Section reveals use `whileInView` with `viewport={{ once: true }}`. `utils/motion.ts` holds older shared variants (`slideInFromLeft/Right/Top`) still used by the legacy sub-components.

### Content location

Section content is hardcoded **inside its component**, not in a shared data file: `PROJECTS` in `main/Projects.tsx`, `CATEGORIES` (skills with levels) in `main/Skills.tsx`, `STATS`/`BADGES` in `sub/HeroContent.tsx`, `LINKS` in `main/Footer.tsx`. `src/constants/index.ts` (`Skill_data`, `Socials`, `Frontend_skill`, …) is the older data source, only referenced by the legacy sub-components. Edit the in-component arrays for anything visible on the live page.

Images and the CV live in `public/` and are referenced by absolute path (`/next.png`, `/cv/CV_Yattara_Aboubacar.pdf`).

### Unused legacy code

`components/ThreeCanvas.tsx`, `components/Scene3D.tsx` (a single-canvas scroll-through-scenes prototype), `main/TabNav.tsx`, `main/Encryption.tsx`, `sub/ProjectCard.tsx`, `sub/SkillText.tsx`, `sub/SkillDataProvider.tsx`, and `sub/TextAnimation.tsx` are not reachable from `PortfolioApp`. Don't edit them expecting on-page changes, and don't treat their patterns as current.
