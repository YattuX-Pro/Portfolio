"use client";

import { useCallback } from "react";
import NavBar from "@/components/main/NavBar";
import Hero from "@/components/main/Hero";
import Skills from "@/components/main/Skills";
import Projects from "@/components/main/Projects";
import Footer from "@/components/main/Footer";
import FlagRule from "@/components/FlagRule";

export default function PortfolioApp() {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <NavBar />

      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <section
            id="home"
            className="min-h-[calc(100vh-4rem)] flex items-center py-20 lg:py-24"
          >
            <Hero onNavigate={scrollTo} />
          </section>

          <FlagRule className="justify-center" thickness={6} width={72} />

          <section id="skills" className="py-24 lg:py-32">
            <Skills />
          </section>

          <FlagRule className="justify-center" thickness={6} width={72} />

          <section id="projects" className="py-24 lg:py-32">
            <Projects />
          </section>

          <FlagRule className="justify-center" thickness={6} width={72} />

          <section id="footer" className="py-24 lg:py-32">
            <Footer />
          </section>
        </div>
      </main>
    </>
  );
}
