"use client";

import Image from "next/image";
import { motion, useReducedMotion, useTime, useTransform } from "framer-motion";

/* ══════════════════════════════════════════════════════════════════════════
   LA BOUSSOLE — en face du compteur d'ancienneté.

   Le compteur dit « en mer depuis 2022 » ; la boussole est l'instrument qui
   va avec. Posée seule à 96 px, première version, elle se perdait : elle
   est désormais dans un CADRAN, un disque qui reprend le fond des cartes
   (`--surface`) et leur bordure (`--line-strong`), avec :
   - une couronne de 72 graduations, comme le bord d'un compas ;
   - un « N » en rouge de marque — le même rouge que le point de
     « Yattara. » et la virgule du compteur ;
   - au centre, le voile `--brand-veil` du hero, pour que l'objet ressorte
     sur un fond doux plutôt que sur le vide ;
   - une légende mono, la latitude de Conakry.

   Le balancement est la seule animation : ±3° autour de -4°, une période de
   dix secondes, en sinus. Une aiguille qui se cherche, pas un objet qui
   tourne. Piloté par `useTime` (la boucle de frames de Framer), donc sans
   rendu React ; figé sous mouvement réduit.

   Tout est décoratif : le compteur et sa phrase `sr-only` portent
   l'information. D'où `aria-hidden` sur la figure entière.
   ══════════════════════════════════════════════════════════════════════════ */

export default function CompassDial({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const time = useTime();
  const sway = useTransform(time, (ms) => -4 + Math.sin(ms / 1000 / 1.6) * 3);

  return (
    <figure aria-hidden className={`m-0 flex flex-col items-center gap-2.5 ${className}`}>
      {/* En desktop le cadran suit la hauteur d'écran (16svh, 168 px au
          plus) : c'est l'élément le plus haut du bas du hero, qui doit tenir
          dans l'écran (voir HeroContent). La boussole garde ses proportions
          dans le cadran (`w-[93%]`, soit 104/112 et 156/168). */}
      <div className="relative flex size-[112px] items-center justify-center sm:size-[168px] lg:size-[min(168px,16svh)]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
          <circle cx="50" cy="50" r="49" strokeWidth="0.8" className="fill-surface stroke-line-strong" />
          <circle cx="50" cy="50" r="36" fill="var(--brand-veil)" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            strokeWidth="3"
            strokeDasharray="0.5 3.34"
            className="stroke-line-strong"
          />
          <text
            x="50"
            y="4.2"
            textAnchor="middle"
            fontSize="6"
            fontWeight="500"
            className="fill-brand font-mono"
          >
            N
          </text>
        </svg>

        <motion.div
          className="relative w-[93%]"
          style={{
            rotate: reduced ? -4 : sway,
            filter: "drop-shadow(0 14px 18px var(--shadow))",
          }}
        >
          <Image
            src="/pirate/boussole.png"
            alt=""
            width={420}
            height={384}
            sizes="(min-width: 640px) 156px, 104px"
            className="h-auto w-full"
          />
        </motion.div>
      </div>

      <figcaption className="meta whitespace-nowrap">Cap · 9°31′N</figcaption>
    </figure>
  );
}
