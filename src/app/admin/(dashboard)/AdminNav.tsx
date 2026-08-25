"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const SECTIONS = [
  { href: "/admin", num: "01", label: "Projets", hint: "Réalisations" },
  { href: "/admin/competences", num: "02", label: "Compétences", hint: "Stack & méthode" },
  { href: "/admin/profil", num: "03", label: "Profil", hint: "Hero & contact" },
] as const;

/* /admin est le préfixe de toutes les autres routes : sans égalité stricte
   pour la racine, l'onglet Projets resterait actif partout. */
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Colonne verticale, à partir de lg. */
export function AdminSideNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections de l'administration" className="sticky top-8">
      <p className="meta pb-3 border-b border-line">Sections</p>
      <ul className="mt-1">
        {SECTIONS.map((s) => {
          const active = isActive(pathname, s.href);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-baseline gap-3 py-3 border-b border-line transition-colors duration-200 ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span
                  className={`font-mono text-[12px] tabular-nums ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  {s.num}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[15px] font-medium truncate">{s.label}</span>
                  <span className="meta truncate">{s.hint}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Rangée horizontale, en dessous de lg. Défilable si l'écran est étroit. */
export function AdminTabNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections de l'administration"
      className="lg:hidden border-b border-line overflow-x-auto scrollbar-hidden"
    >
      <ul className="flex items-center gap-1 max-w-5xl mx-auto px-5 sm:px-8">
        {SECTIONS.map((s) => {
          const active = isActive(pathname, s.href);
          return (
            <li key={s.href} className="shrink-0">
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center h-12 px-3 text-[14px] border-b-2 -mb-px transition-colors duration-200 ${
                  active
                    ? "text-ink border-accent"
                    : "text-muted border-transparent hover:text-ink"
                }`}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
