"use client";

import { Fragment, useCallback, type ReactNode } from "react";
import NavBar from "@/components/main/NavBar";
import Hero from "@/components/main/Hero";
import Journey from "@/components/main/Journey";
import Skills from "@/components/main/Skills";
import Projects from "@/components/main/Projects";
import Footer from "@/components/main/Footer";
import MotionRoot from "@/components/MotionRoot";
import Escale from "@/components/voyage/Escale";
import Crossing from "@/components/voyage/Crossing";
import { ESCALES, type EscaleId } from "@/components/voyage/config";
import type { SiteData } from "@/lib/db/queries";

export default function PortfolioApp({ data }: { data: SiteData }) {
  /* Sans `behavior` : `scroll-behavior: smooth` est posé en CSS sur <html>,
     et repasse à `auto` sous mouvement réduit (globals.css). */
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView();
  }, []);

  /* Le contenu de chaque escale. Sans étape en base, Parcours disparaît —
     avec sa traversée — plutôt que d'afficher un journal vide. */
  const content: Record<EscaleId, ReactNode> = {
    parcours: data.journey.length > 0 ? <Journey steps={data.journey} /> : null,
    projects: <Projects projects={data.projects} />,
    skills: <Skills skills={data.skills} method={data.settings?.method ?? null} />,
    footer: <Footer settings={data.settings} />,
  };

  return (
    /* MotionRoot enveloppe TOUT le site public : c'est le seul endroit d'où
       `prefers-reduced-motion` atteint les animations Framer. */
    <MotionRoot>
      <NavBar />

      {/* LE VOYAGE : le hero est le départ, chaque section une escale, et
          entre deux escales une traversée où le navire avance (voir
          `components/voyage/`). Les escales sont pleine largeur, leur
          contenu centré à l'intérieur ; les traversées aussi, d'un bord à
          l'autre de l'écran. */}
      <main className="pt-16">
        {/* 100svh plutôt que 100vh : la barre d'adresse mobile fausse vh et
            rogne le bas du hero. `lg:py-6` : en desktop le hero tient dans
            l'écran (voir HeroContent) ; la colonne du capitaine retire ces
            2 × 1,5rem de sa hauteur (`HeroCaptain`) — changer l'un, c'est
            changer l'autre. */}
        <Escale
          id="home"
          className="min-h-[calc(100svh-4rem)] flex items-center py-14 sm:py-20 lg:py-6"
        >
          <Hero data={data} onNavigate={scrollTo} />
        </Escale>

        {/* Padding réduit par rapport aux anciennes sections (py-32 en
            desktop) : la traversée fait déjà la respiration entre deux
            escales. Le numéro de l'escale suit `ESCALES`, comme les numéros
            des en-têtes de section (01–04), même si Parcours est masqué. */}
        {ESCALES.map((e, i) =>
          content[e.id] ? (
            <Fragment key={e.id}>
              <Crossing to={e.label} cap={e.cap} num={String(i + 1).padStart(2, "0")} />
              <Escale id={e.id} className="pt-6 pb-16 sm:pt-8 sm:pb-20 lg:pt-10 lg:pb-24">
                {content[e.id]}
              </Escale>
            </Fragment>
          ) : null,
        )}
      </main>
    </MotionRoot>
  );
}
