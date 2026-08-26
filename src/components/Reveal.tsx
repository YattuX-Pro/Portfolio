"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* La spec d'animation unique du site.
   fade + 16px, 550ms, once. Rien d'autre, nulle part. */
export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
export const DURATION = 0.55;
/* Décalage entre deux frères. Exporté parce que plusieurs composants
   calculent leur propre délai (Skills, le titre du hero) : recopier 0.06 à la
   main faisait déjà diverger la cadence — Skills tournait à 50 ms. */
export const STAGGER = 0.06;

export const revealItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

/* Parent : décale les enfants de 60ms. */
export const revealGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

/* Bloc révélé au scroll. `immediate` pour ce qui est déjà visible au chargement. */
export default function Reveal({
  children,
  className,
  delay = 0,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, amount: 0.2 } })}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION, ease: EASE, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
