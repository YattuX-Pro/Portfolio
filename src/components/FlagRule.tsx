"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/Reveal";

/* Filet tricolore — rouge, jaune, vert : drapeau de la Guinée.
   Purement décoratif (aria-hidden), c'est ce qui autorise le jaune ici
   alors qu'il est illisible en texte sur fond clair (1.41:1). */

const BANDS = ["bg-flag-red", "bg-flag-yellow", "bg-flag-green"];

export default function FlagRule({
  className = "",
  thickness = 6,
  width = 92,
  delay = 0,
}: {
  className?: string;
  thickness?: number;
  width?: number;
  delay?: number;
}) {
  return (
    <div aria-hidden className={`flex items-center gap-2 ${className}`}>
      {BANDS.map((band, i) => (
        <motion.span
          key={band}
          className={`block origin-left ${band}`}
          style={{ height: thickness, width }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE, delay: delay + i * 0.08 }}
        />
      ))}
    </div>
  );
}
