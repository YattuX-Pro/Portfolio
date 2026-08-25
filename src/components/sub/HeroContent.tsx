"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowRight, HiDownload } from "react-icons/hi";
import { EASE, revealGroup, revealItem } from "@/components/Reveal";
import FlagRule from "@/components/FlagRule";
import type { SiteData } from "@/lib/db/queries";

type Social = { href: string; label: string; icon: typeof FaGithub };

export default function HeroContent({
  data,
  onNavigate,
}: {
  data: SiteData;
  onNavigate?: (id: string) => void;
}) {
  const { settings, stats, stack } = data;

  const socials: Social[] = [
    settings?.githubUrl && { href: settings.githubUrl, label: "GitHub", icon: FaGithub },
    settings?.linkedinUrl && {
      href: settings.linkedinUrl,
      label: "LinkedIn",
      icon: FaLinkedin,
    },
  ].filter(Boolean) as Social[];

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
          {settings?.heroRole ?? "Analyste Développeur"}
          {settings?.heroAvailable ? (
            <>
              <span aria-hidden className="text-line-strong">
                /
              </span>
              Disponible
            </>
          ) : null}
        </motion.p>

        {/* Nom */}
        <motion.h1
          variants={revealItem}
          className="font-display font-semibold mt-6 leading-[0.95] tracking-[-0.035em] text-ink"
          style={{ fontSize: "clamp(30px, 9vw, 92px)" }}
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
          {settings?.heroBio}
        </motion.p>

        {/* CTA */}
        <motion.div variants={revealItem} className="mt-9 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate?.("projects")}
            className="group inline-flex flex-1 sm:flex-none justify-center items-center gap-2 h-12 px-5 rounded-md bg-accent text-white text-[15px] font-medium hover:bg-accent-hover transition-colors duration-200 cursor-pointer"
          >
            Voir mes projets
            <HiArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>

          {settings?.cvUrl ? (
            <a
              href={settings.cvUrl}
              download
              className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 h-12 px-5 rounded-md border border-line-strong text-ink text-[15px] font-medium hover:border-ink hover:bg-surface transition-colors duration-200 cursor-pointer"
            >
              <HiDownload size={15} aria-hidden />
              Télécharger le CV
            </a>
          ) : null}
        </motion.div>

        {/* Filet + méta bas de hero */}
        <motion.div
          variants={revealItem}
          className="mt-12 sm:mt-14 pt-6 border-t border-line"
        >
          <div className="flex flex-wrap items-center gap-x-8 sm:gap-x-10 gap-y-6">
            {stats.map((s) => (
              <div key={s.id} className="flex items-baseline gap-2">
                <span className="font-display font-semibold text-[28px] tracking-[-0.02em] leading-none text-ink">
                  {s.value}
                </span>
                <span className="meta">{s.label}</span>
              </div>
            ))}

            <div className="flex items-center gap-1 -ml-2.5 w-full sm:w-auto sm:ml-auto">
              {socials.map(({ href, label, icon: Icon }) => (
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
      {stack.length > 0 ? (
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.32 }}
          className="hidden lg:block lg:col-span-4 lg:col-start-9 lg:pt-3"
        >
          <p className="meta">Stack principale</p>
          <FlagRule className="mt-3 mb-1" thickness={3} width={26} delay={0.4} />
          <dl>
            {stack.map((s) => (
              <div
                key={s.id}
                className="flex items-baseline justify-between gap-4 py-3 border-b border-line"
              >
                <dt className="meta">{s.groupLabel}</dt>
                <dd className="text-[14px] text-ink text-right">{s.items}</dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      ) : null}
    </div>
  );
}
