"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowRight, HiDownload } from "react-icons/hi";
import {
  EASE,
  HOVER_LIFT,
  INTERACTION_TRANSITION,
  TAP_PRESS,
  revealGroup,
  revealItem,
} from "@/components/Reveal";
import FlagRule from "@/components/FlagRule";
import AnimatedCounter from "@/components/sub/AnimatedCounter";
import HeroBackdrop from "@/components/sub/HeroBackdrop";
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
    /* `relative` : ancre le fond décoratif, qui est en absolu. */
    <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-16 items-start">
      <HeroBackdrop />

      {/* ── Colonne principale ───────────────────────────────────────── */}
      <motion.div
        variants={revealGroup}
        initial="hidden"
        animate="visible"
        className="lg:col-span-7 xl:col-span-7"
      >
        {/* Eyebrow */}
        <motion.p variants={revealItem} className="meta flex items-center gap-2.5">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
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

        {/* Nom — révélé LIGNE PAR LIGNE.
            Le titre était un seul bloc : à 92px, tout le nom apparaissait
            d'un coup et la cadence du reste de la page s'arrêtait net sur
            l'élément le plus grand. Chaque ligne devient un enfant du même
            groupe, donc hérite du stagger de 60ms sans nouvelle courbe ni
            nouvelle durée. `block` : deux lignes de bloc remplacent le <br>,
            que le fondu aurait laissé sauter d'un coup. */}
        <h1
          className="font-display font-semibold mt-6 leading-[0.95] tracking-[-0.035em] text-ink"
          style={{ fontSize: "clamp(30px, 9vw, 92px)" }}
        >
          <motion.span variants={revealItem} className="block">
            Aboubacar Tidiane
          </motion.span>
          <motion.span variants={revealItem} className="block">
            Yattara<span className="text-brand">.</span>
          </motion.span>
        </h1>

        {/* Filet tricolore — Guinée */}
        <motion.div variants={revealItem}>
          <FlagRule className="mt-8" thickness={6} width={92} delay={0.15} />
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={revealItem}
          className="mt-8 max-w-prose text-[18px] leading-[1.7] text-ink-muted"
        >
          {settings?.heroBio}
        </motion.p>

        {/* CTA */}
        <motion.div variants={revealItem} className="mt-9 flex flex-wrap items-center gap-3">
          {/* `motion.button` plutôt qu'un `hover:` CSS : le survol et l'appui
              partagent les presets du site, et Framer ramène proprement
              l'élément à sa position même si le curseur sort en plein
              mouvement — ce qu'une transition CSS fait mal. */}
          <motion.button
            onClick={() => onNavigate?.("projects")}
            whileHover={HOVER_LIFT}
            whileTap={TAP_PRESS}
            transition={INTERACTION_TRANSITION}
            className="group inline-flex flex-1 sm:flex-none justify-center items-center gap-2 h-12 px-5 rounded-md bg-brand text-white text-[15px] font-medium hover:bg-brand-hover transition-colors duration-200 cursor-pointer"
          >
            Voir mes projets
            <HiArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </motion.button>

          {settings?.cvUrl ? (
            <motion.a
              href={settings.cvUrl}
              download
              whileHover={HOVER_LIFT}
              whileTap={TAP_PRESS}
              transition={INTERACTION_TRANSITION}
              className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 h-12 px-5 rounded-md border border-line-strong text-ink text-[15px] font-medium hover:border-ink hover:bg-surface transition-colors duration-200 cursor-pointer"
            >
              <HiDownload size={15} aria-hidden />
              Télécharger le CV
            </motion.a>
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
                <AnimatedCounter
                  value={s.value}
                  className="font-display font-semibold text-[28px] tracking-[-0.02em] leading-none text-ink"
                />
                <span className="meta">{s.label}</span>
              </div>
            ))}

            <div className="flex items-center gap-1 -ml-2.5 w-full sm:w-auto sm:ml-auto">
              {socials.map(({ href, label, icon: Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={HOVER_LIFT}
                  whileTap={TAP_PRESS}
                  transition={INTERACTION_TRANSITION}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-md text-ink-muted hover:text-brand hover:bg-brand-soft transition-colors duration-200 cursor-pointer"
                >
                  <Icon size={18} aria-hidden />
                </motion.a>
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
          /* Pas de carte : ni bordure, ni coins arrondis. La colonne reste
             une colonne, le dégradé est juste posé derrière.

             `radial-gradient` ancré à `100% 0%` — le coin HAUT DROIT — et
             éteint à 80% : la teinte est dense dans l'angle et s'évanouit en
             descendant vers la gauche. Un dégradé linéaire aurait laissé un
             bord franc sur tout un côté ; ici la seule arête possible est le
             coin lui-même.

             `lg:rounded-t-[2rem]` arrondit LES DEUX coins du haut : le rayon
             de bordure découpe l'image de fond, donc la teinte suit la courbe.

             Les deux, et pas seulement celui de gauche : le foyer du dégradé
             est au coin haut DROIT, c'est donc là que la teinte est la plus
             dense et que l'angle droit se voyait le plus. Les coins du bas
             restent carrés — la teinte y est déjà éteinte, les arrondir ne se
             verrait pas.

             ⚠️ L'arrêt est passé de 70% à 80% POUR CETTE RAISON. Le coin haut
             gauche se situe à 77% du rayon du dégradé : à 70% il était encore
             transparent, et arrondir un angle sans couleur ne se voyait pas.
             À 80% il porte de la teinte, donc la courbe apparaît.

             `--brand-veil` est le rouge de la charte à 12% (voir globals.css) :
             plus présent que `--brand-soft`, qui se confondait avec le fond,
             et sans couleur nouvelle.

             `lg:pr-6` garde la gouttière à droite : les valeurs sont alignées
             à droite et la colonne touche le bord interne du conteneur. */
          className="hidden lg:col-span-4 lg:col-start-9 lg:block lg:pt-3 lg:pr-6 lg:rounded-t-[2rem] lg:bg-[radial-gradient(130%_95%_at_100%_0%,var(--brand-veil)_0%,transparent_80%)]"
        >
          <p className="meta">Stack principale</p>
          <FlagRule className="mt-3 mb-1" thickness={3} width={26} delay={0.4} />
          <dl>
            {stack.map((s) => (
              <div
                key={s.id}
                className="flex items-baseline justify-between gap-4 border-b border-line py-3"
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
