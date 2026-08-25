"use client";

import Reveal from "@/components/Reveal";

/* En-tête de section : numéro en mono + titre.
   Le numéro en rouge accent est le seul rappel de couleur ici —
   le filet tricolore, lui, sert de séparateur entre les sections. */
export default function SectionHeader({
  num,
  label,
  title,
  intro,
}: {
  num: string;
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="mb-12 sm:mb-14">
      <Reveal>
        <p className="meta">
          <span className="text-accent">{num}</span>
          <span aria-hidden className="mx-2 text-line-strong">
            /
          </span>
          {label}
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <h2
          className="font-semibold tracking-[-0.03em] leading-[1.05] text-ink mt-4"
          style={{ fontSize: "clamp(26px, 5vw, 46px)" }}
        >
          {title}
        </h2>
      </Reveal>

      {intro && (
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-prose text-[18px] leading-[1.7] text-muted">{intro}</p>
        </Reveal>
      )}
    </header>
  );
}
