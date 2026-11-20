"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { DURATION, EASE, fadeInDown } from "@/components/Reveal";
import ThemeToggle from "@/components/sub/ThemeToggle";

/* L'ordre du récit, comme dans `PortfolioApp`. Plus de lien « Accueil » :
   le monogramme y ramène déjà, et quatre liens tiennent mieux qu'un menu de
   cinq dont le premier ne fait que remonter. */
const NAV_LINKS = [
  { id: "parcours", label: "Parcours" },
  { id: "projects", label: "Projets" },
  { id: "skills", label: "Expertise" },
  { id: "footer", label: "Contact" },
] as const;

/* Le hero reste suivi par le scroll spy même sans lien : sans lui, le
   premier lien serait marqué actif dès le haut de page. */
const SECTION_IDS = ["home", ...NAV_LINKS.map((l) => l.id)];
const PANEL_ID = "menu-mobile";

export default function NavBar() {
  const [activeId, setActiveId] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Avancement de la lecture, 0 → 1. Lu directement par le style : pas de
     state, donc pas de rendu React à chaque pixel de scroll. */
  const { scrollYProgress } = useScroll();

  /* Scroll spy + état « scrollé » du header */
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 8);

      const triggerY = window.scrollY + window.innerHeight * 0.38;
      let current = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= triggerY) current = id;
      }
      setActiveId(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Referme le panneau si on repasse en desktop, sinon il reste ouvert
     et invisible, en bloquant le scroll du body. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Panneau ouvert : verrou du scroll, Échap, et piège à focus.
     Le bouton hamburger reste dans le cycle puisqu'il sert de fermeture. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => {
      const inPanel = panelRef.current
        ? Array.from(panelRef.current.querySelectorAll<HTMLElement>("a[href], button"))
        : [];
      return triggerRef.current ? [triggerRef.current, ...inPanel] : inPanel;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a[href], button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const scrollTo = useCallback((id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    /* ⚠️ LE PANNEAU MOBILE EST UN FRÈRE DU HEADER, PAS SON ENFANT.

       Il y vivait, et il ne s'affichait pas : hauteur mesurée à 0 px, ouvert.
       La cause n'est ni le state ni l'animation — c'est que `backdrop-blur-md`
       sur le header lui fait établir un BLOC CONTENEUR pour ses descendants en
       `position: fixed` (comme le feraient `transform`, `filter` ou
       `perspective` ; et Framer écrit justement aussi un `transform` sur ce
       header). Le panneau se calait donc sur une boîte de 64 px de haut au
       lieu de la fenêtre : `top-16 bottom-0` y valait 64 px de haut moins
       64 px de haut, soit rien du tout. Aucune erreur, aucun avertissement,
       juste un panneau de zéro pixel.

       Sorti du header, son `fixed` retrouve la fenêtre. Le piège vaut pour
       tout ce qu'on ajouterait de `fixed` dans ce header à l'avenir. */
    <>
    {/* La navbar descend légèrement à l'ouverture de la page. `animate` et non
        `whileInView` : elle est visible d'emblée, un déclencheur au scroll ne
        partirait jamais. */}
    <motion.header
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || open
          ? /* Au scroll : fond plus translucide (le flou fait le travail),
               bordure visible et une ombre très basse, juste de quoi détacher
               le bandeau du contenu qui passe dessous. */
            "bg-bg/75 border-b border-line shadow-[0_1px_3px_rgba(26,26,24,0.04)]"
          : "bg-bg/90 border-b border-transparent"
      }`}
    >
      {/* Avancement de la lecture. `scaleX` + `origin-left` : le filet se
          dessine de gauche à droite, sans quoi il grandirait depuis son
          centre. Aucune courbe d'easing en jeu, la
          valeur suit le scroll au pixel. Décoratif, donc aria-hidden : le
          lecteur d'écran a déjà la structure en titres. */}
      <motion.span
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        /* `motion-reduce:hidden` : le filet est lié au scroll, pas à une
           animation — MotionConfig ne peut donc pas le neutraliser. Comme il
           est purement décoratif, on le retire simplement pour qui demande
           moins de mouvement. */
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand motion-reduce:hidden"
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-4">
        {/* Monogramme */}
        <button
          onClick={() => scrollTo("home")}
          className="font-mono text-[13px] tracking-[0.14em] text-ink hover:text-brand transition-colors duration-200 cursor-pointer py-3 -mx-1 px-1"
          aria-label="Retour en haut de page"
        >
          A.YATTARA
        </button>

        {/* Groupe de droite : liens (desktop), bascule de thème, hamburger.
            La bascule est HORS du panneau mobile et visible à toutes les
            largeurs — voir l'en-tête de `ThemeToggle`. */}
        <div className="flex items-center gap-1">
          {/* Liens — desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                aria-current={isActive ? "true" : undefined}
                className={`relative px-3 h-11 text-[14px] transition-colors duration-200 cursor-pointer ${
                  isActive ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
                {/* Un SEUL filet, partagé : `layoutId` fait glisser le même
                    élément d'un lien à l'autre au lieu d'en faire apparaître
                    un et disparaître un autre. C'est le mouvement qui dit
                    « vous vous déplacez dans une même page », là où deux
                    fondus croisés ne disaient rien. */}
                {isActive ? (
                  <motion.span
                    aria-hidden
                    layoutId="nav-active"
                    className="absolute left-3 right-3 bottom-2 h-px bg-brand"
                    transition={{ duration: DURATION, ease: EASE }}
                  />
                ) : null}
              </button>
            );
          })}
        </nav>

          <ThemeToggle />

          {/* Hamburger — mobile. 44x44 minimum. */}
          <button
            ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="md:hidden relative h-11 w-11 -mr-2 flex flex-col items-center justify-center gap-[5px] cursor-pointer"
        >
          <span
            aria-hidden
            className={`block h-[1.5px] w-6 bg-ink transition-transform duration-300 ${
              open ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            aria-hidden
            className={`block h-[1.5px] w-6 bg-ink transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            aria-hidden
            className={`block h-[1.5px] w-6 bg-ink transition-transform duration-300 ${
              open ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
          </button>
        </div>
      </div>

    </motion.header>

      {/* Panneau mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-bg overflow-y-auto overscroll-contain"
          >
            <nav className="px-5 pt-2 pb-10" aria-label="Navigation mobile">
              <ul>
                {NAV_LINKS.map((link) => {
                  const isActive = activeId === link.id;
                  return (
                    <li key={link.id} className="border-b border-line">
                      <button
                        onClick={() => scrollTo(link.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`w-full text-left flex items-center gap-3 py-5 text-[22px] font-medium tracking-[-0.02em] transition-colors duration-200 cursor-pointer ${
                          isActive ? "text-brand" : "text-ink"
                        }`}
                      >
                        <span aria-hidden className="font-mono text-[12px] text-ink-muted w-6">
                          {String(NAV_LINKS.indexOf(link) + 1).padStart(2, "0")}
                        </span>
                        {link.label}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <a
                href="/cv/CV_Yattara_Aboubacar.pdf"
                download
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex items-center justify-center h-12 w-full rounded-md bg-brand text-brand-on text-[15px] font-medium cursor-pointer"
              >
                Télécharger le CV
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
