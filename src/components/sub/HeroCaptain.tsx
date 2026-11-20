"use client";

import Image from "next/image";

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
   flottaison. Au-delà, au moins 620 px, et la colonne s'étire sur la hauteur
   du texte d'en face (`lg:items-stretch` côté hero).

   LE BAS EST FONDU, pas coupé : `mask-image` rend l'avatar progressivement
   transparent sur son dernier tiers. Coupé net au bord de la colonne, il
   avait l'air d'un buste posé sur une étagère ; fondu, il sort du fond de la
   page. Le masque s'applique à la boîte de l'image, donc il suit sa taille à
   toutes les largeurs.

   `drop-shadow` et non `box-shadow` : l'ombre suit la silhouette détourée.
   `--shadow` change avec le thème (voir globals.css).

   `preload` : sur mobile, c'est la première image de la page, donc le
   candidat LCP. (`priority` est déprécié depuis Next 16.)
   ══════════════════════════════════════════════════════════════════════════ */

export default function HeroCaptain() {
  return (
    <div className="relative h-[380px] overflow-hidden rounded-t-[2rem] bg-[radial-gradient(130%_95%_at_100%_0%,var(--brand-veil)_0%,transparent_80%)] lg:h-full lg:min-h-[620px]">
      {/* `z-[2]` : la barre passe dessous (commit suivant), les icônes en
          orbite passent devant ou derrière selon leur position. */}
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
    </div>
  );
}
