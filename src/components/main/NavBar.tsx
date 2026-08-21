"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { id: "home",     label: "Accueil"  },
  { id: "skills",   label: "Expertise" },
  { id: "projects", label: "Projets"  },
  { id: "footer",   label: "Contact"  },
] as const;

const SECTION_IDS = NAV_LINKS.map((l) => l.id);

export default function NavBar() {
  const [activeId, setActiveId] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);

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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-bg/85 backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between gap-6">
        {/* Monogramme */}
        <button
          onClick={() => scrollTo("home")}
          className="font-mono text-[13px] tracking-[0.14em] text-ink hover:text-accent transition-colors duration-200 cursor-pointer"
          aria-label="Retour en haut de page"
        >
          A.YATTARA
        </button>

        {/* Liens */}
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                aria-current={isActive ? "true" : undefined}
                className={`relative px-2.5 sm:px-3 py-2 text-[14px] transition-colors duration-200 cursor-pointer ${
                  isActive ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
                <span
                  aria-hidden
                  className={`absolute left-2.5 right-2.5 sm:left-3 sm:right-3 -bottom-px h-px bg-accent transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
