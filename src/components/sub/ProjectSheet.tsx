"use client";

import { HiExternalLink } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ProjectImage from "@/components/sub/ProjectImage";
import { TechGlyph, guessIconSlug } from "@/lib/tech-icons";
import type { Project } from "@/lib/db/schema";

/**
 * Panneau de détail d'un projet : le besoin, la réponse, la stack, les liens.
 *
 * Réutilise le `Sheet` de `components/ui` plutôt qu'un panneau maison. Il est
 * bâti sur base-ui, déjà une dépendance du projet, et il traite correctement
 * ce qu'une modale faite à la main rate presque toujours : piège à focus,
 * touche Échap, verrou du défilement, `aria-modal`, et restitution du focus au
 * déclencheur à la fermeture. Ses tokens shadcn pointent sur la palette du
 * site (voir globals.css), il arrive donc déjà dans la charte.
 *
 * Le contenu est PILOTÉ PAR LES DONNÉES : chaque section ne s'affiche que si
 * son champ est renseigné. Un projet sans étude de cas ouvre un panneau qui
 * montre l'image, le titre, la description et les liens — pas une succession
 * de titres vides.
 */

/* Une section de texte du panneau. Rend `null` sans contenu, ce qui permet de
   les aligner sans condition dans le JSX. */
function Block({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <section>
      <h3 className="meta">{label}</h3>
      {/* `whitespace-pre-line` : les retours à la ligne saisis dans le
          textarea de l'admin sont conservés. Sans ça, un texte écrit en deux
          paragraphes arrivait en un seul bloc. */}
      <p className="mt-2.5 whitespace-pre-line text-[15px] leading-[1.7] text-ink-muted">
        {text}
      </p>
    </section>
  );
}

export default function ProjectSheet({
  project,
  onOpenChange,
}: {
  /** Le projet à détailler, ou `null` : c'est ce qui pilote l'ouverture. */
  project: Project | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={project !== null} onOpenChange={onOpenChange}>
      {/* Largeur : 512px. Le Sheet est livré en `max-w-sm` (384px), trop
          étroit pour du texte suivi — on tombait à ~40 caractères par ligne.
          672px, à l'inverse, mangeait la moitié de l'écran. 512px donne une
          mesure de ~60 caractères, la fourchette confortable en lecture.

          Le préfixe `data-[side=right]:` est OBLIGATOIRE, voir la note dans
          components/ui/sheet.tsx : sans lui la classe est ignorée. */}
      <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-lg">
        {project ? (
          <>
            {/* L'image ne va PAS de bord à bord. Un visuel collé aux arêtes
                du panneau se lit comme une bannière qui déborde ; encadré et
                détaché, il se lit comme la pièce présentée. D'où le `p-4`
                autour et le cadre arrondi — le même langage que les cartes de
                la grille.

                `overflow-hidden` sur le cadre : sans lui l'image, qui remplit
                le conteneur, dépasserait des coins arrondis et les quatre
                angles redeviendraient droits. */}
            {project.imageUrl ? (
              <div className="shrink-0 p-4">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line bg-bg">
                  <ProjectImage
                    src={project.imageUrl}
                    alt={`Aperçu du projet ${project.title}`}
                    blurDataURL={project.imageBlur}
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="object-top"
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-7 px-4 pb-10">
              <header>
                {/* Rôle et année sur une ligne de méta. Le séparateur n'existe
                    que si les deux sont là, sinon on afficherait un « · »
                    orphelin. */}
                {project.role || project.year ? (
                  <p className="meta">
                    {[project.year, project.role].filter(Boolean).join(" · ")}
                  </p>
                ) : null}

                <h2 className="mt-3 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
                  {project.title}
                </h2>

                <p className="mt-3 text-[16px] leading-[1.65] text-ink-muted">
                  {project.description}
                </p>
              </header>

              <Block label="Le besoin" text={project.problem} />
              <Block label="La réponse" text={project.solution} />

              {project.stack.length > 0 ? (
                <section>
                  <h3 className="meta">Stack</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <li
                        key={tech}
                        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface py-1.5 pl-2.5 pr-3"
                      >
                        <TechGlyph
                          slug={guessIconSlug(tech)}
                          className="size-4 shrink-0 text-ink-muted"
                        />
                        <span className="text-[13px] font-medium text-ink">
                          {tech}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {project.githubUrl || project.demoUrl ? (
                <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
                  {project.demoUrl ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-brand px-5 text-[15px] font-medium text-brand-on transition-colors duration-200 hover:bg-brand-hover sm:flex-none"
                    >
                      <HiExternalLink size={16} aria-hidden />
                      Voir le site
                    </a>
                  ) : null}

                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-line-strong px-5 text-[15px] font-medium text-ink transition-colors duration-200 hover:border-ink hover:bg-surface sm:flex-none"
                    >
                      <FaGithub size={16} aria-hidden />
                      Code source
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
