"use client";

import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiEnvelope, HiArrowUpRight } from "react-icons/hi2";
import { motion } from "framer-motion";
import Reveal, { HOVER_LIFT, INTERACTION_TRANSITION, TAP_PRESS } from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import FlagRule from "@/components/FlagRule";
import type { SiteSettings } from "@/lib/db/schema";

type Link = { href: string; label: string; icon: typeof FaGithub };

export default function Footer({ settings }: { settings: SiteSettings | null }) {
  const links: Link[] = [
    settings?.githubUrl && { href: settings.githubUrl, label: "GitHub", icon: FaGithub },
    settings?.linkedinUrl && {
      href: settings.linkedinUrl,
      label: "LinkedIn",
      icon: FaLinkedin,
    },
  ].filter(Boolean) as Link[];

  return (
    <>
      <SectionHeader
        num="03"
        label="Contact"
        title="Travaillons ensemble."
        intro="Analyste développeur, ouvert aux opportunités full-time et freelance. Le plus simple reste un e-mail."
        illustration={{ src: "/illustrations/contact.png", width: 418, height: 418 }}
      />

      {/* E-mail — l'élément principal de la section */}
      {settings?.email ? (
        <Reveal>
          <motion.a
            href={`mailto:${settings.email}`}
            whileHover={{ y: -2, transition: INTERACTION_TRANSITION }}
            className="group inline-flex items-center gap-3 font-semibold tracking-[-0.03em] text-ink hover:text-brand transition-colors duration-200 cursor-pointer break-words"
            style={{ fontSize: "clamp(20px, 5vw, 44px)" }}
          >
            <HiEnvelope
              className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200"
              aria-hidden
            />
            {settings.email}
          </motion.a>
        </Reveal>
      ) : null}

      <Reveal delay={0.06}>
        <FlagRule className="mt-8" thickness={6} width={92} />
      </Reveal>

      {/* Liens + CV */}
      <Reveal delay={0.12}>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          {links.map(({ href, label, icon: Icon }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={HOVER_LIFT}
              whileTap={TAP_PRESS}
              transition={INTERACTION_TRANSITION}
              className="group inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-brand transition-colors duration-200 cursor-pointer"
            >
              <Icon size={17} aria-hidden />
              {label}
              {/* La flèche se décale et s'opacifie : elle indique la sortie du
                  site, autant qu'elle le montre au survol. Pas de rotation —
                  une icône qui tourne attire l'œil sans rien dire de plus. */}
              <HiArrowUpRight
                size={13}
                aria-hidden
                className="opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </motion.a>
          ))}

          {settings?.cvUrl ? (
            <motion.a
              href={settings.cvUrl}
              download
              whileHover={HOVER_LIFT}
              whileTap={TAP_PRESS}
              transition={INTERACTION_TRANSITION}
              className="inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-brand transition-colors duration-200 cursor-pointer"
            >
              Télécharger le CV
            </motion.a>
          ) : null}
        </div>
      </Reveal>

      {/* Mentions */}
      {/* `preset="in"` : fondu sans déplacement. Sur un bloc pleine largeur
          en bas de page, une translation verticale se lit comme un à-coup. */}
      <Reveal delay={0.18} preset="in">
        <div className="mt-20 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
          <p className="meta">© {new Date().getFullYear()} Aboubacar Tidiane Yattara</p>
          <p className="meta">.Net / Angular</p>
        </div>
      </Reveal>
    </>
  );
}
