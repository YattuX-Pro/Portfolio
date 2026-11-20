"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { motion, useReducedMotion, useTime, useTransform } from "framer-motion";
import Reveal from "@/components/Reveal";

/* En-tête de section : numéro en mono + titre.
   Le numéro en rouge accent est le seul rappel de couleur ici. */

/** Illustration facultative, posée en face du titre.
    `width`/`height` sont les dimensions INTRINSÈQUES du fichier, pas la taille
    d'affichage : `next/image` en a besoin pour réserver la place avant le
    chargement, sinon la page saute à l'arrivée de chaque image. */
export type SectionIllustration = {
  src: string;
  /** Variante à encre claire, pour le mode sombre (dessins au trait). */
  srcDark?: string;
  width: number;
  height: number;
  /** Illustrations pirates : largeur d'affichage sur téléphone puis à partir
      de 768 px. Présente, elle rend l'image visible à TOUTES les largeurs,
      sous le texte sur téléphone. */
  display?: { mobile: number; desktop: number };
  /** Inclinaison fixe, en degrés : une carte posée de biais sur la table. */
  tilt?: number;
  /** Flotte sur l'eau (la bouteille). */
  float?: boolean;
};

/* La bouteille qui flotte : montée et descente de ±6 px et roulis de ±3°
   autour de -8°, en sinus. Piloté par `useTime`, donc sans rendu React ; figé
   sous mouvement réduit. C'est l'une des animations continues listées dans
   CLAUDE.md, et la seule hors du hero. */
function Floating({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const time = useTime();
  const y = useTransform(time, (ms) => Math.sin(ms / 900) * 6);
  const rotate = useTransform(time, (ms) => -8 + Math.sin(ms / 1100) * 3);
  return (
    <motion.div style={reduced ? { rotate: -8 } : { y, rotate }}>{children}</motion.div>
  );
}

export default function SectionHeader({
  num,
  label,
  title,
  intro,
  illustration,
}: {
  num: string;
  label: string;
  title: string;
  intro?: string;
  illustration?: SectionIllustration;
}) {
  return (
    <header className="mb-12 sm:mb-14">
      {/* La grille n'existe QUE s'il y a une illustration : sans elle, l'en-tête
          reste le bloc de texte simple qu'il a toujours été, et les sections
          sans image ne changent pas d'un pixel. */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
        <div className={illustration ? "md:col-span-8" : "md:col-span-12"}>
          <Reveal>
            <p className="meta">
              <span className="text-brand">{num}</span>
              <span aria-hidden className="mx-2 text-line-strong">
                /
              </span>
              {label}
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h2
              className="font-semibold tracking-[-0.03em] leading-[1.05] text-ink mt-4"
              style={{ fontSize: "clamp(26px, 5vw, 46px)" }}
            >
              {title}
            </h2>
          </Reveal>

          {intro && (
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-prose text-[18px] leading-[1.7] text-ink-muted">
                {intro}
              </p>
            </Reveal>
          )}
        </div>

        {/* ── L'illustration ────────────────────────────────────────────────
            `hidden md:flex` : elle ne descend pas sous 768px. Ce n'est pas de
            l'économie de bande passante, c'est le cadrage — sous cette
            largeur il n'y a plus de « côté droit » à remplir, l'image
            passerait au-dessus du titre et retarderait la seule chose qu'on
            vient lire. Le vide qu'elle comble n'existe qu'à partir du moment
            où le texte cesse d'occuper la ligne entière.

            `alt=""` et rien d'autre : elle ne porte aucune information que le
            titre ne dise déjà. Un texte alternatif ici ferait lire deux fois
            la même chose à un lecteur d'écran.

            Le retard de 0,18 s la fait entrer APRÈS le titre et son intro
            (0 / 0,06 / 0,12) : elle ponctue la phrase, elle ne l'annonce pas. */}
        {illustration?.display ? (
          /* ── Illustration pirate ─────────────────────────────────────────
              Contrairement aux dessins au trait plus bas, elle reste sur
              téléphone : c'est elle qui porte le thème. Elle y passe SOUS le
              texte (ordre du DOM), donc ne retarde pas ce qu'on vient lire.

              Peinte en couleurs naturelles, elle n'a pas de variante sombre.
              L'ombre portée suit sa silhouette et `--shadow` change avec le
              thème. `max-w-full` : 340 px de carte dans une colonne de 4/12
              qui peut en faire moins. */
          <div className="flex md:col-span-4 md:justify-end">
            <Reveal preset="in" delay={0.18}>
              <div
                style={
                  {
                    "--illus-m": `${illustration.display.mobile}px`,
                    "--illus-d": `${illustration.display.desktop}px`,
                    rotate: illustration.tilt ? `${illustration.tilt}deg` : undefined,
                    filter: "drop-shadow(0 18px 24px var(--shadow))",
                  } as CSSProperties
                }
                className="w-(--illus-m) max-w-full md:w-(--illus-d)"
              >
                {illustration.float ? (
                  <Floating>
                    <Image
                      src={illustration.src}
                      alt=""
                      width={illustration.width}
                      height={illustration.height}
                      sizes={`(min-width: 768px) ${illustration.display.desktop}px, ${illustration.display.mobile}px`}
                      className="h-auto w-full"
                    />
                  </Floating>
                ) : (
                  <Image
                    src={illustration.src}
                    alt=""
                    width={illustration.width}
                    height={illustration.height}
                    sizes={`(min-width: 768px) ${illustration.display.desktop}px, ${illustration.display.mobile}px`}
                    className="h-auto w-full"
                  />
                )}
              </div>
            </Reveal>
          </div>
        ) : illustration?.srcDark ? (
          <div className="hidden md:col-span-4 md:flex md:justify-end">
            <Reveal preset="in" delay={0.18}>
              {/* DEUX fichiers, permutés par `dark:` et non par un état React.

                  Les illustrations sont de l'encre sombre sur fond
                  transparent : sur l'anthracite du mode sombre il ne resterait
                  que le rouge flottant dans le noir. La variante `-dark` est
                  le même dessin à l'encre claire (`assets/normalise.py`).

                  Permuter la `src` selon le thème aurait demandé un état
                  client, donc un rendu serveur qui ignore le thème et une
                  image fausse pendant l'hydratation. En CSS, `.dark` est déjà
                  sur <html> avant le premier rendu, et rien ne clignote.

                  Le fichier caché n'est PAS téléchargé : `next/image` pose
                  `loading="lazy"`, et une image en `display:none` n'entre
                  jamais dans le viewport. Le second thème ne coûte donc rien
                  à qui ne l'utilise pas. */}
              <Image
                src={illustration.src}
                alt=""
                width={illustration.width}
                height={illustration.height}
                sizes="180px"
                className="w-[180px] h-auto dark:hidden"
              />
              <Image
                src={illustration.srcDark}
                alt=""
                width={illustration.width}
                height={illustration.height}
                sizes="180px"
                className="w-[180px] h-auto hidden dark:block"
              />
            </Reveal>
          </div>
        ) : null}
      </div>
    </header>
  );
}
