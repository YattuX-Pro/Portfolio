"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { VOYAGE } from "./config";

/* ══════════════════════════════════════════════════════════════════════════
   UNE ESCALE — une section de la page, pleine largeur.

   Pleine largeur parce que les traversées qui les séparent le sont : le
   conteneur centré (`max-w-6xl`) vit DANS chaque escale, et non plus autour
   de toute la page.

   Quand on la quitte, son contenu s'estompe et monte légèrement
   (`VOYAGE.leave`) : seulement quand son bas est déjà dans le tiers haut de
   l'écran, donc quand le regard est passé à la mer. Lié au scroll, donc
   réversible ; et rien sous mouvement réduit — une liaison de style ne
   passe pas par `MotionConfig`, il faut la couper ici.

   `scroll-mt-20` : la navbar est fixe (64 px), sans marge le titre de
   l'escale passerait dessous à l'arrivée d'une ancre.
   ══════════════════════════════════════════════════════════════════════════ */

export default function Escale({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [
      [1, VOYAGE.leave.from],
      [1, 0],
    ],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, VOYAGE.leave.opacity]);
  const y = useTransform(scrollYProgress, [0, 1], [0, VOYAGE.leave.y]);

  return (
    <section ref={ref} id={id} className={`scroll-mt-20 ${className}`}>
      <motion.div
        className="mx-auto w-full max-w-6xl px-5 sm:px-10"
        style={reduced ? undefined : { opacity, y }}
      >
        {children}
      </motion.div>
    </section>
  );
}
