"use client";

import { motion } from "framer-motion";
import Reveal, { DURATION, EASE, STAGGER } from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
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
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {skills.map((cat, ci) => (
          <div key={cat.id}>
            <Reveal delay={ci * 0.07}>
              <div className="flex items-center gap-2.5 pb-3 border-b-2 border-ink">
                <span
                  aria-hidden
                  className="block h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: accentOf(cat.accent) }}
                />
                <h3 className="meta text-ink">{cat.label}</h3>
              </div>
            </Reveal>

            <ul>
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
                  className="py-3 border-b border-line text-[15px] font-medium text-ink"
                >
                  {item.label}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Méthode — hors grille : une méthodologie n'est pas un outil. */}
      {method ? (
        <Reveal delay={0.1}>
          <div className="mt-14 pt-6 border-t-2 border-ink flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h3 className="meta text-ink">Méthode</h3>
            <p className="text-[15px] font-medium text-ink">{method}</p>
          </div>
        </Reveal>
      ) : null}
    </>
  );
}
