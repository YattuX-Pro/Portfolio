"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* ══════════════════════════════════════════════════════════════════════════
   LE STACK EN ORBITE — six icônes pirates qui tournent autour du capitaine.

   Un anneau INCLINÉ (-14°) autour du torse, un tour en 36 s. La moitié basse
   de l'anneau passe DEVANT l'avatar : icônes plus grandes et pleinement
   opaques, `z-index` au-dessus du sien. La moitié haute passe DERRIÈRE :
   plus petites, un peu estompées, sous lui. La bascule se fait aux deux
   extrémités de l'anneau, sur les côtés, là où une icône ne recouvre jamais
   l'avatar — le changement de plan ne se voit donc pas.

   Par-dessus : une légère houle (±4 px) et un roulis (±6°), chacun déphasé
   par icône pour que l'ensemble ne bouge jamais en bloc ; et une entrée en
   cascade (apparition + grossissement) au montage.

   ── Pourquoi des MotionValue et pas un état React ─────────────────────────
   La position change à chaque frame. Un `setState` par frame re-rendrait le
   hero entier soixante fois par seconde. Ici, UNE `MotionValue` de temps est
   avancée par `requestAnimationFrame`, et chaque icône en dérive ses
   transformations par `useTransform` : Framer écrit les styles directement,
   React ne re-rend rien. rAF et non `setInterval` : le navigateur suspend la
   boucle quand l'onglet est caché.

   ── Géométrie ──────────────────────────────────────────────────────────────
   L'anneau est calé sur la boîte de l'AVATAR, pas sur celle de la colonne :
   sur tablette la colonne fait 700 px de large pour 380 de haut, et un
   anneau proportionnel à la colonne aurait envoyé les icônes loin du
   capitaine. La taille de la colonne est lue par un `ResizeObserver` et
   stockée dans une `MotionValue` elle aussi — aucune lecture de ref au rendu.

   Décoratif de bout en bout : `aria-hidden`, `alt=""`, `pointer-events-none`.
   La section Expertise porte la même information en texte.
   ══════════════════════════════════════════════════════════════════════════ */

const ICONS = [
  "/pirate/stack/dotnet.png",
  "/pirate/stack/angular.png",
  "/pirate/stack/react.png",
  "/pirate/stack/postgres.png",
  "/pirate/stack/docker.png",
  "/pirate/stack/csharp.png",
];

const TURN_S = 36;
const TILT = (-14 * Math.PI) / 180;
/* Rapport largeur / hauteur de `capitaine.png` (833 × 1000). */
const CAPTAIN_RATIO = 0.833;
/* Écart entre le haut de la colonne et celui de l'avatar (`top-3 lg:top-4`). */
const CAPTAIN_TOP = 14;
/* Mouvement réduit : le temps est figé à une valeur où l'entrée est jouée. */
const STILL_T = 10;

type Box = { w: number; h: number };

/* Tout le placement d'une icône, pour un instant `s` (en secondes). */
function place(s: number, i: number, box: Box) {
  const capW = Math.min(box.w, (box.h - CAPTAIN_TOP) * CAPTAIN_RATIO);
  const capH = capW / CAPTAIN_RATIO;
  const size = Math.min(92, Math.max(52, capW * 0.2));

  /* Centre de l'anneau : à 40 % de la hauteur de l'avatar, depuis son haut
     (l'avatar est posé sur le bas de la colonne). */
  const cy = box.h - capH + capH * 0.4;
  const rx = Math.min(capW * 0.43, box.w / 2 - size / 2 - 4);
  const ry = capH * 0.13;

  const a = (s * 2 * Math.PI) / TURN_S + (i * Math.PI) / 3 + 0.5;
  const px = rx * Math.cos(a);
  const py = ry * Math.sin(a);
  const X = px * Math.cos(TILT) - py * Math.sin(TILT);
  const Y = px * Math.sin(TILT) + py * Math.cos(TILT) + Math.sin(s / 1.1 + i) * 4;

  /* 0 = au fond de l'anneau, 1 = tout devant. */
  const depth = (Math.sin(a) + 1) / 2;
  const p = Math.min(1, Math.max(0, (s * 1000 - 300 - i * 140) / 700));
  const enter = 1 - Math.pow(1 - p, 3);

  return {
    size,
    x: box.w / 2 + X - size / 2,
    y: cy + Y - size / 2,
    scale: (0.72 + 0.36 * depth) * (0.6 + 0.4 * enter),
    opacity: box.w === 0 ? 0 : enter * (0.7 + 0.3 * depth),
    rotate: Math.sin(s / 1.5 + i) * 6,
    /* L'avatar est à `z-[2]`. */
    zIndex: Math.sin(a) > 0 ? 3 : 1,
  };
}

function OrbitIcon({
  src,
  index,
  inputs,
}: {
  src: string;
  index: number;
  /** [temps, largeur de la colonne, hauteur de la colonne] */
  inputs: MotionValue<number>[];
}) {
  const at =
    (key: keyof ReturnType<typeof place>) =>
    ([s, w, h]: number[]) =>
      place(s, index, { w, h })[key];

  /* Une `useTransform` par propriété : chacune ne recalcule que quand le
     temps ou la boîte changent, et Framer applique le résultat sans rendu. */
  const x = useTransform(inputs, at("x"));
  const y = useTransform(inputs, at("y"));
  const size = useTransform(inputs, at("size"));
  const scale = useTransform(inputs, at("scale"));
  const opacity = useTransform(inputs, at("opacity"));
  const rotate = useTransform(inputs, at("rotate"));
  const zIndex = useTransform(inputs, at("zIndex"));

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{
        x,
        y,
        width: size,
        height: size,
        scale,
        opacity,
        rotate,
        zIndex,
        filter: "drop-shadow(0 10px 14px var(--shadow))",
      }}
    >
      <Image src={src} alt="" fill sizes="92px" className="object-contain" />
    </motion.div>
  );
}

export default function HeroOrbit() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const time = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  /* La taille de la colonne, suivie au redimensionnement. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      width.set(entry.contentRect.width);
      height.set(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  /* Le temps. Mouvement réduit : figé, l'entrée considérée comme jouée — les
     icônes restent posées sur l'anneau. */
  useEffect(() => {
    if (reduced) {
      time.set(STILL_T);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      time.set((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, time]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {ICONS.map((src, i) => (
        <OrbitIcon key={src} src={src} index={i} inputs={[time, width, height]} />
      ))}
    </div>
  );
}
