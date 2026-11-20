"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import HeroOrbit from "@/components/sub/HeroOrbit";

/* Un tour complet en 90 s, soit 4° par seconde : assez lent pour qu'on
   perçoive que la barre vit sans que l'œil puisse suivre une poignée. */
const WHEEL_TURN_S = 90;

/* ══════════════════════════════════════════════════════════════════════════
   LE CAPITAINE — colonne droite du hero, au-dessus du texte sur mobile.

   Il prend la place de `StackPanel` (le logotype `.NET` et la liste
   `hero_stack`). C'est le cœur du thème pirate : un avatar peint, détouré,
   posé sur le bas de la colonne.

   LE CONTENEUR garde le traitement de l'ancienne colonne : le voile
   `--brand-veil` en dégradé radial ancré en haut à droite, éteint à 80 %, et
   l'arrondi `rounded-t-[2rem]` qui adoucit le seul angle où le voile est
   dense. `overflow-hidden` : la barre et les icônes en orbite débordent du
   cadre par moments, la colonne les coupe proprement au lieu de pousser la
   page en largeur.

   HAUTEUR : 380 px sous 1024 px, où la colonne passe au-dessus du texte —
   assez pour un buste lisible sans repousser le nom sous la ligne de
   flottaison. Au-delà, 620 px FIXES, centrés en face du texte. Étirée sur la
   hauteur du texte, la colonne grandissait avec lui : l'avatar, posé sur le
   bas, descendait, et la barre, calée en haut, restait seule au-dessus d'un
   vide.

   LE BAS EST FONDU, pas coupé : `mask-image` rend l'avatar progressivement
   transparent sur son dernier tiers. Coupé net au bord de la colonne, il
   avait l'air d'un buste posé sur une étagère ; fondu, il sort du fond de la
   page. Le masque s'applique à la boîte de l'image, donc il suit sa taille à
   toutes les largeurs.

   `drop-shadow` et non `box-shadow` : l'ombre suit la silhouette détourée.
   `--shadow` change avec le thème (voir globals.css).

   `preload` : sur mobile, c'est la première image de la page, donc le
   candidat LCP. (`priority` est déprécié depuis Next 16.)

   LA BARRE DU NAVIRE tourne derrière lui, comme un halo : entière, en
   couleurs, ses poignées dépassant autour du chapeau et des épaules. À 10 %
   d'opacité, première version, elle ne donnait qu'une tache beige
   méconnaissable sur le crème. Elle remplace `HeroBackdrop` comme animation
   décorative du hero.
   ══════════════════════════════════════════════════════════════════════════ */

export default function HeroCaptain() {
  /* `useReducedMotion` en plus de `MotionRoot` : une boucle infinie n'est
     pas neutralisée par `MotionConfig`, elle tournerait encore. */
  const reduced = useReducedMotion();

  return (
    /* `min(620px, 100svh − 7rem)` en desktop : la navbar (4rem) et le
       padding de la section (2 × 1,5rem, `PortfolioApp`) retirés de l'écran.
       Sur un portable de 660 px utiles, 620 px fixes dépassaient l'écran. */
    <div className="relative h-[380px] overflow-hidden rounded-t-[2rem] bg-[radial-gradient(130%_95%_at_100%_0%,var(--brand-veil)_0%,transparent_80%)] lg:h-[min(620px,calc(100svh-7rem))]">
      {/* ── La barre ───────────────────────────────────────────────────────
          Largeur plafonnée à 310 px sous 1024 px : la colonne y fait 380 px
          de haut mais peut atteindre 700 px de large sur tablette, et 88 %
          de cette largeur aurait donné une barre plus haute que la colonne.

          `x: "-50%"` en style Framer plutôt qu'une classe `-translate-x-1/2` :
          la rotation est un transform écrit par Framer, qui aurait écrasé
          celui de la classe et décentré la barre.

          Rotation linéaire, seule exception à la courbe unique du site :
          une rotation continue n'a ni départ ni arrivée, une courbe d'easing
          y ferait accélérer et freiner la barre à chaque tour. */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1.5 z-0 aspect-square w-[min(86%,310px)] opacity-100 dark:opacity-90 lg:top-2.5 lg:w-[88%]"
        style={{ x: "-50%", filter: "drop-shadow(0 16px 24px var(--shadow))" }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: WHEEL_TURN_S, ease: "linear", repeat: Infinity }}
      >
        <Image
          src="/pirate/barre.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 400px, 310px"
          className="object-contain"
        />
      </motion.div>

      {/* `z-[2]` : la barre passe dessous, les icônes en orbite passent
          devant ou derrière selon leur position. */}
      <div className="absolute inset-x-0 bottom-0 top-3 z-[2] lg:top-4">
        <Image
          src="/pirate/capitaine.png"
          alt="Avatar d'Aboubacar en capitaine développeur, une tasse C# à la main et un portable sous le bras"
          fill
          preload
          sizes="(min-width: 1024px) 440px, 360px"
          className="object-contain object-bottom"
          style={{
            filter: "drop-shadow(0 24px 32px var(--shadow))",
            maskImage: "linear-gradient(to bottom, #000 68%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 68%, transparent 100%)",
          }}
        />
      </div>

      {/* Le stack en orbite. Frère de l'avatar et non enfant, et sans
          `z-index` sur son conteneur : c'est ce qui laisse chaque icône
          passer devant (3) ou derrière (1) l'avatar (2). Un conteneur avec
          son propre `z-index` formerait un contexte d'empilement, et les six
          icônes passeraient toutes du même côté. */}
      <HeroOrbit />
    </div>
  );
}
