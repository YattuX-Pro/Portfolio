"use client";

import { useCallback } from "react";
import NavBar from "@/components/main/NavBar";
import Hero from "@/components/main/Hero";
import Journey from "@/components/main/Journey";
import Skills from "@/components/main/Skills";
import Projects from "@/components/main/Projects";
import Footer from "@/components/main/Footer";
import WaveRule from "@/components/WaveRule";
import MotionRoot from "@/components/MotionRoot";
import type { SiteData } from "@/lib/db/queries";

export default function PortfolioApp({ data }: { data: SiteData }) {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    /* MotionRoot enveloppe TOUT le site public : c'est le seul endroit d'où
       `prefers-reduced-motion` atteint les animations Framer. */
    <MotionRoot>
      <NavBar />

      <main className="pt-16">
        {/* px-5 sur mobile, aligné sur le header. 100svh plutôt que 100vh :
            la barre d'adresse mobile fausse vh et rogne le bas du hero. */}
        <div className="max-w-6xl mx-auto px-5 sm:px-10">
          {/* `scroll-mt-20` sur CHAQUE section : la navbar est fixe et haute
              de 64px, donc `scrollIntoView` alignait le haut de la section
              sous elle et le titre disparaissait derrière. `scroll-margin-top`
              est ce que la navigation par ancre respecte — 80px laissent la
              hauteur du bandeau plus une respiration. */}
          {/* `lg:py-6` : en desktop le hero tient dans l'écran (voir
              HeroContent), et le contenu est de toute façon centré dans les
              100svh — 96 px de marge n'y servaient qu'à le faire déborder.
              La colonne du capitaine retire ces 2 × 1,5rem de sa hauteur
              (`HeroCaptain`) : changer l'un, c'est changer l'autre. */}
          <section
            id="home"
            className="min-h-[calc(100svh-4rem)] flex items-center py-14 sm:py-20 lg:py-6 scroll-mt-20"
          >
            <Hero data={data} onNavigate={scrollTo} />
          </section>

          {/* Une seule houle, à la sortie du hero : entre les sections, c'est
              l'espace qui sépare. Trois filets identiques à la suite
              devenaient un motif répétitif au lieu d'un repère. */}
          <WaveRule />

          {/* Ordre du récit : ce que j'ai livré (Projets), avec quoi
              (Expertise), d'où je viens (Parcours, en dernier : le CV raconte
              déjà le parcours), puis le contact. Sans étape en base, la section
              Parcours disparaît plutôt que d'afficher un journal vide. */}
          <section id="projects" className="py-20 sm:py-24 lg:py-32 scroll-mt-20">
            <Projects projects={data.projects} />
          </section>

          <section id="skills" className="py-20 sm:py-24 lg:py-32 scroll-mt-20">
            <Skills skills={data.skills} method={data.settings?.method ?? null} />
          </section>

          {data.journey.length > 0 ? (
            <section id="parcours" className="py-20 sm:py-24 lg:py-32 scroll-mt-20">
              <Journey steps={data.journey} />
            </section>
          ) : null}

          <section id="footer" className="py-20 sm:py-24 lg:py-32 scroll-mt-20">
            <Footer settings={data.settings} />
          </section>
        </div>
      </main>
    </MotionRoot>
  );
}
