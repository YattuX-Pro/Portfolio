"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Compteur qui grimpe de 0 à sa valeur, une seule fois, à l'entrée dans le
 * champ de vision.
 *
 * ⚠️ La valeur vient de la base sous forme de TEXTE LIBRE : « 5+ », « 3+ »,
 * « 10k », voire « Guinée ». On isole donc le préfixe numérique et on laisse
 * le reste intact — « 5+ » compte jusqu'à 5 puis réaffiche le « + ». Une
 * valeur sans chiffre en tête s'affiche telle quelle, sans animation : parser
 * plus agressivement aurait affiché « NaN » sur le site public au premier
 * libellé inattendu saisi depuis l'admin.
 *
 * `useReducedMotion` EN PLUS de MotionRoot : `animate()` est un appel
 * impératif, il ignore le `MotionConfig` de l'arbre. Sans ce test, un visiteur
 * ayant demandé moins de mouvement verrait quand même défiler les chiffres.
 *
 * Le déclenchement passe par un EFFET et non par le corps du rendu : lire
 * `ref.current` pendant le rendu est interdit par le compilateur React
 * (`react-hooks/refs`), et lancer une animation impérative y serait de toute
 * façon un effet de bord au mauvais endroit. Le `setState` vit dans le
 * callback `onUpdate`, appelé plus tard par la boucle d'animation — pas
 * synchronement dans l'effet.
 */
export default function AnimatedCounter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  /* Chiffres de tête, puis tout le reste. « 5+ » -> ["5", "+"] */
  const match = /^(\d+)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === null || reduced || !inView) return;

    const controls = animate(0, target, {
      duration: 1.2,
      /* `easeOut` : le compteur ralentit en approchant de la valeur, ce qui se
         lit comme un arrêt et non comme une coupure. */
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    /* Arrêt au démontage : sans ça, une animation en cours continuerait
       d'appeler setState sur un composant démonté. */
    return () => controls.stop();
  }, [inView, reduced, target]);

  if (target === null || reduced) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {/* `tabular-nums` : sans lui, la largeur du chiffre change à chaque
          incrément et tout ce qui suit tremble pendant l'animation. */}
      <span className="tabular-nums">{display}</span>
      {suffix}
    </span>
  );
}
