"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/contenu/competences", label: "Compétences" },
  { href: "/admin/contenu/profil", label: "Profil" },
] as const;

/* Onglets sous forme de liens et non de Tabs à état : chaque onglet garde son
   URL, donc il est partageable et le bouton retour du navigateur fonctionne. */
export default function ContentTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections du contenu"
      className="flex items-center gap-1 overflow-x-auto px-4 md:px-6"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex h-11 shrink-0 items-center border-b-2 px-3 text-sm transition-colors duration-150",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
