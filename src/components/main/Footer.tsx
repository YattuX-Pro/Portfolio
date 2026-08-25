"use client";

import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiEnvelope, HiArrowUpRight } from "react-icons/hi2";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import FlagRule from "@/components/FlagRule";

const EMAIL = "yattara.pro@gmail.com";

const LINKS = [
  { href: "https://github.com/YattuX-Pro", label: "GitHub", icon: FaGithub },
  {
    href: "https://www.linkedin.com/in/aboubacar-tidiane-yattara-5608b6232/",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
];

export default function Footer() {
  return (
    <>
      <SectionHeader
        num="03"
        label="Contact"
        title="Travaillons ensemble."
        intro="Analyste développeur, ouvert aux opportunités full-time et freelance. Le plus simple reste un e-mail."
      />

      {/* E-mail — l'élément principal de la section */}
      <Reveal>
        <a
          href={`mailto:${EMAIL}`}
          className="group inline-flex items-center gap-3 font-semibold tracking-[-0.03em] text-ink hover:text-accent transition-colors duration-200 cursor-pointer break-words"
          style={{ fontSize: "clamp(20px, 5vw, 44px)" }}
        >
          <HiEnvelope className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200" aria-hidden />
          {EMAIL}
        </a>
      </Reveal>

      <Reveal delay={0.06}>
        <FlagRule className="mt-8" thickness={6} width={92} />
      </Reveal>

      {/* Liens + CV */}
      <Reveal delay={0.12}>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-accent transition-colors duration-200 cursor-pointer"
            >
              <Icon size={17} aria-hidden />
              {label}
              <HiArrowUpRight size={13} aria-hidden className="opacity-50" />
            </a>
          ))}

          <a
            href="/cv/CV_Yattara_Aboubacar.pdf"
            download
            className="inline-flex items-center gap-2 min-h-11 py-1 text-[15px] font-medium text-ink hover:text-accent transition-colors duration-200 cursor-pointer"
          >
            Télécharger le CV
          </a>
        </div>
      </Reveal>

      {/* Mentions */}
      <Reveal delay={0.18}>
        <div className="mt-20 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
          <p className="meta">© {new Date().getFullYear()} Aboubacar Tidiane Yattara</p>
          <p className="meta">Next.js · TypeScript · Tailwind</p>
        </div>
      </Reveal>
    </>
  );
}
