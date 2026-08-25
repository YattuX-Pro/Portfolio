"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/Reveal";

/* Filet tricolore — rouge, jaune, vert : drapeau de la Guinée.
   Purement décoratif (aria-hidden), c'est ce qui autorise le jaune ici
   alors qu'il est illisible en texte sur fond clair (1.41:1).

   Les bandes sont fluides (flex-1) sous une largeur maximale : à 320px,
   trois bandes fixes de 92px déborderaient de la zone de contenu. */

const BANDS = ["bg-flag-red", "bg-flag-yellow", "bg-flag-green"];
const GAP = 8;

export default function FlagRule({
  className = "",
  thickness = 6,
  width = 92,
  delay = 0,
}: {
  className?: string;
  thickness?: number;
  /** Largeur cible d'une bande. Sert de plafond, pas de valeur figée. */
  width?: number;
  delay?: number;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center w-full ${className}`}
      style={{ gap: GAP, maxWidth: width * BANDS.length + GAP * (BANDS.length - 1) }}
    >
      {BANDS.map((band, i) => (
        <motion.span
          key={band}
          className={`block flex-1 origin-left ${band}`}
          style={{ height: thickness }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE, delay: delay + i * 0.08 }}
        />
      ))}
    </div>
  );
}
