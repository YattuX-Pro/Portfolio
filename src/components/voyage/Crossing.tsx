"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { SEA, VOYAGE, type SeaPlane } from "./config";

/* ══════════════════════════════════════════════════════════════════════════
   LA TRAVERSÉE — la mer entre deux escales, et le navire qui la passe.

   Une bande pleine largeur, dans le flux de la page : c'est l'espace
   RÉSERVÉ au navire. Il n'en sort pas (`overflow-hidden`), donc il ne passe
   jamais sur un texte, une carte ou un bouton. Pas d'épinglage : la
   traversée dure le temps que la bande met à traverser l'écran, aucun
   scroll à vide pour attendre un titre.

   Les plans, du fond vers l'avant :
   1. le ciel — rien : c'est le fond de la page, la section précédente s'y
      prolonge sans bord ;
   2. le repère à l'horizon, qui annonce l'escale suivante ;
   3. la mer (`SEA` dans config.ts) : des plans de houle de plus en plus
      amples, marqués et rapides vers l'avant — c'est la perspective ;
   4. le navire et son sillage ;
   5. le rivage : une dernière vague remplie en `--bg`, qui cache la quille
      et d'où l'escale suivante sort sans bord.

   Aucune couleur nouvelle : la mer est tracée avec les tokens des bordures,
   le trait de crête est celui de la ligne de houle (`WaveRule`). Seule
   l'illustration du navire garde ses couleurs.

   Tout le mouvement passe par des MotionValues dérivées (`useTransform`) :
   AUCUN rendu React par frame, même schéma que l'orbite du hero. La boucle
   `requestAnimationFrame` du tangage ne tourne que pendant que la bande est
   à l'écran. Réglages : `config.ts`.
   ══════════════════════════════════════════════════════════════════════════ */

/* Chaque plan est dessiné en px sur une largeur fixe, puis décalé modulo sa
   longueur d'onde : la houle défile sans couture et garde la même forme sur
   toutes les largeurs (même principe que `WaveRule`). */
const SPAN = 2880;
const LAYER_H = 640;

function wavePaths(wl: number, amp: number) {
  const base = amp + 2;
  const half = wl / 2;
  let crest = `M0 ${base} Q${half / 2} ${base - amp * 2} ${half} ${base}`;
  let end = half;
  while (end < SPAN + wl) {
    end += half;
    crest += ` T${end} ${base}`;
  }
  return { crest, area: `${crest} L${end} ${LAYER_H} L0 ${LAYER_H} Z` };
}

const PLANES = SEA.map((plane) => ({ ...plane, ...wavePaths(plane.wl, plane.amp) }));

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

type Drive = {
  progress: MotionValue<number>;
  scrollY: MotionValue<number>;
  time: MotionValue<number>;
  k: MotionValue<number>;
};

function SeaLayer({
  plane,
  drive,
  still,
}: {
  plane: SeaPlane & { crest: string; area: string };
  drive: Drive;
  still: boolean;
}) {
  const x = useTransform([drive.scrollY, drive.time, drive.k], ([sy, t, k]: number[]) =>
    -((sy * plane.flow * k + t * plane.drift) % plane.wl),
  );
  const y = useTransform([drive.progress, drive.k], ([p, k]: number[]) => plane.parallax * k * (p - 0.5));

  return (
    <motion.svg
      width={SPAN + plane.wl}
      height={LAYER_H}
      className={`absolute left-0 ${plane.desktop ? "hidden sm:block" : ""}`}
      style={{ top: `${plane.top}%`, ...(still ? {} : { x, y }) }}
    >
      {plane.fill ? (
        <path
          d={plane.area}
          className={plane.fill === "bg" ? "fill-bg" : "fill-line"}
          fillOpacity={plane.fillOpacity}
        />
      ) : null}
      <path
        d={plane.crest}
        fill="none"
        strokeWidth={1.5}
        strokeOpacity={plane.strokeOpacity}
        className="stroke-line-strong"
      />
    </motion.svg>
  );
}

export default function Crossing({ to, cap }: { to: string; cap: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(ref, { margin: "200px 0px" });

  /* Progression locale : 0 quand le haut de la bande touche le bas de
     l'écran, 1 quand son bas quitte le haut. La mer la suit au pixel ; le
     navire la suit à travers un ressort, qui lui donne du poids. */
  const { scrollYProgress } = useScroll({ target: ref, offset: [[0, 1], [1, 0]] });
  const { scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, VOYAGE.ship.spring);
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 60, damping: 20 });

  /* Temps du tangage et de la houle au repos, en secondes. */
  const time = useMotionValue(0);
  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      time.set(time.get() + (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, time]);

  /* Intensité : 1 en desktop, `VOYAGE.compact` sur téléphone. Une
     MotionValue plutôt qu'un state : les transformations la lisent sans
     être recréées. */
  const k = useMotionValue(1);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => k.set(mq.matches ? VOYAGE.compact : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [k]);

  const drive: Drive = { progress: scrollYProgress, scrollY, time, k };

  const S = VOYAGE.ship;
  const shipX = useTransform(progress, (p) => `${(S.from + (S.to - S.from) * smooth(p)) * 100}%`);
  const shipY = useTransform([progress, time, k], ([p, t, kk]: number[]) =>
    VOYAGE.shipParallax * kk * (p - 0.5) +
    S.dip * Math.sin(Math.PI * clamp01(p)) +
    S.bobPx * kk * Math.sin((2 * Math.PI * t) / S.bobPeriod),
  );
  const shipScale = useTransform(
    progress,
    (p) => S.scale[0] + (S.scale[1] - S.scale[0]) * Math.sin(Math.PI * clamp01(p)),
  );
  const shipRotate = useTransform([progress, time, velocity, k], ([p, t, v, kk]: number[]) => {
    const phase = S.pitch[0] + (S.pitch[1] - S.pitch[0]) * smooth(p);
    const bob = S.bobDeg * kk * Math.sin((2 * Math.PI * t) / S.bobPeriod + 1.1);
    const heel = S.heelMax * Math.max(-1, Math.min(1, v / S.velocityForMax));
    return phase + bob + heel;
  });
  const wakeScale = useTransform(
    velocity,
    (v) => VOYAGE.wake.rest + (VOYAGE.wake.max - VOYAGE.wake.rest) * Math.min(1, Math.abs(v) / S.velocityForMax),
  );
  const wakeOpacity = useTransform(velocity, (v) => 0.45 + 0.45 * Math.min(1, Math.abs(v) / S.velocityForMax));
  const capY = useTransform([scrollYProgress, k], ([p, kk]: number[]) => SEA[0].parallax * kk * (p - 0.5));

  return (
    /* `--ship-w` : largeur du navire, et longueur retirée de sa course pour
       qu'il ne soit jamais coupé par le bord. Hauteurs en `svh`, plafonnées :
       la bande reste une transition, pas un écran de plus. */
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none relative h-[clamp(220px,34svh,290px)] overflow-hidden select-none [--ship-w:clamp(180px,30svh,240px)] sm:h-[clamp(260px,38svh,360px)] sm:[--ship-w:clamp(220px,33svh,300px)] lg:h-[clamp(320px,46svh,440px)] lg:[--ship-w:clamp(280px,40svh,380px)]"
    >
      {/* Le repère : il annonce l'escale suivante, à l'horizon, du côté où
          va le navire. Décoratif — le titre de la section reste le seul
          intitulé lu par un lecteur d'écran. */}
      <motion.p className="meta absolute right-5 top-[9%] sm:right-10" style={reduced ? undefined : { y: capY }}>
        <span className="hidden sm:inline">{cap} · </span>
        <span className="text-ink">{to}</span>
      </motion.p>

      {PLANES.filter((p) => !p.front).map((plane) => (
        <SeaLayer key={plane.top} plane={plane} drive={drive} still={reduced} />
      ))}

      {/* Le navire. La piste fait la largeur de la bande moins celle du
          navire : un `x` en % de la piste le mène d'un bord à l'autre. */}
      <div className="absolute inset-y-0 left-0 right-(--ship-w)">
        <motion.div className="absolute inset-0" style={{ x: reduced ? "50%" : shipX }}>
          <motion.div
            className="absolute bottom-[9%] left-0 w-(--ship-w) origin-[50%_82%]"
            style={reduced ? { rotate: -1 } : { y: shipY, scale: shipScale, rotate: shipRotate }}
          >
            {/* Sillage : trois traits derrière la poupe, qui s'allongent
                quand on scrolle vite. */}
            {reduced ? null : (
              <motion.svg
                viewBox="0 0 120 24"
                className="absolute bottom-[17%] right-[88%] w-[46%] origin-right"
                style={{ scaleX: wakeScale, opacity: wakeOpacity }}
              >
                <path d="M118 6 Q90 2 60 7 T0 6" fill="none" strokeWidth="1.5" className="stroke-line-strong" />
                <path d="M118 13 Q84 10 50 14 T4 13" fill="none" strokeWidth="1.5" className="stroke-line-strong" />
                <path d="M116 20 Q92 18 66 21 T20 20" fill="none" strokeWidth="1.2" className="stroke-line-strong" />
              </motion.svg>
            )}
            <Image
              src="/pirate/navire.png"
              alt=""
              width={1000}
              height={668}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 300px, 240px"
              className="relative h-auto w-full"
              style={{ filter: "drop-shadow(0 14px 18px var(--shadow))" }}
            />
          </motion.div>
        </motion.div>
      </div>

      {PLANES.filter((p) => p.front).map((plane) => (
        <SeaLayer key={plane.top} plane={plane} drive={drive} still={reduced} />
      ))}
    </div>
  );
}
