"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, House, Route, UserRound, Wrench } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/* Barre latérale de la console : la STRUCTURE vient de l'admin Guidoc
   (bandeau de marque en haut, groupe « Administration », entrée active en
   pastille avec son point à droite, pas de pied de barre — compte, thème et
   déconnexion vivent dans le menu du bandeau). Les COULEURS viennent du
   portfolio : encre au lieu du marine, rouge du drapeau au lieu du bleu, et
   le liseré tricolore comme signature. */

type NavItem = {
  title: string;
  url: string;
  icon: typeof House;
  /* /admin préfixe toutes les autres routes : sans correspondance stricte,
     « Tableau de bord » resterait actif partout. */
  exact?: boolean;
};

const navMain: NavItem[] = [
  { title: "Tableau de bord", url: "/admin", icon: House, exact: true },
  { title: "Parcours", url: "/admin/parcours", icon: Route },
  { title: "Projets", url: "/admin/projets", icon: FolderKanban },
  { title: "Compétences", url: "/admin/competences", icon: Wrench },
  { title: "Profil", url: "/admin/profil", icon: UserRound },
];

function isActive(pathname: string, url: string, exact?: boolean) {
  return exact
    ? pathname === url
    : pathname === url || pathname.startsWith(url + "/");
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative h-16 overflow-hidden border-b border-sidebar-border p-0">
        <div className="brand-band absolute inset-0" />
        <Link
          href="/admin"
          className="group relative z-10 flex h-full w-full items-center gap-2.5 px-4"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-[13px] font-medium text-white ring-1 ring-inset ring-white/20">
            AY
          </span>
          <div className="flex flex-col gap-1 group-data-[state=collapsed]:hidden">
            <span className="text-sm font-semibold leading-none tracking-[-0.01em] text-white">
              Yattara
            </span>
            {/* Mono capitales espacées : le seul signal « tech » de la charte.
                Pas de jaune ici — la charte l'interdit sur du texte, quel que
                soit son contraste. */}
            <span className="font-mono text-[10px] uppercase leading-none tracking-[0.18em] text-white/60">
              Administration
            </span>
          </div>
        </Link>

        {/* Liseré tricolore — la signature du portfolio, en lieu et place du
            badge de rôle de Guidoc. Décoratif et `aria-hidden` : le jaune du
            drapeau ne mesure que 1.41:1 et ne doit rien porter d'informatif. */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 z-10 flex h-[3px]">
          <span className="flex-1 bg-flag-red" />
          <span className="flex-1 bg-flag-yellow" />
          <span className="flex-1 bg-flag-green" />
        </span>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          {/* Mono capitales espacées : la « meta » de la charte du site. */}
          <SidebarGroupLabel className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navMain.map((item) => {
                const active = isActive(pathname, item.url, item.exact);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={active}
                      tooltip={item.title}
                      className={cn(
                        "h-9 rounded-md transition-colors duration-150",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon
                        className={cn("size-4 shrink-0", active && "text-primary")}
                      />
                      <span className="text-sm">{item.title}</span>
                      {active && (
                        <div
                          aria-hidden
                          className="ml-auto size-1.5 rounded-full bg-primary"
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
