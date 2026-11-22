"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
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
export const DURATION = 0.42;
/** Micro-interactions (survol, appui). Doit rester perceptiblement immédiat. */
export const DURATION_FAST = 0.22;
/** Décalage entre deux frères. */
export const STAGGER = 0.035;

/** Course latérale des révélations, en px. */
export const SLIDE = 40;

const base: Transition = { duration: DURATION, ease: EASE };

/* ── Variants ───────────────────────────────────────────────────────────────
   Quatre entrées, une seule grammaire. La distinction sert à varier
   légèrement d'une section à l'autre sans changer de langage : même courbe,
   même durée, seule l'amorce diffère. */

/** Entrée discrète : fondu + 8px vers le haut. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: base },
};

/** Depuis le haut. Pour ce qui descend dans la page (la navbar). */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: base },
};

/** Fondu seul, sans déplacement. Pour les blocs larges, qu'un mouvement
    vertical ferait paraître lourds. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: base },
};

/** Les cartes suivent la même entrée que les autres blocs, sans effet de zoom. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: base },
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
/** Série du hero : colonne de gauche, donc depuis la gauche — même geste que
    les révélations au scroll, sans mesure puisque la place est connue. */
export const revealItem: Variants = {
  hidden: { opacity: 0, x: -SLIDE },
  visible: { opacity: 1, x: 0, transition: base },
};
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
 * Au scroll, le preset ne joue plus : tous les blocs glissent depuis leur
 * côté avec un fondu. Il ne sert qu'aux entrées `immediate`.
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

  /* Au scroll, le bloc arrive du côté où il se trouve : moitié gauche de
     l'écran → depuis la gauche, moitié droite → depuis la droite. Le côté
     est mesuré à l'entrée dans l'écran (le serveur ne connaît pas la mise en page), et
     porté par des keyframes `x: [départ, 0]` : l'état `hidden` reste un
     simple fondu, identique au rendu serveur, donc pas d'écart d'hydratation.
     Un bloc centré (pleine largeur, mobile) part de la gauche. */
  const ref = useRef<HTMLDivElement>(null);
  if (immediate) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        animate="visible"
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

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        /* Variant en fonction : résolu à l'entrée dans l'écran, c'est là
           que le côté est mesuré. */
        visible: () => {
          const r = ref.current?.getBoundingClientRect();
          const right = r ? r.left + r.width / 2 > window.innerWidth / 2 + 1 : false;
          return {
            opacity: 1,
            x: [right ? SLIDE : -SLIDE, 0],
            transition: { ...base, delay },
          };
        },
      }}
    >
      {children}
    </motion.div>
  );
}
