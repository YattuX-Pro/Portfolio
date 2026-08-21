"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowRight, HiDownload } from "react-icons/hi";
import { EASE, revealGroup, revealItem } from "@/components/Reveal";
import FlagRule from "@/components/FlagRule";

const STATS = [
  { value: "5+", label: "Projets" },
  { value: "3+", label: "Années"  },
  { value: "2",  label: "Domaines" },
];

/* Colonne « index » — sidebar éditoriale, purement typographique. */
const STACK = [
  { group: "Back-end",  items: ".NET · FastAPI" },
  { group: "Front-end", items: "Angular · Next.js" },
  { group: "Langages",  items: "TypeScript · Python" },
  { group: "Données",   items: "PostgreSQL · Redis · RabbitMQ" },
  { group: "DevOps",    items: "Docker · GitLab CI/CD" },
  { group: "Méthode",   items: "Agile Scrum" },
];

const SOCIALS = [
  { href: "https://github.com/YattuX-Pro", label: "GitHub", icon: FaGithub },
  {
    href: "https://www.linkedin.com/in/aboubacar-tidiane-yattara-5608b6232/",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
];

export default function HeroContent({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-16 items-start">
      {/* ── Colonne principale ───────────────────────────────────────── */}
      <motion.div
        variants={revealGroup}
        initial="hidden"
        animate="visible"
        className="lg:col-span-7 xl:col-span-7"
      >
        {/* Eyebrow */}
        <motion.p variants={revealItem} className="meta flex items-center gap-2.5">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Analyste Développeur
          <span aria-hidden className="text-line-strong">/</span>
          Disponible
        </motion.p>

        {/* Nom */}
        <motion.h1
          variants={revealItem}
          className="font-display font-semibold mt-6 leading-[0.95] tracking-[-0.035em] text-ink"
          style={{ fontSize: "clamp(44px, 8.5vw, 92px)" }}
        >
          Aboubacar Tidiane
          <br />
          Yattara<span className="text-accent">.</span>
        </motion.h1>

        {/* Filet tricolore — Guinée */}
        <motion.div variants={revealItem}>
          <FlagRule className="mt-8" thickness={6} width={92} delay={0.15} />
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={revealItem}
          className="mt-8 max-w-prose text-[18px] leading-[1.7] text-muted"
        >
          J&apos;analyse, conçois et déploie des solutions logicielles robustes —
          en alliant rigueur fonctionnelle, architecture technique maîtrisée et
          expérience utilisateur soignée.
        </motion.p>

        {/* CTA */}
        <motion.div variants={revealItem} className="mt-9 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate?.("projects")}
            className="group inline-flex items-center gap-2 h-11 px-5 rounded-md bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-colors duration-200 cursor-pointer"
          >
            Voir mes projets
            <HiArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>

          <a
            href="/cv/CV_Yattara_Aboubacar.pdf"
            download
            className="inline-flex items-center gap-2 h-11 px-5 rounded-md border border-line-strong text-ink text-[14px] font-medium hover:border-ink hover:bg-surface transition-colors duration-200 cursor-pointer"
          >
            <HiDownload size={15} aria-hidden />
            Télécharger le CV
          </a>
        </motion.div>

        {/* Filet + méta bas de hero */}
        <motion.div variants={revealItem} className="mt-14 pt-6 border-t border-line">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-display font-semibold text-[28px] tracking-[-0.02em] leading-none text-ink">{s.value}</span>
                <span className="meta">{s.label}</span>
              </div>
            ))}

            <div className="flex items-center gap-1 sm:ml-auto">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-md text-muted hover:text-accent hover:bg-accent-soft transition-colors duration-200 cursor-pointer"
                >
                  <Icon size={18} aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Colonne index — sidebar magazine ─────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.32 }}
        className="hidden lg:block lg:col-span-4 lg:col-start-9 lg:pt-3"
      >
        <p className="meta">Stack principale</p>
        <FlagRule className="mt-3 mb-1" thickness={3} width={26} delay={0.4} />
        <dl>
          {STACK.map((s) => (
            <div
              key={s.group}
              className="flex items-baseline justify-between gap-4 py-3 border-b border-line"
            >
              <dt className="meta">{s.group}</dt>
              <dd className="text-[14px] text-ink text-right">{s.items}</dd>
            </div>
          ))}
        </dl>
      </motion.aside>
    </div>
  );
}
