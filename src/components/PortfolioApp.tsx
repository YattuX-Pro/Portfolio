"use client";

import { useCallback } from "react";
import NavBar from "@/components/main/NavBar";
import Hero from "@/components/main/Hero";
import Skills from "@/components/main/Skills";
import Projects from "@/components/main/Projects";
import Footer from "@/components/main/Footer";
import FlagRule from "@/components/FlagRule";
import type { SiteData } from "@/lib/db/queries";

export default function PortfolioApp({ data }: { data: SiteData }) {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <NavBar />

      <main className="pt-16">
        {/* px-5 sur mobile, aligné sur le header. 100svh plutôt que 100vh :
            la barre d'adresse mobile fausse vh et rogne le bas du hero. */}
        <div className="max-w-6xl mx-auto px-5 sm:px-10">
          <section
            id="home"
            className="min-h-[calc(100svh-4rem)] flex items-center py-14 sm:py-20 lg:py-24"
          >
            <Hero data={data} onNavigate={scrollTo} />
          </section>

          <FlagRule className="mx-auto justify-center" thickness={6} width={72} />

          <section id="skills" className="py-20 sm:py-24 lg:py-32">
            <Skills skills={data.skills} method={data.settings?.method ?? null} />
          </section>

          <FlagRule className="mx-auto justify-center" thickness={6} width={72} />

          <section id="projects" className="py-20 sm:py-24 lg:py-32">
            <Projects projects={data.projects} />
          </section>

          <FlagRule className="mx-auto justify-center" thickness={6} width={72} />

          <section id="footer" className="py-20 sm:py-24 lg:py-32">
            <Footer settings={data.settings} />
          </section>
        </div>
      </main>
    </>
  );
}
