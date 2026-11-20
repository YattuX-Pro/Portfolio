"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowRight, HiDownload } from "react-icons/hi";
import {
  DURATION,
  EASE,
  HOVER_LIFT,
  INTERACTION_TRANSITION,
  TAP_PRESS,
  revealGroup,
  revealItem,
} from "@/components/Reveal";
import ExperienceCounter from "@/components/sub/ExperienceCounter";
import CompassDial from "@/components/sub/CompassDial";
import HeroCaptain from "@/components/sub/HeroCaptain";
import type { SiteData } from "@/lib/db/queries";

type Social = { href: string; label: string; icon: typeof FaGithub };

export default function HeroContent({
  data,
  onNavigate,
}: {
  data: SiteData;
  onNavigate?: (id: string) => void;
}) {
  const { settings } = data;

  const socials: Social[] = [
    settings?.githubUrl && { href: settings.githubUrl, label: "GitHub", icon: FaGithub },
    settings?.linkedinUrl && {
      href: settings.linkedinUrl,
      label: "LinkedIn",
      icon: FaLinkedin,
    },
  ].filter(Boolean) as Social[];

  const socialLinks = (
    <div className="-ml-2.5 flex items-center gap-1">
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
  );

  return (
    /* `lg:items-center` : la colonne du capitaine a une hauteur fixe (voir
       `HeroCaptain`) et se centre en face du texte. */
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-10 lg:items-center">

      {/* ── Colonne principale ───────────────────────────────────────────
          PREMIÈRE dans le DOM, même si le capitaine passe au-dessus sur
          mobile (`order-2`) : un lecteur d'écran et la touche Tab
          rencontrent le nom et les boutons avant l'illustration. */}
      <motion.div
        variants={revealGroup}
        initial="hidden"
        animate="visible"
        className="order-2 lg:order-1 lg:col-span-7"
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
        {/* ── LE HERO TIENT DANS L'ÉCRAN, en desktop ──────────────────────
            À partir de 1024 px, tout le hero — nom, boutons, chronographe —
            doit se lire sans défiler. Sur un portable (1366×768, ~660 px
            utiles une fois le navigateur ouvert) il en faisait 850. Le corps
            du titre et les marges verticales suivent donc la HAUTEUR de
            l'écran (`svh`), plafonnés à leurs valeurs d'origine : un grand
            écran ne voit aucun changement. Le `9svh` du titre est sans effet
            sur un téléphone en portrait, où `9vw` est toujours plus petit.
            Sous 1024 px, texte et capitaine s'empilent et le hero défile :
            ces réglages ne s'y appliquent pas (`lg:`). */}
        <h1
          className="font-display font-semibold mt-6 lg:mt-[clamp(12px,2.5svh,24px)] leading-[0.95] tracking-[-0.035em] text-ink"
          style={{ fontSize: "clamp(30px, min(9vw, 9svh), 92px)" }}
        >
          <motion.span variants={revealItem} className="block">
            Aboubacar Tidiane
          </motion.span>
          <motion.span variants={revealItem} className="block">
            Yattara<span className="text-brand">.</span>
          </motion.span>
        </h1>

        {/* Bio */}
        <motion.p
          variants={revealItem}
          className="mt-8 lg:mt-[clamp(12px,3svh,32px)] max-w-prose text-[18px] leading-[1.7] text-ink-muted"
        >
          {settings?.heroBio}
        </motion.p>

        {/* CTA — LES DEUX BOUTONS TIENNENT SUR UNE LIGNE, MÊME SUR TÉLÉPHONE.
            Sur 350 px utiles, chacun en reçoit 171 : à 15 px de corps et
            20 px de marge, « Voir mes projets » et « Télécharger le CV »
            passaient sur deux lignes à l'intérieur de leur bouton. Sous 640
            px le corps descend à 14 px, la marge à 12 et l'écart à 8, et le
            texte ne se coupe plus (`whitespace-nowrap`). Sous 375 px les
            icônes disparaissent : c'est ce qui fait encore tenir les deux
            libellés sur un écran de 360. */}
        <motion.div variants={revealItem} className="mt-9 lg:mt-[clamp(16px,3svh,36px)] flex flex-nowrap items-center gap-2 sm:flex-wrap sm:gap-3">
          {/* `motion.button` plutôt qu'un `hover:` CSS : le survol et l'appui
              partagent les presets du site, et Framer ramène proprement
              l'élément à sa position même si le curseur sort en plein
              mouvement — ce qu'une transition CSS fait mal. */}
          <motion.button
            onClick={() => onNavigate?.("projects")}
            whileHover={HOVER_LIFT}
            whileTap={TAP_PRESS}
            transition={INTERACTION_TRANSITION}
            className="group inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 sm:gap-2 h-12 px-3 sm:px-5 whitespace-nowrap rounded-md bg-brand text-brand-on text-[14px] sm:text-[15px] font-medium hover:bg-brand-hover transition-colors duration-200 cursor-pointer"
          >
            Voir mes projets
            <HiArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5 max-[374px]:hidden"
            />
          </motion.button>

          {settings?.cvUrl ? (
            <motion.a
              href={settings.cvUrl}
              download
              whileHover={HOVER_LIFT}
              whileTap={TAP_PRESS}
              transition={INTERACTION_TRANSITION}
              className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 sm:gap-2 h-12 px-3 sm:px-5 whitespace-nowrap rounded-md border border-line-strong text-ink text-[14px] sm:text-[15px] font-medium hover:border-ink hover:bg-surface transition-colors duration-200 cursor-pointer"
            >
              <HiDownload size={15} aria-hidden className="max-[374px]:hidden" />
              Télécharger le CV
            </motion.a>
          ) : null}
        </motion.div>

        {/* ── Bas de hero : le chronographe et sa boussole ──────────────
            Prend la place de la rangée de chiffres (« 5+ Projets, 3+ Années,
            2 Domaines »), qui vivait ici. Deux d'entre eux faisaient doublon
            avec ce relevé — « 3+ ANNÉES » le contredisait même ouvertement.

            La boussole (`CompassDial`) est passée au compteur comme
            instrument : c'est `ExperienceCounter` qui les dispose, parce que
            sur téléphone la boussole se range à côté de SON libellé et que
            seul lui connaît ses lignes.

            Les réseaux sociaux passent SOUS LE RELEVÉ, à gauche de la
            boussole : elle est plus haute que libellé + relevé, et la place
            libre à côté d'elle les accueille. Rangés sous le bloc, ils
            ajoutaient 60 px au hero pour rien. */}
        <motion.div
          variants={revealItem}
          className="mt-12 sm:mt-14 lg:mt-[clamp(16px,3.5svh,56px)] pt-6 lg:pt-[clamp(12px,2.5svh,24px)] border-t border-line"
        >
          {settings?.experienceStartAt ? (
            <ExperienceCounter startAt={settings.experienceStartAt} dial={<CompassDial />}>
              {socialLinks}
            </ExperienceCounter>
          ) : (
            socialLinks
          )}
        </motion.div>
      </motion.div>

      {/* ── Colonne droite — le capitaine ─────────────────────────────────
          `initial/animate` plutôt qu'un enfant de `revealGroup` : la colonne
          n'appartient pas à la série de gauche, elle entre une fois, avec son
          propre retard. Le conteneur (voile, arrondi, hauteur) vit dans
          `HeroCaptain` : ici il ne reste que le placement en grille.

          Elle remplace `StackPanel` et le dessin du chronographe : la stack
          principale tourne désormais autour du capitaine, et la boussole
          répond au compteur d'ancienneté dans la colonne principale. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION, ease: EASE, delay: 0.32 }}
        className="order-1 lg:order-2 lg:col-span-5"
      >
        <HeroCaptain />
      </motion.div>
    </div>
  );
}
