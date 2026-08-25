"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const SECTIONS = [
  { href: "/admin", num: "00", label: "Tableau de bord", hint: "Vue d'ensemble" },
  { href: "/admin/projets", num: "01", label: "Projets", hint: "Réalisations" },
  { href: "/admin/competences", num: "02", label: "Compétences", hint: "Stack & méthode" },
  { href: "/admin/profil", num: "03", label: "Profil", hint: "Hero & contact" },
] as const;

/* /admin est le préfixe de toutes les autres routes : sans égalité stricte
   pour la racine, l'entrée « Tableau de bord » resterait active partout. */
export function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function useCurrentSection() {
  const pathname = usePathname();
  return SECTIONS.find((s) => isActive(pathname, s.href)) ?? SECTIONS[0];
}

export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections de l'administration" className="px-3">
      <p className="meta px-3 pt-2 pb-3">Navigation</p>
      <ul className="flex flex-col gap-0.5">
        {SECTIONS.map((s) => {
          const active = isActive(pathname, s.href);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-baseline gap-3 rounded-md px-3 py-2.5 transition-colors duration-200 ${
                  active
                    ? "bg-accent-soft text-ink"
                    : "text-muted hover:text-ink hover:bg-bg"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-accent"
                  />
                ) : null}
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  {s.num}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[14px] font-medium truncate">{s.label}</span>
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
