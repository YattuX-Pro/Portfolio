"use client";

import Reveal, { STAGGER } from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import type { Experience } from "@/lib/db/schema";

/* ── Parcours, en journal de bord ──────────────────────────────────────────
   Chaque poste est une ESCALE, numérotée à rebours depuis la plus récente ;
   la plus ancienne est le « Port de départ ». Le numéro n'est pas en base :
   il se déduit de l'ordre, donc un ajout depuis l'admin renumérote tout seul.

   Même grammaire que la fiche Expertise : une ligne par entrée, la colonne
   de marge en mono à gauche, le contenu à droite, des filets entre les
   lignes et rien d'autre.

   Le repère carré dit la nature de l'étape sans un mot : rouge de marque
   pour le poste en cours, encre pour un poste, vert pour une formation. Le
   vert officiel (3.72:1) est permis ici parce que c'est un graphisme, pas du
   texte — et la même information est écrite juste à côté. */

const MARKER: Record<string, string> = {
  work: "bg-ink",
  education: "bg-flag-green",
};

function stopLabel(index: number, total: number, current: boolean) {
  if (index === total - 1) return "Port de départ";
  const n = String(total - index).padStart(2, "0");
  return `Escale ${n}${current ? " · en cours" : ""}`;
}

export default function Journey({ steps }: { steps: Experience[] }) {
  return (
    <>
      <SectionHeader
        num="01"
        label="Parcours"
        title="De junior à Lead Dev en vingt-six mois."
        intro="Mon journal de bord : trois escales chez Netsen Group, après un stage chez eMsanté et une traversée depuis l'instrumentation."
        illustration={{
          src: "/pirate/carte.png",
          width: 720,
          height: 480,
          display: { mobile: 220, desktop: 340 },
          tilt: -3,
        }}
      />

      {/* <ol> : les étapes sont ordonnées, de la plus récente à la plus
          ancienne. */}
      <ol className="border-t border-line">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className="grid grid-cols-1 gap-x-10 gap-y-2.5 border-b border-line py-7 lg:grid-cols-12"
          >
            {/* Chaque ligne se révèle à son entrée dans le champ : la marge
                d'abord, le contenu un pas de 60 ms après. */}
            <Reveal className="lg:col-span-3">
              <p className="meta flex items-center gap-2.5 text-ink">
                <span
                  aria-hidden
                  className={`block size-2.5 shrink-0 ${
                    step.current ? "bg-brand" : (MARKER[step.kind] ?? "bg-ink")
                  }`}
                />
                {step.period}
              </p>
              <p className="meta mt-2 pl-5">{stopLabel(i, steps.length, step.current)}</p>
            </Reveal>

            <Reveal className="min-w-0 lg:col-span-9" delay={STAGGER}>
              <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.02em] text-ink">
                {step.title}
              </h3>
              <p className="mt-1 text-[15px] text-ink-muted">{step.organization}</p>
              {step.summary ? (
                <p className="mt-2.5 max-w-prose text-[16px] leading-[1.65] text-ink">
                  {step.summary}
                </p>
              ) : null}
            </Reveal>
          </li>
        ))}
      </ol>
    </>
  );
}
