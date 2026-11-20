"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { VOYAGE } from "./config";

/* ══════════════════════════════════════════════════════════════════════════
   LA TRAVERSÉE — une scène plein écran entre deux escales.

   Un conteneur haut de `VOYAGE.length` svh, et dedans un écran ÉPINGLÉ
   (`sticky`) : pendant qu'on scrolle, la page s'arrête sur l'océan.

   La chorégraphie, sur la progression locale (`VOYAGE.phases`) :
   1. un voile couleur de page se lève sur un océan peint — de nuit en mode
      sombre, à l'aube en mode clair (`public/pirate/mer-*.jpg`) ;
   2. la caméra avance lentement dans le décor ;
   3. le navire apparaît à l'horizon, minuscule, et vient vers nous en
      grossissant de plus en plus vite (perspective), avant de sortir du
      cadre au ras de la caméra ;
   4. le nom de l'escale suivante sort de la brume, en très grand ;
   5. le voile retombe : la scène se fond dans la page, et l'escale arrive.

   Pendant tout ce temps : la brume dérive, l'astre pulse, l'eau scintille
   (canvas), le navire tangue.

   Rien ici ne masque le contenu : la scène est un espace à part entière
   entre deux sections. Pas de scroll-snap, pas de blocage : c'est le scroll
   natif qui pilote, et une ancre qui saute par-dessus arrive directement
   dans le bon état — tout découle de la position.

   Décorative de bout en bout (`aria-hidden`) : le nom géant double le vrai
   titre de la section, qui reste le seul lu par un lecteur d'écran.

   Performance : MotionValues uniquement, aucun rendu React par frame. Une
   seule boucle `requestAnimationFrame` par traversée (temps du tangage, de
   la brume et des reflets), active seulement quand la scène est à l'écran.
   ══════════════════════════════════════════════════════════════════════════ */

type Range = readonly [number, number];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (v: number, [a, b]: Range) => clamp01((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const { phases: PH, ship: SHIP, camera: CAM } = VOYAGE;

/* Position de l'astre et de l'horizon dans les deux décors peints, en %. */
const SUN = { x: 58.6, y: 20.5 };
const HORIZON = 49;

/* Le brouillard : deux nappes elliptiques couleur de page, répétées tous
   les 100vw sur une bande deux fois plus large que l'écran. La décaler d'une
   tuile la fait boucler sans couture. */
const FOG: CSSProperties = {
  backgroundImage:
    "radial-gradient(ellipse 24% 46% at 22% 50%, var(--bg) 0%, transparent 72%), radial-gradient(ellipse 30% 40% at 68% 58%, var(--bg) 0%, transparent 72%)",
  backgroundSize: "50% 100%",
  backgroundRepeat: "repeat-x",
};

function Fog({
  className,
  time,
  speed,
  opacity,
  still,
}: {
  className: string;
  time: MotionValue<number>;
  speed: number;
  opacity: MotionValue<number> | number;
  still: boolean;
}) {
  const x = useTransform(time, (t) => `${-((t * speed) % 1) * 50}%`);
  return (
    <motion.div
      className={`absolute left-0 w-[200%] ${className}`}
      style={{ ...FOG, opacity, ...(still ? {} : { x }) }}
    />
  );
}

/* ── Les reflets ──────────────────────────────────────────────────────────
   Des éclats sur le chemin de lumière que l'astre trace sur l'eau — plus
   gros et plus espacés vers le bas, c'est la perspective —, plus quelques
   poussières lumineuses qui montent dans l'air. Canvas, redessiné à chaque
   tic du temps de la scène ; la couleur vient de `--sea-glint`, relue quand
   le thème change. */
type Speck = { x: number; y: number; r: number; speed: number; phase: number };

function Sparkles({ time, presence }: { time: MotionValue<number>; presence: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef<{ glints: Speck[]; motes: Speck[]; color: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const compact = window.matchMedia("(max-width: 639px)").matches;
    const n = compact ? VOYAGE.sparkles.mobile : VOYAGE.sparkles.desktop;
    const glints = Array.from({ length: n }, () => {
      const depth = Math.pow(Math.random(), 0.8); // plus dense près de l'horizon
      const spread = 0.025 + depth * 0.3;
      return {
        x: SUN.x / 100 + (Math.random() - 0.5) * 2 * spread * Math.random(),
        y: HORIZON / 100 + 0.01 + depth * 0.5,
        r: 0.5 + depth * 2.4,
        speed: 1.5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
      };
    });
    const motes = Array.from({ length: VOYAGE.sparkles.motes }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.2,
      speed: 0.004 + Math.random() * 0.01,
      phase: Math.random() * Math.PI * 2,
    }));
    const readColor = () => getComputedStyle(canvas).getPropertyValue("--sea-glint").trim() || "white";
    state.current = { glints, motes, color: readColor(), w: 0, h: 0 };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (state.current) Object.assign(state.current, { w: width, h: height });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      if (state.current) state.current.color = readColor();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  useMotionValueEvent(time, "change", (t) => {
    const s = state.current;
    const ctx = ref.current?.getContext("2d");
    if (!s || !ctx) return;
    ctx.clearRect(0, 0, s.w, s.h);
    const k = presence.get();
    if (k <= 0.01) return;
    ctx.fillStyle = s.color;
    for (const g of s.glints) {
      const a = Math.pow(Math.max(0, Math.sin(t * g.speed + g.phase)), 4) * k;
      if (a < 0.02) continue;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.ellipse(g.x * s.w, g.y * s.h, g.r * 2.4, g.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const m of s.motes) {
      const y = (((m.y - t * m.speed) % 1) + 1) % 1;
      if (y > HORIZON / 100) continue; // dans l'air seulement
      ctx.globalAlpha = (0.2 + 0.4 * Math.sin(t * 0.8 + m.phase) ** 2) * k;
      ctx.beginPath();
      ctx.arc((m.x + Math.sin(t * 0.3 + m.phase) * 0.01) * s.w, y * s.h, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });

  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}

export default function Crossing({ to, cap, num }: { to: string; cap: string; num: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(ref, { margin: "100px 0px" });

  const { scrollYProgress: p } = useScroll({ target: ref, offset: [[0, 1], [1, 0]] });
  /* Le navire suit la progression à travers un ressort : il a du poids, et
     les crans de la molette ne le font pas sauter. */
  const ps = useSpring(p, { stiffness: 120, damping: 28, mass: 0.6 });

  /* Temps de la scène, en secondes : une seule boucle, active à l'écran. */
  const time = useMotionValue(0);
  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      time.set(time.get() + Math.min(0.1, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, time]);

  /* Voile : opaque à l'entrée, levé pendant le voyage, retombé à la sortie. */
  const veil = useTransform(p, (v) => Math.max(1 - ramp(v, PH.reveal), ramp(v, PH.close)));
  const presence = useTransform(veil, (v) => 1 - v);

  const camScale = useTransform(p, (v) => lerp(CAM.scale[0], CAM.scale[1], smooth(ramp(v, [0.1, 0.9]))));
  const camY = useTransform(p, (v) => `${-CAM.rise * smooth(ramp(v, [0.1, 0.9]))}%`);
  const glow = useTransform(time, (t) => 0.7 + 0.3 * Math.sin(t * 0.9));

  /* Le navire : `k` porte la perspective — lent au loin, de plus en plus
     vite en approchant. */
  const k = useTransform(ps, (v) => Math.pow(ramp(v, PH.sail), SHIP.perspective));
  const shipX = useTransform(k, (t) => `${lerp(SHIP.from.x, SHIP.to.x, t) * 100}%`);
  const shipY = useTransform(k, (t) => `${lerp(SHIP.from.y, SHIP.to.y, t) * 100}%`);
  const shipScale = useTransform(k, (t) => lerp(SHIP.from.scale, SHIP.to.scale, t));
  const shipOpacity = useTransform(ps, (v) => ramp(v, [PH.sail[0], PH.sail[0] + 0.03]));
  const shipRotate = useTransform([ps, time], ([v, t]: number[]) =>
    lerp(SHIP.pitch[0], SHIP.pitch[1], ramp(v, PH.sail)) +
    SHIP.bobDeg * Math.sin((2 * Math.PI * t) / SHIP.bobPeriod + 1.1),
  );
  const shipBob = useTransform(time, (t) => SHIP.bobPx * Math.sin((2 * Math.PI * t) / SHIP.bobPeriod));

  /* Le nom de l'escale : il sort de la brume — lettres qui se resserrent,
     flou qui se dissipe — pendant que la brume basse s'épaissit. */
  const tp = useTransform(p, (v) => smooth(ramp(v, PH.title)));
  const titleY = useTransform(tp, (t) => (1 - t) * 50);
  const titleSpacing = useTransform(tp, (t) => `${lerp(0.3, -0.035, t)}em`);
  const titleBlur = useTransform(tp, (t) => `blur(${(1 - t) * 14}px)`);
  const lowFog = useTransform(p, (v) => 0.3 + 0.6 * ramp(v, [PH.title[0] - 0.04, PH.title[1]]));

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none relative h-(--len-m) select-none sm:h-(--len) motion-reduce:h-[85svh]"
      style={{ "--len": `${VOYAGE.length.desktop}svh`, "--len-m": `${VOYAGE.length.mobile}svh` } as CSSProperties}
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-full [--ship-w:min(118vw,560px)] sm:[--ship-w:min(82vw,760px)] lg:[--ship-w:min(62vw,940px)]">
        {/* ── Le décor, et la caméra qui y avance ─────────────────────── */}
        <motion.div
          className="absolute inset-0 origin-[58%_49%]"
          style={reduced ? undefined : { scale: camScale, y: camY }}
        >
          <Image
            src="/pirate/mer-aube.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[58%_50%] dark:hidden"
          />
          <Image
            src="/pirate/mer-nuit.jpg"
            alt=""
            fill
            sizes="100vw"
            className="hidden object-cover object-[58%_50%] dark:block"
          />
          {/* Halo de l'astre, qui respire. */}
          <motion.div
            className="absolute left-[58.6%] top-[20.5%] size-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--sea-glow)_0%,transparent_62%)] mix-blend-screen"
            style={reduced ? undefined : { opacity: glow }}
          />
        </motion.div>

        {reduced ? null : <Sparkles time={time} presence={presence} />}

        {/* Brume de l'horizon, derrière le navire. */}
        <Fog
          className="top-[37%] hidden h-[24%] sm:block"
          time={time}
          speed={VOYAGE.fog.drift[0]}
          opacity={0.5}
          still={reduced}
        />

        {/* ── Le navire ──────────────────────────────────────────────────
            Trois étages : le point de flottaison (x, y en % de l'écran),
            l'ancrage de l'image sur ce point (coque à 84 % de sa hauteur),
            puis l'échelle, l'assiette et le tangage autour de lui. Le bas
            de la coque se fond dans l'eau (`mask-image`) au lieu d'y être
            posé comme un découpage. */}
        <motion.div
          className="absolute inset-0"
          /* Mouvement réduit : une image fixe, le navire au milieu de la mer,
             sous le titre remonté dans le ciel — ils ne se chevauchent pas. */
          style={reduced ? { x: "50%", y: "82%" } : { x: shipX, y: shipY, opacity: shipOpacity }}
        >
          <div className="absolute left-0 top-0 w-(--ship-w) -translate-x-1/2 -translate-y-[84%]">
            <motion.div
              className="origin-[50%_84%]"
              style={reduced ? { scale: 0.5, rotate: -1 } : { scale: shipScale, rotate: shipRotate, y: shipBob }}
            >
              {/* Écume sous la coque, et sillage derrière la poupe. */}
              <div className="absolute left-[6%] right-[2%] top-[76%] h-[14%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,var(--sea-foam)_0%,transparent_70%)]" />
              <div className="absolute right-[86%] top-[79%] h-[8%] w-[80%] rounded-[50%] bg-[radial-gradient(ellipse_at_right,var(--sea-foam)_0%,transparent_70%)] opacity-70" />
              <Image
                src="/pirate/navire.png"
                alt=""
                width={1000}
                height={668}
                sizes="(min-width: 1024px) 940px, (min-width: 640px) 760px, 560px"
                /* De nuit, le navire passe sous la lune : moins de lumière et
                   de couleur, sinon son éclairage de studio, chaud, le
                   détache du décor comme un collage. */
                className="relative h-auto w-full dark:brightness-[0.62] dark:saturate-[0.6]"
                style={{
                  maskImage: "linear-gradient(to bottom, #000 79%, transparent 94%)",
                  WebkitMaskImage: "linear-gradient(to bottom, #000 79%, transparent 94%)",
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Brume basse, devant le navire : c'est d'elle que sort le titre. */}
        <Fog
          className="top-[58%] h-[50%]"
          time={time}
          speed={VOYAGE.fog.drift[1]}
          opacity={reduced ? 0.5 : lowFog}
          still={reduced}
        />

        {/* Fondus haut et bas : sous la navbar, et aux deux instants où un
            bord de la scène traverse l'écran (entrée, sortie), la mer ne
            s'arrête jamais sur une ligne nette. */}
        <div className="absolute inset-x-0 top-0 h-[14%] bg-linear-to-b from-bg to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[10%] bg-linear-to-t from-bg to-transparent" />

        {/* Le voile : la scène naît de la page et y retourne. */}
        {reduced ? null : <motion.div className="absolute inset-0 bg-bg" style={{ opacity: veil }} />}

        {/* ── Le nom de l'escale suivante ─────────────────────────────── */}
        <motion.div
          className="absolute inset-x-0 top-[56%] -translate-y-1/2 px-5 text-center motion-reduce:top-[34%]"
          style={reduced ? undefined : { opacity: tp, y: titleY }}
        >
          <p className="meta">
            Escale {num} · {cap}
          </p>
          <motion.p
            className="mt-3 font-display font-semibold leading-[0.9] text-ink"
            style={{
              fontSize: "clamp(64px, 15vw, 230px)",
              ...(reduced ? { letterSpacing: "-0.035em" } : { letterSpacing: titleSpacing, filter: titleBlur }),
            }}
          >
            {to}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
