"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Transition, Variants } from "framer-motion";

/* ══════════════════════════════════════════════════════════════════════════
   VOCABULAIRE D'ANIMATION DU SITE — source unique.

   Ce fichier tient le rôle d'un `lib/animations.ts` : tous les variants, les
   durées et les courbes vivent ici, aucun composant ne redéfinit les siens.
   Il n'est PAS déplacé dans lib/ parce qu'il exporte aussi le composant
   `Reveal`, utilisé par sept fichiers — un module séparé aurait dédoublé la
   même spec à deux endroits, exactement ce qu'on veut éviter.

   Une seule courbe pour tout le site. La v12 de Framer type `ease` comme un
   tuple : passer un tableau littéral échoue au typecheck sous `strict`, d'où
   la constante.
   ══════════════════════════════════════════════════════════════════════════ */

export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Révélations au scroll et à l'entrée de page. */
export const DURATION = 0.55;
/** Micro-interactions (survol, appui). Doit rester perceptiblement immédiat. */
export const DURATION_FAST = 0.22;
/** Décalage entre deux frères. */
export const STAGGER = 0.06;

const base: Transition = { duration: DURATION, ease: EASE };

/* ── Variants ───────────────────────────────────────────────────────────────
   Quatre entrées, une seule grammaire. La distinction sert à varier
   légèrement d'une section à l'autre sans changer de langage : même courbe,
   même durée, seule l'amorce diffère. */

/** L'entrée par défaut : fondu + 16px vers le haut. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: base },
};

/** Depuis le haut. Pour ce qui descend dans la page (la navbar). */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: base },
};

/** Fondu seul, sans déplacement. Pour les blocs larges, qu'un mouvement
    vertical ferait paraître lourds. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: base },
};

/** Fondu + très léger agrandissement. 0.98 et pas moins : au-delà, l'élément
    « saute » au lieu de se poser. Réservé aux objets encadrés (cartes). */
export const scaleIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: base },
};

/** Parent d'une série : décale ses enfants. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

/** Enfant d'une série. Alias de `fadeInUp`, nommé par son rôle. */
export const staggerItem = fadeInUp;

/* Noms historiques, conservés parce que plusieurs composants les importent.
   Renommer aurait touché sept fichiers pour zéro gain fonctionnel. */
export const revealItem = fadeInUp;
export const revealGroup = staggerContainer;

/* ── Micro-interactions ────────────────────────────────────────────────────
   Presets de survol et d'appui, pour que tous les boutons du site réagissent
   pareil. Volontairement minuscules : -2px et 1.01, c'est ce qui donne
   l'impression d'un objet physique sans que rien ne bouge vraiment.

   `whileTap` plus fort que `whileHover` : au relâchement, l'élément revient,
   ce qui suffit à simuler l'enfoncement. */
export const HOVER_LIFT = { y: -2, scale: 1.01 } as const;
export const TAP_PRESS = { scale: 0.98 } as const;
export const INTERACTION_TRANSITION: Transition = {
  duration: DURATION_FAST,
  ease: EASE,
};

/* ── Composant ──────────────────────────────────────────────────────────── */

export type RevealPreset = "up" | "down" | "in" | "scale";

const PRESETS: Record<RevealPreset, Variants> = {
  up: fadeInUp,
  down: fadeInDown,
  in: fadeIn,
  scale: scaleIn,
};

/**
 * Bloc révélé au scroll.
 *
 * `immediate` pour ce qui est déjà visible au chargement — sans quoi un
 * élément au-dessus de la ligne de flottaison attendrait un scroll qui ne
 * viendra jamais.
 *
 * `once: true` partout : une animation qui se rejoue à chaque passage devient
 * du bruit dès la seconde lecture.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  immediate = false,
  preset = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
  preset?: RevealPreset;
}) {
  const variants = PRESETS[preset];

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, amount: 0.2 } })}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...(variants.visible as object),
          transition: { ...base, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
