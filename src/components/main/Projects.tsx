"use client";

import Image from "next/image";
import { HiExternalLink } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import type { Project } from "@/lib/db/schema";

const pad = (n: number) => String(n + 1).padStart(2, "0");

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <>
      <SectionHeader
        num="02"
        label="Projets"
        title="Une sélection de ce que j'ai livré."
        intro="Du microservice .NET au dashboard Django. Code source disponible pour chacun."
      />

      <ul className="border-t border-line">
        {projects.map((p, i) => (
          <li key={p.id} className="border-b border-line">
            <Reveal>
              {/* `group` : la ligne entière réagit au survol, pas chaque lien
                  isolément — c'est une entrée de liste éditoriale, elle se
                  lit d'un bloc. Aucun `scale` sur la carte : la charte a
                  retiré ce vocabulaire, seuls la couleur, l'opacité et le
                  tracé d'un filet sont permis. */}
              <article className="group grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 py-10 sm:py-12">
                {/* Visuel */}
                <div className="lg:col-span-5">
                  <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-surface transition-colors duration-200 group-hover:border-line-strong">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={`Aperçu du projet ${p.title}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center meta">
                        Sans visuel
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[12px] text-brand tabular-nums">
                      {pad(i)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-ink">
                        {p.title}
                      </h3>
                      {/* Le filet se dessine de gauche à droite au survol.
                          `origin-left` est indispensable : sans lui il
                          grandirait depuis son centre. Souligner le titre au
                          survol de la ligne dit « ceci est l'entrée que vous
                          regardez », sans rien déplacer. */}
                      <span
                        aria-hidden
                        className="mt-1.5 block h-px origin-left scale-x-0 bg-brand transition-transform duration-300 ease-soft group-hover:scale-x-100"
                      />
                    </div>
                  </div>

                  <p className="mt-3 max-w-prose text-[17px] leading-[1.65] text-ink-muted">
                    {p.description}
                  </p>

                  {/* Stack */}
                  <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
                    {p.stack.map((t) => (
                      <li
                        key={t}
                        className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink-muted border border-line px-2.5 py-1"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>

                  {/* Liens */}
                  <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-x-6 gap-y-1">
                    {p.githubUrl ? (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-brand transition-colors duration-200 cursor-pointer"
                      >
                        <FaGithub
                          size={16}
                          aria-hidden
                          className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                        />
                        Code source
                        <span className="sr-only">de {p.title}</span>
                      </a>
                    ) : null}

                    {p.demoUrl ? (
                      <a
                        href={p.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-brand transition-colors duration-200 cursor-pointer"
                      >
                        <HiExternalLink
                          size={16}
                          aria-hidden
                          className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                        />
                        Voir la démo
                        <span className="sr-only">de {p.title}</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </>
  );
}
