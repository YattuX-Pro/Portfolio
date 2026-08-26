"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

/* Flou neutre de secours, pour une image sans vignette en base — les entrées
   antérieures à la colonne `image_blur`, ou un échec de génération. Un seul
   pixel de la couleur de surface du site : étiré par next/image, il donne un
   voile chaud plutôt qu'un rectangle gris. */
const NEUTRAL_BLUR =
  "data:image/gif;base64,R0lGODlhAQABAPAAAP7+/P///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

/** Flou de départ. Franc sur un cadre de ~340px de haut, sans bouillie. */
const START_BLUR = "blur(16px)";

/**
 * Image de projet qui se dé-floute PROGRESSIVEMENT.
 *
 * `placeholder="blur"` de next/image ne suffit pas seul : il peint la
 * vignette en fond puis la retire d'un coup dès que l'image est prête — on
 * passe du flou au net sans transition. Ici le `filter` est porté par l'image
 * et animé vers 0 au chargement : le dé-floutage se voit.
 *
 * ⚠️ Le `filter` est posé en STYLE INLINE, et c'est le fruit de deux pièges
 * successifs, tous deux silencieux :
 *
 *  1. les utilitaires `blur-*` de Tailwind passent par la variable
 *     `--tw-blur`, que la v4 déclare `@property { syntax: "*" }`. Une
 *     propriété personnalisée sans type s'anime de façon DISCRÈTE : le
 *     navigateur refuse de l'interpoler, et le flou sautait de 16px à 0 d'un
 *     coup. La transition était bien déclarée, elle ne pouvait pas jouer ;
 *  2. réécrit en classe arbitraire (`[filter:blur(0px)]`), le minifieur CSS
 *     réduisait la déclaration à `filter:blur()`.
 *
 * En inline, la valeur arrive telle quelle dans le DOM — ni variable non
 * typée, ni minifieur entre les deux. `blur(0px)` et non `none` : `none`
 * n'est pas interpolable, il faut la même fonction de filtre des deux côtés.
 *
 * La transition étant en CSS, le bloc `prefers-reduced-motion` de globals.css
 * la réduit déjà à néant : l'image apparaît alors nette d'emblée.
 */
export default function ProjectImage({
  src,
  alt,
  blurDataURL,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  blurDataURL: string | null;
  sizes: string;
  /* Cadrage laissé à l'appelant : `object-top` pour les captures
     d'interface, dont un cadrage centré coupe l'en-tête. */
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  /* Une image déjà en cache est complète AVANT que React n'attache onLoad :
     l'évènement ne partirait jamais et l'image resterait floue pour toujours.
     On interroge donc `complete` à l'attachement.

     Un ref de rappel et non un effet : il s'exécute au même moment, mais
     `react-hooks/set-state-in-effect` interdit — à juste titre — de poser un
     état depuis un effet, qui provoque un second rendu. */
  const attach = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete) setLoaded(true);
  }, []);

  return (
    <Image
      ref={attach}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      placeholder="blur"
      blurDataURL={blurDataURL ?? NEUTRAL_BLUR}
      onLoad={() => setLoaded(true)}
      style={{
        filter: loaded ? "blur(0px)" : START_BLUR,
        opacity: loaded ? 1 : 0.85,
      }}
      className={`object-cover transition-[filter,opacity] duration-700 ease-soft ${className}`}
    />
  );
}
