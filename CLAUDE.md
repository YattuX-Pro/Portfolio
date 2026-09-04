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

The site was rebuilt from a dark, 3D-heavy design into a **light editorial** one. The public site runs on `next`, `react`, `react-dom`, `framer-motion`, `react-icons` and `date-fns` (`intervalToDuration` only, for the hero counter's calendar arithmetic — see below); the rest of `package.json` belongs to the admin console (shadcn/base-ui, drizzle, the S3 client). If you find yourself reaching for `three`, `@react-three/*`, or a second UI kit, that contradicts the design direction — ask first.

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

`src/components/Reveal.tsx` is the whole animation vocabulary — it plays the role a `lib/animations.ts` would, and is deliberately NOT split into one: it also exports the `Reveal` component used by seven files, so a separate module would duplicate the same spec in two places.

It exports:

- **Constants** — `EASE` (`[0.16, 1, 0.3, 1]`, the site's only curve), `DURATION` (0.55 s, reveals), `DURATION_FAST` (0.22 s, micro-interactions), `STAGGER` (0.06 s).
- **Variants** — `fadeInUp` (the default), `fadeInDown`, `fadeIn`, `scaleIn`, `staggerContainer`, `staggerItem`. `revealItem`/`revealGroup` are kept as aliases because existing components import them.
- **Interaction presets** — `HOVER_LIFT` (`y: -2, scale: 1.01`), `TAP_PRESS` (`scale: 0.98`), `INTERACTION_TRANSITION`.
- **The component** — `<Reveal preset="up" | "down" | "in" | "scale">`, `once: true`, `immediate` for above-the-fold content.

**Import the constants — never retype the numbers.** `Skills.tsx` once had `0.55` and `0.05` written by hand and ran its stagger at 50 ms while the rest of the site ran at 60 ms.

**Direction (updated — the owner asked for a livelier, more premium feel).** Earlier passes banned every scale transform and any decorative background. That is no longer the rule. What IS the rule:

- One curve everywhere (`EASE`). Reveals at 0.55 s, hovers at 0.22 s. No second easing curve.
- Hover lift and press are the shared presets, and they are *tiny*: −2 px and 1.01. Project images zoom to 1.03, never past 1.05.
- `scaleIn` is reserved for framed objects (project cards). Text blocks use `fadeInUp` or `fadeIn`.
- Decorative continuous animation exists in exactly one place: `HeroBackdrop.tsx`. Two veils at 5 % opacity under an 80 px blur, drifting 24 px over 22–28 s, hidden below 768 px, using only colors already in the palette. Do not add a second infinite decorative animation anywhere.
- **One exception, and it is not decorative:** `sub/ExperienceCounter.tsx` re-renders forever, because a live readout that stops is a broken clock. Its budget: one `setState` every 60 ms (the hundredths field needs it; nothing else on the site does), driven by `requestAnimationFrame` (which the browser suspends on a hidden tab — `setInterval` does not), in a **leaf** component so the tick never re-renders the rest of the hero. Nothing moves, nothing transforms: only digit glyphs change. Don't copy this pattern for anything that isn't reading a clock.
- Still banned: parallax, tilt-on-hover, scroll-driven cameras, bounce, rotation, typewriter effects.

**Prefer Framer over CSS for hover on animated elements.** A `hover:-translate-y-0.5` class gets overwritten by the inline transform Framer writes during a reveal. And if the cursor leaves mid-motion, Framer returns the element cleanly where a CSS transition jolts.

**Watch for `transition-property` collisions.** Two `transition-*` utilities on the same element (e.g. `transition-[filter,opacity]` plus `transition-transform`) leave stylesheet order to decide, so one silently loses. `ProjectImage` owns the filter transition, so its zoom lives on a wrapper `<div>`. The same trap applies to any two utilities setting the same property — `mt-auto` next to `mt-6` bit us once too.

**`prefers-reduced-motion` needs THREE layers, not one:**

1. `globals.css` — the media query only neutralizes `animation-duration`/`transition-duration`, i.e. CSS animations.
2. `MotionRoot.tsx` (`MotionConfig reducedMotion="user"`, wrapping the whole public site) — Framer rewrites inline `transform`/`opacity` every frame and never sees that media query.
3. `useReducedMotion()` **in the component** — required whenever motion does not come from a declarative prop: `animate()` in `AnimatedCounter` is imperative and ignores `MotionConfig`, and `HeroBackdrop`'s infinite loop would keep looping. Scroll-linked `MotionValue` bindings (the NavBar progress line) are bindings rather than animations, so they need `motion-reduce:hidden` instead.

**Navbar offset.** Every `<section>` carries `scroll-mt-20`. The navbar is fixed at 64 px, so without it `scrollIntoView` tucks each section title behind the bar.

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
- `sub/AnimatedCounter.tsx` — **currently has no caller** (see `hero_stats` below). Counts a stat up from 0 once it scrolls into view. The stat value is **free text from the DB** (`5+`, `3+`), so it animates the leading digits and reprints the rest verbatim; a value with no leading digit renders as-is rather than showing `NaN`.
- `sub/HeroBackdrop.tsx` — the site's only continuous *decorative* animation. See the motion section for its budget.
- `sub/ExperienceCounter.tsx` — a **chronograph**, sitting at the foot of the hero's main column where the stats row used to be: `4ans 03j 23h 10min 02,6s`, ticking. The social icons share that row on its right.
  - **One line, never two.** That is a reading rule, not a layout preference — a watch does not wrap its dial. Hence `flex-nowrap` + `whitespace-nowrap`, and a `clamp(28px, 4.5vw, 68px)` sized so the run always fits: the readout measures ~6.3× the font size, which stays under the column width from a 375 px phone up to 1512 px. Making it bigger overflows before it looks better. The row itself is `flex-wrap` so the icons drop below on a very narrow screen rather than pushing the digits out of frame.
  - **The only other text is the title.** Row labels, the start date and the year ordinal were all removed on request; every extra word pulled the block away from being a display.
  - **No months field.** Days therefore run 0–365, counted from the anniversary of the start date. A watch has no month register between years and days, and the field spent most of its life showing `0`. The trade: in June it reads `4ans 287j`, not `4ans 9mois 14j`.
  - Only the **years** go through `date-fns` (`differenceInYears` / `addYears`) — they alone depend on the calendar (leap years, and 29 February having no anniversary most years). Everything below is plain arithmetic on the millisecond remainder, deliberately: under a year a chronograph counts elapsed time, and a day is always 24 h.
  - Every field below years is **zero-padded**, the years are not. That is not cosmetic: the run is measured in `em` and a value going 9 → 10 widens its group; the years stay bare because they are what you read first and `04ans` reads like a countdown.
  - The origin is `site_settings.experience_start_at`, edited from the admin profile form. Null hides the block; there is deliberately no fallback date, because a wrong seniority figure is worse than none.
  - The date is read and written in **UTC end to end** (`parseUtcDatetime` in the profile action, `toDatetimeLocal` in the form, `getUTC*` in the component). `datetime-local` sends a zoneless string: parsed without an explicit `Z` it lands in the *server's* zone, so the same save from localhost and from Vercel stored two different instants, and each re-save shifted the date again. Guinea is UTC+0, so UTC is also the true signing hour.
  - Two phases: a 1.8 s count-up from 0 on mount (every field spins), then the live tick at 50 ms — the last rank is tenths, which change every 100 ms. State **must** start at 0: the hero is prerendered, so a value read from `Date.now()` at render time is a guaranteed hydration mismatch. Month names (used only by the `sr-only` sentence) are a hardcoded French array rather than `Intl`, because that string is server-rendered then hydrated and two ICU builds disagreeing on it is enough to fail hydration.
  - The readout is `aria-hidden` with an `sr-only` sentence beside it: tenths changing 20×/s is noise to a screen reader, and an `aria-live` there would announce every one of them.
- `sub/StackPanel.tsx` — the hero's right column (`hidden lg:block`, as it always was). Renders `hero_stack` from the DB under a display-size **`.NET` wordmark whose leading dot is `text-brand`** — the same red dot as `Yattara.` in the h1, a few centimetres away. That repetition is the whole idea: it ties the name to the technology without a sentence, and it is what keeps the wordmark from reading as a logo dropped onto the page. Right-aligned so it heads the column of `dd` values. It owns the column's container treatment: the `--brand-veil` radial anchored top-right, `lg:rounded-t-[2rem]`, the `lg:pr-6` gutter, the tricolor rule.
- `sub/ProjectImage.tsx` — progressive de-blur on load. Sets `filter` **inline** on purpose: Tailwind's `blur-*` routes through `--tw-blur`, declared `@property { syntax: "*" }`, which animates discretely and cannot interpolate; and written as an arbitrary class the minifier collapsed `blur(0px)` to `blur()`.
- `FlagRule.tsx` — the tricolor bar (red → yellow → green, Guinea's order). Decorative and `aria-hidden`. Parameterized by `thickness`, `width`, `delay`. Used under the hero title and as the section divider.
- `SectionHeader.tsx` — mono number + label + title + optional intro. Every section below the hero uses it; the numbers (`01`, `02`, `03`) are manual, so renumber if you reorder sections.

## Content location

Skills carry **no self-rated percentage** — that system was removed deliberately, so adding a competency never requires inventing a number. Don't reintroduce it.

Section content is hardcoded **inside its component**, not in a shared data file: `PROJECTS` in `main/Projects.tsx`, `CATEGORIES` in `main/Skills.tsx`, `STATS`/`STACK`/`SOCIALS` in `sub/HeroContent.tsx`, `EMAIL`/`LINKS` in `main/Footer.tsx`. The old `src/constants/index.ts` and `utils/motion.ts` were deleted along with the components that used them.

**`hero_stats` is what is orphaned now** (`5+ Projets`, `3+ Années`, `2 Domaines`). The chronograph took that row: two of the three stats duplicated it and `3+ Années` openly contradicted it. The table, the rows and the admin tab are untouched, so that tab currently edits content the site does not render — and `sub/AnimatedCounter.tsx` has no caller left. Decide: give the stats a home elsewhere, or delete all three (tab, table, component).

The hero's seniority origin is **not** in a component: it is `site_settings.experience_start_at`, set from the admin profile form (migration `drizzle/0004_*.sql`). It is a `timestamp with time zone`, not a `date`, because the counter shows hours, minutes and seconds — a `date` column would pin them to midnight forever.

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
