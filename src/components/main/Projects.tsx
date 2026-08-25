"use client";

import Image from "next/image";
import { HiExternalLink } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

const PROJECTS = [
  {
    title: "Rental Car",
    description:
      "Plateforme de réservation de véhicules construite sur une architecture microservices. Consultation, filtrage et réservation de voitures en temps réel.",
    image: "/carties.PNG",
    stack: ["Next.js", "ASP.NET", "Microservices", "Docker"],
    demo: null as string | null,
    github: "https://github.com/YattuX/car-rental-micorservices-nextJs",
  },
  {
    title: "AlphaX",
    description:
      "Plateforme de partage de cours vidéo réservée aux comptes validés. Authentification complète, gestion des rôles et upload de vidéos intégré.",
    image: "/alphax.PNG",
    stack: ["Django", "Tailwind CSS", "Python", "PostgreSQL"],
    demo: "https://www.linkedin.com/posts/aboubacar-tidiane-yattara-5608b6232_linkedin-django-tailwind-activity-7117579562418348032-e__j",
    github: "https://github.com/YattuX/fx-Alpha",
  },
  {
    title: "Remove BG",
    description:
      "Suppression d'arrière-plan par lot grâce à l'IA. Interface simple pour traiter plusieurs images simultanément avec un résultat net et immédiat.",
    image: "/rm_bg.PNG",
    stack: ["Django", "Tailwind CSS", "Python", "AI API"],
    demo: "https://www.linkedin.com/posts/aboubacar-tidiane-yattara-5608b6232_hello-word-ci-dessous-une-id%C3%A9e-dapplication-activity-7117965221771575296-x-v2",
    github: "https://github.com/YattuX/removebg",
  },
  {
    title: "Digitalize",
    description:
      "Dashboard statistique pour la gestion d'une flotte de véhicules. Visualisations interactives des ventes, locations et performances en temps réel.",
    image: "/digitalise.PNG",
    stack: ["Django", "Bootstrap", "JavaScript", "Chart.js"],
    demo: "https://www.linkedin.com/posts/aboubacar-tidiane-yattara-5608b6232_activity-7118265120589258753-ALCl",
    github: "https://github.com/Affane99/management_rolling_stock",
  },
  {
    title: "My Portfolio",
    description:
      "Portfolio personnel. Design éditorial en light mode, animations sobres au scroll et typographie IBM Plex sur toute la ligne.",
    image: "/portfolio.PNG",
    stack: ["Next.js", "Framer Motion", "Tailwind CSS", "TypeScript"],
    demo: "https://yattara.dev/",
    github: "https://github.com/YattuX/myPorfolio",
  },
] as const;

const pad = (n: number) => String(n + 1).padStart(2, "0");

export default function Projects() {
  return (
    <>
      <SectionHeader
        num="02"
        label="Projets"
        title="Une sélection de ce que j'ai livré."
        intro="Cinq projets, du microservice .NET au dashboard Django. Code source disponible pour chacun."
      />

      <ul className="border-t border-line">
        {PROJECTS.map((p, i) => (
          <li key={p.title} className="border-b border-line">
            <Reveal>
              <article className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 py-10 sm:py-12">
                {/* Visuel */}
                <div className="lg:col-span-5">
                  <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-surface">
                    <Image
                      src={p.image}
                      alt={`Aperçu du projet ${p.title}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Contenu */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[12px] text-accent tabular-nums">
                      {pad(i)}
                    </span>
                    <h3 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-ink">
                      {p.title}
                    </h3>
                  </div>

                  <p className="mt-3 max-w-prose text-[17px] leading-[1.65] text-muted">
                    {p.description}
                  </p>

                  {/* Stack */}
                  <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
                    {p.stack.map((t) => (
                      <li
                        key={t}
                        className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted border border-line px-2.5 py-1"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>

                  {/* Liens */}
                  <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-x-6 gap-y-1">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-accent transition-colors duration-200 cursor-pointer"
                    >
                      <FaGithub size={16} aria-hidden />
                      Code source
                      <span className="sr-only">de {p.title}</span>
                    </a>

                    {p.demo && (
                      <a
                        href={p.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-accent transition-colors duration-200 cursor-pointer"
                      >
                        <HiExternalLink size={16} aria-hidden />
                        Voir la démo
                        <span className="sr-only">de {p.title}</span>
                      </a>
                    )}
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
