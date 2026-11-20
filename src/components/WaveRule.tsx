"use client";

import { motion } from "framer-motion";
import { DURATION, EASE } from "@/components/Reveal";

/* ══════════════════════════════════════════════════════════════════════════
   LIGNE DE HOULE — le séparateur du site depuis le thème pirate.

   Elle remplace le filet tricolore (`FlagRule`), retiré des écrans à la
   demande du propriétaire. Avec lui disparaît le seul endroit où le jaune du
   drapeau était permis : il n'apparaît plus nulle part sur le site public.

   C'est un détail maritime, pas un ornement : un trait de 1,5 px en
   `--line-strong`, la couleur des bordures, sans aucune teinte nouvelle.

   La longueur d'onde est FIXE (50 px) : le chemin est tracé en pixels sur
   2400 px de long et la boîte SVG le coupe à sa largeur, sans `viewBox`. Une
   `viewBox` étirée en `preserveAspectRatio="none"` aurait écrasé les vagues
   sur un téléphone et les aurait étalées sur un grand écran — la houle
   aurait changé de forme selon l'appareil.

   L'entrée est un balayage de gauche à droite (`clip-path`) et non un
   `scaleX` comme l'ancien filet : un `scaleX` comprime le dessin pendant
   l'animation, et des vagues aplaties qui se déplient ne ressemblent plus à
   rien. Même courbe et même durée que toute révélation (`Reveal.tsx`). */

const HALF = 25;
const MID = 8;
const CREST = 2;
const LENGTH = 2400;

const WAVE_PATH = (() => {
  let d = `M0 ${MID} Q${HALF / 2} ${CREST} ${HALF} ${MID}`;
  for (let x = HALF; x < LENGTH; x += HALF) d += ` T${x + HALF} ${MID}`;
  return d;
})();

export default function WaveRule({ className = "" }: { className?: string }) {
  return (
    <motion.div
      aria-hidden
      className={className}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: DURATION, ease: EASE }}
    >
      <svg width="100%" height={MID * 2} className="block">
        <path d={WAVE_PATH} fill="none" strokeWidth={1.5} className="stroke-line-strong" />
      </svg>
    </motion.div>
  );
}
