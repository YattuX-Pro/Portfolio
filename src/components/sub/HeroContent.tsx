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

  return (
    /* `lg:items-stretch` : la colonne du capitaine prend la hauteur du texte
       d'en face, et le texte se centre verticalement dans la sienne. */
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-10 lg:items-stretch">

      {/* ── Colonne principale ───────────────────────────────────────────
          PREMIÈRE dans le DOM, même si le capitaine passe au-dessus sur
          mobile (`order-2`) : un lecteur d'écran et la touche Tab
          rencontrent le nom et les boutons avant l'illustration. */}
      <motion.div
        variants={revealGroup}
        initial="hidden"
        animate="visible"
        className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-7"
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
            className="group inline-flex flex-1 sm:flex-none justify-center items-center gap-2 h-12 px-5 rounded-md bg-brand text-brand-on text-[15px] font-medium hover:bg-brand-hover transition-colors duration-200 cursor-pointer"
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

        {/* ── Bas de hero : le chronographe ────────────────────────────
            Prend la place de la rangée de chiffres (« 5+ Projets, 3+ Années,
            2 Domaines »), qui vivait ici. Deux d'entre eux faisaient doublon
            avec ce relevé — « 3+ ANNÉES » le contredisait même ouvertement —
            et il fallait toute la largeur de la colonne pour tenir la suite
            sur une seule ligne. Les lignes restent en base et dans l'admin.

            Les réseaux sociaux gardent leur place en bout de ligne, alignés
            sur le TITRE et non sur le relevé : `items-start`, sinon les deux
            boutons de 44px se centraient sur un bloc deux fois plus haut et
            descendaient sous les chiffres.

            `min-w-0` sur le compteur : il contient une ligne en
            `whitespace-nowrap`, et un enfant flex refuse par défaut de passer
            sous sa largeur de contenu. Sans lui, une suite trop longue aurait
            poussé les icônes hors du cadre au lieu de rester dans sa boîte.

            SOUS 640px, `basis-full` donne la ligne entière au compteur et les
            réseaux passent dessous. C'est ce qui débloque sa taille : tant
            qu'il partageait la rangée avec deux boutons de 44px, il devait
            rester petit pour leur laisser la place, et un relevé de 28px de
            haut coincé dans un coin ne se lit pas comme un afficheur. Sur
            téléphone il occupe maintenant toute la largeur utile — c'est le
            premier chiffre qu'on voit sous le CV.

            `grow basis-0` au-dessus : le compteur prend TOUT le reste de la
            rangée au lieu de se dimensionner sur ses chiffres. Ce n'est pas
            cosmétique — son corps est en `cqw`, donc calculé sur sa propre
            boîte : tant qu'il se réglait sur son contenu, la boîte dépendait
            du texte qui dépendait de la boîte, et le chiffre s'effondrait. */}
        <motion.div
          variants={revealItem}
          className="mt-12 sm:mt-14 pt-6 border-t border-line"
        >
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-6">
            {settings?.experienceStartAt ? (
              <ExperienceCounter
                startAt={settings.experienceStartAt}
                className="min-w-0 grow basis-full sm:basis-0"
              />
            ) : null}

            <div className="flex shrink-0 items-center gap-1 -ml-2.5 sm:ml-0 -mr-2.5">
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
