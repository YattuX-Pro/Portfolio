"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ESCALES } from "./config";

/* ══════════════════════════════════════════════════════════════════════════
   LA ROUTE — la progression GLOBALE du voyage, au pied de la navbar.

   Elle remplace le filet de lecture : la route en pointillés, la part
   parcourue en rouge (le même `scaleX` que l'ancien filet), un port par
   escale à l'endroit exact où l'ancre de l'escale amène le scroll, et un
   petit navire en tête de route.

   Les ports sont des positions RELATIVES à la hauteur de page : mesurées au
   montage, puis à chaque changement de taille du document (images chargées,
   fenêtre redimensionnée) — sinon ils dériveraient de leur escale.

   Décorative (`aria-hidden`) : les liens de la navbar portent la
   navigation et l'escale active (`aria-current`). Liée au scroll, donc
   retirée sous mouvement réduit (`motion-reduce:hidden`), comme l'ancien
   filet.
   ══════════════════════════════════════════════════════════════════════════ */

/* L'ancre amène le haut de l'escale à 80 px du haut (`scroll-mt-20`). */
const ANCHOR_OFFSET = 80;

export default function Route({ activeId }: { activeId: string }) {
  const { scrollYProgress } = useScroll();
  const shipX = useTransform(scrollYProgress, (p) => `${p * 100}%`);
  const [ports, setPorts] = useState<{ id: string; at: number }[]>([]);

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setPorts(
        ESCALES.flatMap(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return [];
          const top = el.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET;
          return [{ id, at: Math.min(1, Math.max(0, top / max)) }];
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const active = ESCALES.findIndex((e) => e.id === activeId);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-4 motion-reduce:hidden">
      <span className="absolute inset-x-0 bottom-0 border-b border-dashed border-line-strong" />
      <motion.span
        style={{ scaleX: scrollYProgress }}
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand"
      />

      {/* Ports et navire partagent une piste rentrée de la demi-largeur du
          navire : il reste entier aux deux bouts, et tombe pile sur le port
          de l'escale où l'ancre l'amène. */}
      <div className="absolute inset-y-0 left-[9px] right-[9px]">
        {ports.map((p, i) => (
          <span
            key={p.id}
            style={{ left: `${p.at * 100}%` }}
            className={`absolute bottom-0 size-[7px] -translate-x-1/2 translate-y-1/2 rounded-full border transition-colors duration-200 ${
              i <= active ? "border-brand bg-brand" : "border-line-strong bg-bg"
            }`}
          />
        ))}

        {/* Le navire : une silhouette à l'encre, nette à 18 px, là où
            l'illustration peinte ne serait qu'une tache. */}
        <motion.div style={{ x: shipX }} className="absolute inset-0">
          <svg viewBox="0 0 24 18" className="absolute bottom-[2px] left-0 h-[13px] w-[18px] -translate-x-1/2 fill-ink">
            <path d="M1 12h22l-3.5 5h-15z" />
            <path d="M11.25 1h1.5v11h-1.5z" />
            <path d="M12.9 2.6c4 1.8 5.6 5.2 5.2 8.4h-5.2z" />
            <path d="M11.1 4c-3 1.6-4.4 4.2-4.2 7h4.2z" />
            <path d="M12.9.6l3.2 1-3.2 1z" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
