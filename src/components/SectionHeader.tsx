"use client";

import Image from "next/image";
import Reveal from "@/components/Reveal";

/* En-tête de section : numéro en mono + titre.
   Le numéro en rouge accent est le seul rappel de couleur ici —
   le filet tricolore, lui, sert de séparateur entre les sections. */

/** Illustration facultative, posée en face du titre.
    `width`/`height` sont les dimensions INTRINSÈQUES du fichier, pas la taille
    d'affichage : `next/image` en a besoin pour réserver la place avant le
    chargement, sinon la page saute à l'arrivée de chaque image. */
export type SectionIllustration = {
  src: string;
  /** Variante à encre claire, pour le mode sombre. */
  srcDark: string;
  width: number;
  height: number;
};

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
        {illustration ? (
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
