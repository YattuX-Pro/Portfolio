"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Reveal, { EASE } from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

/* Accents de catégorie : rouge et vert du drapeau, puis l'encre.
   Le jaune est exclu ici — à 1.41:1 il ne franchit même pas le seuil
   de 3:1 exigé pour un élément graphique porteur d'information. */
const CATEGORIES = [
  {
    id: "backend",
    label: "Back-end",
    accent: "var(--flag-red)",
    skills: [
      { src: "/dotnet.png", name: ".NET", level: 92 },
      { src: "/C-Sharp.png", name: "C#", level: 88 },
    ],
  },
  {
    id: "frontend",
    label: "Front-end",
    accent: "var(--flag-green)",
    skills: [
      { src: "/angular.png", name: "Angular", level: 85 },
      { src: "/next.png", name: "Next.js", level: 80 },
      { src: "/ts.png", name: "TypeScript", level: 76 },
    ],
  },
  {
    id: "tools",
    label: "Données & Outils",
    accent: "var(--text)",
    skills: [
      { src: "/github.png", name: "GitHub", level: 78 },
      { src: "/postger.png", name: "PostgreSQL", level: 74 },
      { src: "/docker.webp", name: "Docker", level: 70 },
      { src: "/bitbucket.png", name: "Bitbucket", level: 68 },
    ],
  },
] as const;

function SkillRow({
  src,
  name,
  level,
  accent,
  delay,
}: {
  src: string;
  name: string;
  level: number;
  accent: string;
  delay: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      className="py-4 border-b border-line"
    >
      <div className="flex items-center gap-3">
        <Image
          src={src}
          alt=""
          width={22}
          height={22}
          className="object-contain flex-shrink-0"
        />
        <span className="flex-1 text-[15px] font-medium text-ink">{name}</span>
        <span className="font-mono text-[12px] tabular-nums text-muted">{level}</span>
      </div>

      {/* Barre de niveau. role=img + aria-label : la couleur seule ne porte
          jamais l'information, la valeur reste lisible en texte à côté. */}
      <div
        className="mt-2.5 h-1 w-full bg-line"
        role="img"
        aria-label={`${name} : ${level} sur 100`}
      >
        <motion.div
          className="h-full w-full origin-left"
          style={{ backgroundColor: accent }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: level / 100 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE, delay: delay + 0.1 }}
        />
      </div>
    </motion.li>
  );
}

export default function Skills() {
  return (
    <>
      <SectionHeader
        num="01"
        label="Expertise"
        title="Ce que je construis, et avec quoi."
        intro="Une base back-end .NET solide, un front moderne Angular et Next.js, et l'outillage qui va avec pour livrer et maintenir en production."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
        {CATEGORIES.map((cat, ci) => (
          <div key={cat.id}>
            <Reveal delay={ci * 0.08}>
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
              {cat.skills.map((s, i) => (
                <SkillRow
                  key={s.name}
                  src={s.src}
                  name={s.name}
                  level={s.level}
                  accent={cat.accent}
                  delay={ci * 0.08 + i * 0.05}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
