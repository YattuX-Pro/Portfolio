"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/Reveal";

/**
 * Fond décoratif du hero : deux voiles très diffus qui dérivent lentement.
 *
 * Le dosage est le sujet, pas l'effet. Ce site est un éditorial clair sur
 * crème ; des « blobs » lumineux comme on en voit sur les portfolios sombres y
 * feraient tache. D'où trois garde-fous :
 *
 *  1. les voiles empruntent les DEUX couleurs déjà présentes dans la charte —
 *     le rouge du drapeau et son vert. Aucune teinte nouvelle ;
 *  2. l'opacité plafonne à 5%, sous un flou de 80px. À ce niveau on ne voit
 *     pas une forme, on perçoit une variation de température du fond ;
 *  3. l'amplitude est de 24px sur 22 à 28 secondes. Trop lent pour qu'un œil
 *     accroche le mouvement, assez pour que le fond ne soit jamais tout à
 *     fait le même.
 *
 * `hidden md:block` : masqué sous 768px. Deux surfaces floutées animées en
 * continu sont ce qui coûte le plus cher à composer sur mobile, et un fond
 * décoratif ne vaut pas une saccade au scroll.
 *
 * `useReducedMotion` en plus de MotionRoot : `reducedMotion="user"` neutralise
 * les animations de transformation mais une boucle infinie resterait une
 * boucle infinie. Ici on ne rend simplement rien.
 *
 * `aria-hidden` + `pointer-events-none` : purement décoratif, hors du flux et
 * hors de portée du curseur.
 */

/* Pas de `as const` : il rendrait les tableaux de keyframes readonly, et les
   types de Framer exigent des tableaux mutables. */
const VEILS: {
  className: string;
  duration: number;
  drift: { x: number[]; y: number[] };
}[] = [
  {
    /* En haut à droite, derrière le titre. */
    className: "-top-24 right-[-10%] size-[520px] bg-flag-red",
    duration: 22,
    drift: { x: [0, 24, 0], y: [0, -16, 0] },
  },
  {
    /* En bas à gauche, derrière la ligne de statistiques. */
    className: "bottom-[-15%] left-[-8%] size-[460px] bg-flag-green",
    duration: 28,
    drift: { x: [0, -20, 0], y: [0, 18, 0] },
  },
];

export default function HeroBackdrop() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    /* PAS d'`overflow-hidden` ici. Un flou de 80px sur une forme placée à
       cheval sur le bord du conteneur se fait COUPER en plein dégradé : au
       lieu d'un halo diffus, on obtient un rectangle teinté à bords francs —
       exactement ce qu'il ne faut pas. Le débordement horizontal est déjà
       arrêté par `body { overflow-x: hidden }` dans globals.css, donc rien ne
       provoque de barre de défilement. */
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
    >
      {VEILS.map((veil, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full opacity-[0.05] blur-[80px] ${veil.className}`}
          animate={veil.drift}
          transition={{
            duration: veil.duration,
            ease: EASE,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      ))}
    </div>
  );
}
