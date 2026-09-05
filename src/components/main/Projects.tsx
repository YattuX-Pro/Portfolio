"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiExternalLink, HiArrowRight } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import ProjectImage from "@/components/sub/ProjectImage";
import ProjectSheet from "@/components/sub/ProjectSheet";
import Reveal, {
  HOVER_LIFT,
  INTERACTION_TRANSITION,
  STAGGER,
} from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { TechGlyph, guessIconSlug } from "@/lib/tech-icons";
import type { Project } from "@/lib/db/schema";

/* ── Projets, en cartes ────────────────────────────────────────────────────
   La carte n'est PAS cliquable. Trois cibles explicites, et rien d'autre :
   le bouton « Détail » en bas à droite, qui ouvre le panneau, et deux boutons
   d'icône sur le visuel pour le dépôt et la démo.

   Ce que ce bouton explicite a permis de SUPPRIMER : une couverture invisible
   en absolu sur toute la carte, avec ses `pointer-events-none` sur le texte,
   ses `z-10` sur les liens et son libellé pour lecteurs d'écran. Tout ça
   existait pour qu'un clic sur « Code source » n'ouvre pas aussi le panneau
   derrière. Un bouton nommé règle le problème en le faisant disparaître : plus
   de zones qui se chevauchent, plus d'ordre d'empilement à tenir, et ce qui
   est cliquable se voit.

   ── Le partage carte / panneau ────────────────────────────────────────────
   Le panneau portant tout le détail, la carte est réduite à ce qui sert à
   CHOISIR : le visuel, le titre, l'année, trois technologies. Pas de
   description — deux lignes coupées à mi-phrase n'aident personne à choisir,
   et le texte entier est dans le panneau. */

export default function Projects({ projects }: { projects: Project[] }) {
  const [detail, setDetail] = useState<Project | null>(null);

  return (
    <>
      <SectionHeader
        num="02"
        label="Projets"
        title="Une sélection de ce que j'ai livré."
        intro="Du microservice .NET au dashboard Django. « Détail » ouvre le besoin, la réponse et la stack de chaque projet."
        illustration={{ src: "/illustrations/livraison.png",
          srcDark: "/illustrations/livraison-dark.png",
          width: 1000, height: 1000 }}
      />

      {/* <ol> et non <ul> : les entrées sont ordonnées. */}
      <ol className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        {projects.map((p, i) => (
          <li key={p.id}>
            {/* Les deux cartes d'une ligne entrent décalées de 60ms, la
                cadence du site. `i % 2` et non `i` : sinon la cinquième carte
                attendrait 300ms après être entrée dans le champ. */}
            <Reveal className="h-full" delay={(i % 2) * STAGGER} preset="scale">
              <motion.article
                whileHover={HOVER_LIFT}
                transition={INTERACTION_TRANSITION}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors duration-200 hover:border-line-strong"
              >
                <div className="relative aspect-[2/1] w-full border-b border-line">
                  {p.imageUrl ? (
                    <div className="absolute inset-0 transition-transform duration-500 ease-soft group-hover:scale-[1.03]">
                      <ProjectImage
                        src={p.imageUrl}
                        alt={`Aperçu du projet ${p.title}`}
                        blurDataURL={p.imageBlur}
                        sizes="(max-width: 768px) 100vw, 540px"
                        /* `object-top` : ce sont des captures d'interface. Un
                           cadrage centré coupe l'en-tête ET le bas ; ancré en
                           haut, on garde la barre de navigation et le titre de
                           l'écran, ce qui identifie le projet. */
                        className="object-top"
                      />
                    </div>
                  ) : (
                    <span className="meta absolute inset-0 flex items-center justify-center">
                      Sans visuel
                    </span>
                  )}

                  {/* Dépôt et démo, sur le visuel. Toujours visibles et non
                      révélés au survol : un bouton qui n'apparaît qu'au survol
                      est inatteignable au doigt. Sans texte, donc `aria-label`
                      obligatoire. */}
                  {p.githubUrl || p.demoUrl ? (
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      {p.githubUrl ? (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Code source de ${p.title}`}
                          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-surface/90 text-ink backdrop-blur-sm transition-colors duration-200 hover:border-line-strong hover:text-brand"
                        >
                          <FaGithub size={15} aria-hidden />
                        </a>
                      ) : null}

                      {p.demoUrl ? (
                        <a
                          href={p.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Démo de ${p.title}`}
                          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-surface/90 text-ink backdrop-blur-sm transition-colors duration-200 hover:border-line-strong hover:text-brand"
                        >
                          <HiExternalLink size={15} aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[18px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink sm:text-[19px]">
                      {p.title}
                    </h3>
                    {p.year ? (
                      <span className="meta mt-0.5 shrink-0">{p.year}</span>
                    ) : null}
                  </div>

                  {/* Pied de carte : la stack à gauche, « Détail » à droite.
                      Sur une même ligne et non l'un sous l'autre — la hauteur
                      du bouton (44px, le minimum tactile) absorbe celle de la
                      stack au lieu de s'y ajouter. */}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                    {p.stack.length > 0 ? (
                      <ul
                        className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                        aria-label={`Technologies de ${p.title}`}
                      >
                        {p.stack.slice(0, 3).map((tech) => (
                          <li
                            key={tech}
                            className="flex items-center gap-1.5 text-ink-muted"
                          >
                            <TechGlyph
                              slug={guessIconSlug(tech)}
                              className="size-[14px] shrink-0"
                            />
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                              {tech}
                            </span>
                          </li>
                        ))}
                        {p.stack.length > 3 ? (
                          <li className="font-mono text-[10px] tracking-[0.12em] text-ink-muted/70">
                            +{p.stack.length - 3}
                          </li>
                        ) : null}
                      </ul>
                    ) : (
                      <span />
                    )}

                    <motion.button
                      type="button"
                      onClick={() => setDetail(p)}
                      whileTap={{ scale: 0.98 }}
                      transition={INTERACTION_TRANSITION}
                      className="group/detail inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong px-3.5 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-ink hover:bg-bg"
                    >
                      Détail
                      <HiArrowRight
                        size={13}
                        aria-hidden
                        className="transition-transform duration-200 group-hover/detail:translate-x-0.5"
                      />
                      <span className="sr-only">du projet {p.title}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          </li>
        ))}
      </ol>

      <ProjectSheet
        project={detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      />
    </>
  );
}
