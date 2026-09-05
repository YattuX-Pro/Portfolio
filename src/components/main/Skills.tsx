"use client";

import { motion } from "framer-motion";
import Reveal, {
  DURATION,
  EASE,
  HOVER_LIFT,
  INTERACTION_TRANSITION,
  STAGGER,
} from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { TechGlyph } from "@/lib/tech-icons";
import type { SkillGroup } from "@/lib/db/queries";

/* La base stocke un NOM de token, jamais un hexadécimal : la palette reste
   pilotée par globals.css, et l'admin ne peut pas introduire une couleur
   hors charte ni un contraste insuffisant.
   Le jaune du drapeau est volontairement absent : à 1.41:1 il ne franchit
   pas le seuil de 3:1 exigé pour un élément graphique porteur de sens. */
const ACCENTS: Record<string, string> = {
  "flag-red": "var(--flag-red)",
  "flag-green": "var(--flag-green)",
  text: "var(--text)",
  muted: "var(--ink-muted)",
};

const accentOf = (token: string) => ACCENTS[token] ?? "var(--text)";

/* ── Expertise, en fiche technique ─────────────────────────────────────────
   La version précédente était quatre colonnes de listes, chaque outil sur sa
   ligne avec un filet de séparation. Résultat : un tableau. Des filets, des
   lignes régulières, une vignette par cellule — ça lisait comme un inventaire
   administratif, et les logos qu'on venait d'ajouter n'y gagnaient rien.

   Ici chaque catégorie est une LIGNE de fiche : son intitulé à gauche, en
   mono, et ses outils à droite en pastilles qui s'écoulent librement. Plus un
   seul filet horizontal entre les outils ; c'est le blanc qui sépare.

   Sur les pastilles : j'avais retiré celles de la stack des projets en les
   trouvant génériques. La différence est le contenu — une pastille avec un
   simple mot dedans est un badge de composant ; une pastille avec le LOGO de
   la technologie est un objet reconnaissable, qu'on lit à la forme avant de
   lire le texte. Le motif est le même, ce qu'il transporte ne l'est pas. */

export default function Skills({
  skills,
  method,
}: {
  skills: SkillGroup[];
  method: string | null;
}) {
  return (
    <>
      <SectionHeader
        num="01"
        label="Expertise"
        title="Ce que je construis, et avec quoi."
        intro="Une base back-end .NET et FastAPI, un front Angular et Next.js, et l'outillage DevOps qui va avec pour livrer, sécuriser et maintenir en production."
        illustration={{ src: "/illustrations/stack.png",
          srcDark: "/illustrations/stack-dark.png",
          width: 374, height: 374 }}
      />

      <div className="border-t border-line">
        {skills.map((cat, ci) => (
          <div
            key={cat.id}
            className="grid grid-cols-1 gap-x-10 gap-y-4 border-b border-line py-8 lg:grid-cols-12"
          >
            {/* Intitulé de catégorie, en colonne de marge. */}
            <Reveal className="lg:col-span-3" delay={ci * 0.07}>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="block h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: accentOf(cat.accent) }}
                />
                <h3 className="meta text-ink">{cat.label}</h3>
              </div>
            </Reveal>

            {/* Les outils, en pastilles. `flex-wrap` et non une grille : les
                libellés vont de « .NET » à « Serveur / Hébergement », des
                colonnes de largeur fixe laisseraient de grands trous. */}
            <ul className="flex flex-wrap gap-2 lg:col-span-9">
              {cat.items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  /* Durée et cadence lues depuis la spec, plus recopiées :
                     0.55 et 0.05 étaient écrits à la main ici, ce qui faisait
                     tourner cette colonne à 50 ms au lieu des 60 ms du reste
                     du site — un décalage invisible seul, sensible à côté du
                     hero. */
                  transition={{
                    duration: DURATION,
                    ease: EASE,
                    delay: ci * 0.07 + i * STAGGER,
                  }}
                  /* `whileHover` est appliqué APRÈS l'entrée : Framer gère les
                     deux sur la même propriété sans conflit, là où un
                     `hover:-translate-y-0.5` en CSS se ferait écraser par le
                     transform inline que Framer écrit pendant la révélation. */
                  /* La transition est portée PAR le variant de survol :
                     l'attribut `transition` de l'élément vaut pour toutes ses
                     animations, le relèvement aurait donc duré les 550ms de
                     la révélation au lieu des 220ms d'une micro-interaction. */
                  whileHover={{ ...HOVER_LIFT, transition: INTERACTION_TRANSITION }}
                  className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface py-2 pl-2.5 pr-3.5 transition-colors duration-200 hover:border-line-strong"
                >
                  {/* Le glyphe passe du gris chaud à l'encre au survol. Il
                      reste MONOCHROME : quinze logos aux couleurs de marque
                      auraient introduit quinze couleurs dans une charte qui
                      n'en compte qu'une, et la grille aurait viré au nuage de
                      badges. */}
                  <span
                    aria-hidden
                    className="flex size-[18px] shrink-0 items-center justify-center text-ink-muted transition-colors duration-200 group-hover:text-ink"
                  >
                    <TechGlyph slug={item.icon} className="size-[17px]" />
                  </span>
                  <span className="text-[14px] font-medium leading-none text-ink">
                    {item.label}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Méthode — hors fiche : une méthodologie n'est pas un outil. */}
      {method ? (
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h3 className="meta text-ink">Méthode</h3>
            <p className="text-[15px] font-medium text-ink">{method}</p>
          </div>
        </Reveal>
      ) : null}
    </>
  );
}
