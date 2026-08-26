"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Respect de `prefers-reduced-motion` pour Framer Motion.
 *
 * Le bloc `@media (prefers-reduced-motion: reduce)` de globals.css neutralise
 * `animation-duration` et `transition-duration` — donc les animations CSS, et
 * elles seules. Framer, lui, n'utilise pas de transition CSS : il réécrit
 * `transform` et `opacity` en style inline à chaque frame. Ce média-query ne
 * l'atteignait pas, et un visiteur ayant demandé moins de mouvement voyait
 * malgré tout défiler chaque révélation du site.
 *
 * `reducedMotion="user"` fait sauter aux animations de transformation leur
 * état final, en laissant passer les fondus d'opacité — qui ne déclenchent
 * pas de trouble vestibulaire. C'est le réglage attendu : le contenu reste
 * lisible et ordonné, sans le mouvement.
 */
export default function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
