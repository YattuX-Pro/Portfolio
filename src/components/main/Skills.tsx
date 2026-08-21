"use client";

import { motion } from "framer-motion";
import Reveal, { EASE } from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

/* Pas de pourcentages : une note auto-attribuée ne dit rien de vérifiable,
   et elle obligerait à inventer une valeur à chaque nouvelle compétence.

   Marqueurs de catégorie : rouge et vert du drapeau, puis encre et gris.
   Le jaune est exclu — à 1.41:1 il serait quasi invisible sur le fond crème. */
const CATEGORIES = [
  {
    id: "backend",
    label: "Back-end",
    accent: "var(--flag-red)",
    items: [".NET", "C#", "FastAPI"],
  },
  {
    id: "frontend",
    label: "Front-end",
    accent: "var(--flag-green)",
    items: ["Angular", "Next.js", "TypeScript"],
  },
  {
    id: "data",
    label: "Données & sécurité",
    accent: "var(--text)",
    items: ["PostgreSQL", "SQL Server", "Keycloak"],
  },
  {
    id: "devops",
    label: "DevOps & qualité",
    accent: "var(--muted)",
    items: ["Docker", "GitLab", "CI/CD", "SonarQube", "GitHub", "Bitbucket"],
  },
] as const;

export default function Skills() {
  return (
    <>
      <SectionHeader
        num="01"
        label="Expertise"
        title="Ce que je construis, et avec quoi."
        intro="Une base back-end .NET et FastAPI, un front Angular et Next.js, et l'outillage DevOps qui va avec pour livrer, sécuriser et maintenir en production."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {CATEGORIES.map((cat, ci) => (
          <div key={cat.id}>
            <Reveal delay={ci * 0.07}>
              <div className="flex items-center gap-2.5 pb-3 border-b-2 border-ink">
                <span
                  aria-hidden
                  className="block h-2.5 w-2.5 flex-shrink-0"
                  style={{ backgroundColor: cat.accent }}
                />
                <h3 className="meta text-ink">{cat.label}</h3>
              </div>
            </Reveal>

            <ul>
              {cat.items.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.55,
                    ease: EASE,
                    delay: ci * 0.07 + i * 0.05,
                  }}
                  className="py-3 border-b border-line text-[15px] font-medium text-ink"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Méthode — hors grille : une méthodologie n'est pas un outil. */}
      <Reveal delay={0.1}>
        <div className="mt-14 pt-6 border-t-2 border-ink flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h3 className="meta text-ink">Méthode</h3>
          <p className="text-[15px] font-medium text-ink">Agile Scrum</p>
        </div>
      </Reveal>
    </>
  );
}
