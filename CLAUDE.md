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
              ├─ NavBar        (fixed, z-50, own scroll-spy, voyage Route at its foot)
              └─ main
                 ├─ Escale id="home"     → Hero → HeroContent   (departure)
                 ├─ Crossing             (pinned full-screen sea scene, to Parcours)
                 ├─ Escale id="parcours" → Journey   (01, hidden with its crossing when the table is empty)
                 ├─ Crossing
                 ├─ Escale id="projects" → Projects  (02)
                 ├─ Crossing
                 ├─ Escale id="skills"   → Skills    (03)
                 ├─ Crossing
                 └─ Escale id="footer"   → Footer    (04, Contact)
```

The order tells a story: where I come from, what I shipped, with what, then contact. **The page is a voyage** (the owner's request): the hero is the departure, each section an *escale* (port of call), and between two escales a *crossing*: a full-screen, briefly pinned ocean scene where the ship comes from the horizon to the camera, tied to scroll (see "The voyage" below). A first, subtler version (a grey line-drawn sea band) was rejected by the owner as « trop basique » — the brief is spectacle, not restraint, inside the crossings.

The escales are listed ONCE, in `ESCALES` (`src/components/voyage/config.ts`): the NavBar takes its links from it (and derives its scroll-spy `SECTION_IDS`, plus `home`, tracked without a link — the monogram already goes back up), and `PortfolioApp` renders a crossing + an escale per entry from its `content` map. Adding or renaming a section means updating `ESCALES` **and** that map. Escales are full width (the crossings run edge to edge); the centered `max-w-6xl` container lives inside each `Escale`, not around the page.

Navigation is plain anchors (`<a href="#projects">`) whose click is taken over to close the mobile panel, `replaceState` the hash and call `scrollIntoView()` **without** `behavior`: `scroll-behavior: smooth` is set on `<html>` in `globals.css` and drops to `auto` under reduced motion. There is no router.

## The three systems to respect

Most of the design lives in three shared primitives. Changes that bypass them are what will make this site drift back toward the generic.

### 1. Color — tokens in `globals.css`, one accent

Every color is a CSS variable on `:root`, surfaced to Tailwind through the `@theme inline` block in `globals.css` as `bg-bg`, `text-ink`, `text-ink-muted`, `border-line`, `bg-brand`, `bg-flag-*`. Never hardcode a hex in a component.

**Tailwind 4 is CSS-first: there is no `tailwind.config.ts`.** The whole theme lives in `src/app/globals.css` — `@theme inline` for the scale, `@utility` for custom classes, `@custom-variant dark` to bind `dark:` to the class instead of `prefers-color-scheme`. The `inline` keyword is load-bearing: it makes utilities point at the variable rather than copy its value, which is what lets `.admin` restyle the entire palette by cascade.

Do not reintroduce Tailwind 3. The shadcn/base-ui components here rely on ~100 variants of the form `data-open:`, `data-active:`, `data-checked:`, `data-horizontal:`, which **v3 does not generate at all, silently** — the failure mode is a component that renders with no styling rather than a build error.

The palette is a warm off-white neutral plus **one** interactive accent (`--accent`, the Guinean flag red `#CE1126`). The accent covers buttons, links, hovers and focus rings — nothing else. Resist adding a second interactive color.

**Contrast is load-bearing here, not decorative.** The flag's yellow (`#FCD116`) measures **1.41:1** on the cream background and the official green (`#009460`) measures **3.72:1**. Consequences, already enforced in the code:

- Yellow appears **nowhere on the public site**. It used to live only in `FlagRule`, the tricolor bar, which was removed from the screens at the owner's request and replaced by `WaveRule`. The admin sidebar keeps its `aria-hidden` tricolor stripe. Yellow must never carry text, an icon, or an informative graphic.
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

- One curve everywhere (`EASE`). Reveals at 0.55 s, hovers at 0.22 s. No second easing curve — with one exception: **continuous** motion (the wheel's rotation) runs `linear`, because it has no start or end and an eased curve would make it speed up and brake on every turn.
- Hover lift and press are the shared presets, and they are *tiny*: −2 px and 1.01. Project images zoom to 1.03, never past 1.05.
- `scaleIn` is reserved for framed objects (project cards). Text blocks use `fadeInUp` or `fadeIn`.
- **Pirate theme (the owner's request): decorative continuous animation now has a fixed list, and nothing goes beyond it.** The theme is carried by the illustrations, and these are the only ones that move forever:
  - the ship's wheel behind the captain (`sub/HeroCaptain.tsx`): one turn in 90 s, linear, the only continuous rotation on the site.
  - the six pirate stack icons orbiting the captain (`sub/HeroOrbit.tsx`): a ring tilted −14°, one turn in 36 s, passing in front of the avatar (z 3, larger) then behind it (z 1, smaller and dimmer), plus a ±4 px swell and ±6° roll per icon. Driven by ONE time `MotionValue` advanced by `requestAnimationFrame`, every icon deriving its styles through `useTransform` — **no React render per frame**. Copy that pattern, not `setState`, for anything that moves every frame.
  - the compass beside the seniority counter (`sub/CompassDial.tsx`): ±3° around −4°, a sine with a ~10 s period, via `useTime` + `useTransform`.
  - the message bottle in the Contact header (`Floating` in `SectionHeader.tsx`, `float: true`): ±6 px bob and ±3° roll around −8°, same `useTime` pattern. The only one outside the hero.
  
  - each crossing's scene (`voyage/Crossing.tsx`): the ship's pitch and swell (±1.2°, ±5 px, ~4.6 s), the drifting fog, the breathing moon/sun halo and the sparkles canvas. One rAF loop per crossing, running **only while that crossing is on screen** (`useInView`).

  `HeroBackdrop` (two drifting veils) was removed when the wheel arrived. Every item on this list stops under reduced motion via `useReducedMotion()` (see the three layers below). Do not add another.
- **One exception, and it is not decorative:** `sub/ExperienceCounter.tsx` re-renders forever, because a live readout that stops is a broken clock. Its budget: one `setState` every 60 ms (the hundredths field needs it; nothing else on the site does), driven by `requestAnimationFrame` (which the browser suspends on a hidden tab — `setInterval` does not), in a **leaf** component so the tick never re-renders the rest of the hero. Nothing moves, nothing transforms: only digit glyphs change. Don't copy this pattern for anything that isn't reading a clock.
- **Scroll-linked motion and parallax are allowed in the voyage, and only there** (the owner's request): the crossings (pinned scene, camera push-in, ship, title), the fade of the escale being left (`Escale`), and the Route under the navbar. Everything is derived from scroll position, so it is reversible and a direct jump lands in the right state — nothing to "replay". The crossings pin with `position: sticky` (no JS pinning), for a bounded length (`VOYAGE.length`); no scroll-snap, no scroll-jacking: the native scroll stays in charge.
- Still banned: parallax or scroll-linked motion outside the voyage, tilt-on-hover, bounce, typewriter effects, and rotation anywhere outside the list above (the ship's pitch counts as part of it, kept within ±5° because the illustration is a flat profile).

**Prefer Framer over CSS for hover on animated elements.** A `hover:-translate-y-0.5` class gets overwritten by the inline transform Framer writes during a reveal. And if the cursor leaves mid-motion, Framer returns the element cleanly where a CSS transition jolts.

**Watch for `transition-property` collisions.** Two `transition-*` utilities on the same element (e.g. `transition-[filter,opacity]` plus `transition-transform`) leave stylesheet order to decide, so one silently loses. `ProjectImage` owns the filter transition, so its zoom lives on a wrapper `<div>`. The same trap applies to any two utilities setting the same property — `mt-auto` next to `mt-6` bit us once too.

**`prefers-reduced-motion` needs THREE layers, not one:**

1. `globals.css` — the media query only neutralizes `animation-duration`/`transition-duration`, i.e. CSS animations.
2. `MotionRoot.tsx` (`MotionConfig reducedMotion="user"`, wrapping the whole public site) — Framer rewrites inline `transform`/`opacity` every frame and never sees that media query.
3. `useReducedMotion()` **in the component** — required whenever motion does not come from a declarative prop: the rAF loop in `HeroOrbit` and the `useTime` sways in `CompassDial` and `SectionHeader` never go through a declarative prop, and the wheel's infinite rotation in `HeroCaptain` would keep turning. Scroll-linked `MotionValue` bindings are bindings rather than animations, so `MotionConfig` never touches them either: `Crossing` and `Escale` drop their bindings when `useReducedMotion()` is true (a still picture: no veil, no canvas, ship low and centered, title raised; the crossing also shrinks to `85svh` and stops pinning via `motion-reduce:`), and the Route under the navbar uses `motion-reduce:hidden`.

**Navbar offset.** Every `<section>` (`Escale`) carries `scroll-mt-20`. The navbar is fixed at 64 px, so without it `scrollIntoView` tucks each section title behind the bar.

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
- **The hero fits the screen on desktop.** From 1024 px, everything down to the chronograph must read without scrolling, down to a ~600 px-tall viewport (a 1366×768 laptop leaves ~660). The h1 is `clamp(30px, min(9vw, 9svh), 92px)`, the vertical margins and the compass dial are `svh`-based clamps capped at their original values, so large screens are unchanged. Below 1024 px text and captain stack and the hero scrolls; those clamps are `lg:`-only. Adding a line to the hero means re-measuring at 1024×643 and 1280×600.
- `sub/HeroCaptain.tsx` — the hero's right column, and the heart of the pirate theme: the painted captain avatar (`public/pirate/capitaine.png`), its bottom faded with `mask-image` instead of cut flat, standing in front of the slowly turning ship's wheel, with `HeroOrbit` inside it. The avatar is `z-[2]` and the orbit container has **no** `z-index` on purpose: a z-index there would create a stacking context and every icon would land on the same side of the avatar. 380 px tall below 1024 px, where it sits **above** the text (`order-*`; the text stays first in the DOM); beside it on desktop, `min(620px, 100svh − 7rem)` tall and vertically centered against the text (stretched to the text height, the bottom-anchored avatar slid away from the top-anchored wheel). The 7rem is the navbar plus the section's `lg:py-6` in `PortfolioApp`: change one, change the other. It keeps the old column's `--brand-veil` radial and `rounded-t-[2rem]`. Shadows are `drop-shadow(var(--shadow))`, which follows the cut-out silhouette.
- `sub/ExperienceCounter.tsx` — a **chronograph**, sitting at the foot of the hero's main column where the stats row used to be: `4ans 03j 23h 10min 02,6s`, ticking. It takes an optional `dial` (the hero passes `CompassDial`) and lays out a grid: from 640 px the dial sits right of both lines; on a phone it sits beside the label and the readout gets the full width below. The readout's `cqw` is measured on its own grid cell, not the root (which now includes the dial). A third grid row, `extra`, takes `children` under the readout — the hero passes its social icons there, so they sit left of the compass (which spans all three rows from 640 px) instead of adding a line below the block.
  - **One line, never two.** That is a reading rule, not a layout preference — a watch does not wrap its dial. Hence `flex-nowrap` + `whitespace-nowrap`, and a `clamp(28px, 4.5vw, 68px)` sized so the run always fits: the readout measures ~6.3× the font size, which stays under the column width from a 375 px phone up to 1512 px. Making it bigger overflows before it looks better. The row itself is `flex-wrap` so the icons drop below on a very narrow screen rather than pushing the digits out of frame.
  - **The only other text is the title**, « Années d'expérience · en mer depuis {année} » (the year is read from the start date, so it can never contradict the readout). Row labels, the full start date and the year ordinal were all removed on request; every extra word pulled the block away from being a display.
  - **No months field.** Days therefore run 0–365, counted from the anniversary of the start date. A watch has no month register between years and days, and the field spent most of its life showing `0`. The trade: in June it reads `4ans 287j`, not `4ans 9mois 14j`.
  - Only the **years** go through `date-fns` (`differenceInYears` / `addYears`) — they alone depend on the calendar (leap years, and 29 February having no anniversary most years). Everything below is plain arithmetic on the millisecond remainder, deliberately: under a year a chronograph counts elapsed time, and a day is always 24 h.
  - Every field below years is **zero-padded**, the years are not. That is not cosmetic: the run is measured in `em` and a value going 9 → 10 widens its group; the years stay bare because they are what you read first and `04ans` reads like a countdown.
  - The origin is `site_settings.experience_start_at`, edited from the admin profile form. Null hides the block; there is deliberately no fallback date, because a wrong seniority figure is worse than none.
  - The date is read and written in **UTC end to end** (`parseUtcDatetime` in the profile action, `toDatetimeLocal` in the form, `getUTC*` in the component). `datetime-local` sends a zoneless string: parsed without an explicit `Z` it lands in the *server's* zone, so the same save from localhost and from Vercel stored two different instants, and each re-save shifted the date again. Guinea is UTC+0, so UTC is also the true signing hour.
  - Two phases: a 1.8 s count-up from 0 on mount (every field spins), then the live tick at 50 ms — the last rank is tenths, which change every 100 ms. State **must** start at 0: the hero is prerendered, so a value read from `Date.now()` at render time is a guaranteed hydration mismatch. Month names (used only by the `sr-only` sentence) are a hardcoded French array rather than `Intl`, because that string is server-rendered then hydrated and two ICU builds disagreeing on it is enough to fail hydration.
  - The readout is `aria-hidden` with an `sr-only` sentence beside it: tenths changing 20×/s is noise to a screen reader, and an `aria-live` there would announce every one of them.
- `sub/ProjectImage.tsx` — progressive de-blur on load. Sets `filter` **inline** on purpose: Tailwind's `blur-*` routes through `--tw-blur`, declared `@property { syntax: "*" }`, which animates discretely and cannot interpolate; and written as an arbitrary class the minifier collapsed `blur(0px)` to `blur()`.
- `WaveRule.tsx` — the swell line, now only above the footer credits (the crossings replaced the one below the hero). A 1.5 px stroke in `--line-strong`, decorative and `aria-hidden`. The wavelength is **fixed** (the path is drawn in pixels over 2400 px and the SVG crops it, no `viewBox`) so the waves keep their shape on every screen width. It enters with a left-to-right `clip-path` wipe, not `scaleX`, which would squash the waves mid-animation. It replaced `FlagRule`, the tricolor bar, removed from the screens at the owner's request.
- **The voyage — `src/components/voyage/`.** Four files, one job each:
  - `config.ts` — `ESCALES` (id, nav label, `cap` subtitle shown above the escale's giant name in the crossing that leads there) and `VOYAGE`: crossing length (svh), the four **phases** of the choreography (`reveal`, `sail`, `title`, `close`, as fractions of local progress), camera push-in, ship course/scale/perspective/pitch/swell, sparkle counts, fog drift, leave-fade. **Every motion setting lives here**; tune intensity there, not in the components. `close` must be nearly done when the pin ends (≈ `length / (length + 100)`), or the scene's bottom edge shows as a hard line when it scrolls away — change `length`, revisit `close`.
  - `Crossing.tsx` — a container `VOYAGE.length` svh tall holding a `sticky` full-screen scene: a painted ocean (`mer-nuit.jpg` in dark, `mer-aube.jpg` in light, swapped with `dark:`), a camera push-in on it, a breathing halo on the moon/sun, a sparkles canvas on the light path and in the air, drifting fog bands (page-colored radial gradients tiled every 100vw), the ship coming from the horizon to the camera along a perspective curve (`k = t^perspective` drives x, y and scale together), and the next escale's name emerging from the fog. A page-colored **veil** lifts at the start and falls at the end, so the scene is born from the page and returns to it — no hard edge. The scene is its own space between sections: it never covers content. Decorative end to end (`aria-hidden`); the section's real `h2` stays the only heading read. No React render per frame: MotionValues only, the canvas redraws on `useMotionValueEvent` of the scene's time value.
  - **Sticky needs `overflow-x: clip` on `html, body`, not `hidden`.** With `hidden` on both, `body` becomes a scroll container that never scrolls, every `sticky` attaches to it and never sticks — the scenes scrolled away with the page. `clip` clips the same without creating a scroll container. Don't turn it back into `hidden`.
  - Scene lights are tokens in `globals.css`, per theme: `--sea-glint` (sparkles), `--sea-glow` (moon/sun halo), `--sea-foam` (foam under the hull). Like `--shadow`, they live only inside the illustration. In dark mode the ship image is dimmed and desaturated (`dark:brightness-[0.62] dark:saturate-[0.6]`) so its warm studio light doesn't look pasted on the moonlit sea.
  - `Escale.tsx` — a full-width `<section>`; its content fades and lifts slightly while its bottom crosses the top third of the screen (the reader is already looking at the sea).
  - `Route.tsx` — the global progress at the foot of the navbar: dashed route, red travelled part (the old reading line's `scaleX`), one port per escale placed where its anchor lands (re-measured on every document resize), and an ink ship glyph. Ports and glyph share a track inset by the glyph's half-width.
  - The ship is `public/pirate/navire.png`: an **original** galleon generated with Codex (not the film's Black Pearl, whose name and design are Disney's), its white background removed with a custom pass (white → alpha everywhere, rigging gaps included, with the white un-mixed from a 2 px edge band — no halo on the dark theme).
- `SectionHeader.tsx` — mono number + label + title + optional intro + optional illustration. Every section below the hero uses it; the numbers (`01`–`04`) are manual, so renumber if you reorder sections. A pirate illustration passes `display: { mobile, desktop }` (shown at every width, under the text on a phone), an optional fixed `tilt`, and `float` for the bottle.
- `main/Journey.tsx` — the Parcours section, a ship's log: one row per `experiences` row, the stop number derived from the order (`Escale 06 · en cours` … `Port de départ`), never stored. Square marker: brand red for the current job, ink for a job, flag green for training (a graphic, so 3.72:1 is fine).

## Content location

Skills carry **no self-rated percentage** — that system was removed deliberately, so adding a competency never requires inventing a number. Don't reintroduce it.

Projects, skills, settings and the journey (`experiences`, admin tab « Parcours », migration `drizzle/0005_parcours.sql`, which also inserts the six stops from the CV) come from the **database**. Section copy (titles, intros) is hardcoded **inside its component**, not in a shared data file. Older note: `PROJECTS` in `main/Projects.tsx`, `CATEGORIES` in `main/Skills.tsx`, `STATS`/`STACK`/`SOCIALS` in `sub/HeroContent.tsx`, `EMAIL`/`LINKS` in `main/Footer.tsx`. The old `src/constants/index.ts` and `utils/motion.ts` were deleted along with the components that used them.

**`hero_stats` and `hero_stack` are orphaned tables.** The chronograph took the stats row and the captain's orbit took the stack column; every line of code that read or wrote them is gone (queries, the two admin tabs, `AnimatedCounter`, `StackPanel`, `ListEditor`, the seed rows). Their `pgTable` definitions are **kept on purpose** in `schema.ts` until the redesign is deployed: removing them makes `db:generate` emit a `DROP TABLE`, and `db:migrate` would apply it together with `0005_parcours` — while the old code still in production reads those tables. After deploying: delete the two definitions, then `npm run db:generate` and `npm run db:migrate`.

The hero's seniority origin is **not** in a component: it is `site_settings.experience_start_at`, set from the admin profile form (migration `drizzle/0004_*.sql`). It is a `timestamp with time zone`, not a `date`, because the counter shows hours, minutes and seconds — a `date` column would pin them to midnight forever.

Images and the CV live in `public/` and are referenced by absolute path (`/next.png`, `/cv/CV_Yattara_Aboubacar.pdf`). Note the mixed-case extensions on project screenshots (`.PNG`) — they matter on case-sensitive filesystems.

## Gotchas

- **`react-icons` v5 mixes Heroicons generations.** `react-icons/hi` is v1 (`HiMail`, `HiExternalLink`), `react-icons/hi2` is v2 (`HiEnvelope`, `HiArrowUpRight`). A wrong-generation name imports as `undefined` and fails at render, not at typecheck. Verify with `node -e 'console.log(typeof require("react-icons/hi2").HiEnvelope)'`.
- **Framer Motion v12 types `ease` as a tuple.** Import `EASE` from `Reveal.tsx` rather than writing a bare array literal, which fails typecheck under `strict`.
- **`scaleX` animations need `origin-left`**, otherwise bars grow from the center. The NavBar reading-progress line depends on this.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
