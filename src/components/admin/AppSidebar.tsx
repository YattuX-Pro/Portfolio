"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FolderKanban,
  House,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { signOutAction } from "@/app/admin/login/actions";

/* Compétences et Profil sont regroupés sous « Contenu » : ce sont deux
   facettes de la même chose — ce que le portfolio raconte — et ils vivent
   maintenant en onglets sous une route commune. */

type NavItem = {
  title: string;
  url: string;
  icon: typeof House;
  /* /admin préfixe toutes les autres routes : sans correspondance stricte,
     « Tableau de bord » resterait actif partout. */
  exact?: boolean;
};

const NAV: NavItem[] = [
  { title: "Tableau de bord", url: "/admin", icon: House, exact: true },
  { title: "Projets", url: "/admin/projets", icon: FolderKanban },
  { title: "Contenu", url: "/admin/contenu", icon: SlidersHorizontal },
];

function isActive(pathname: string, url: string, exact?: boolean) {
  return exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");
}

export default function AppSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Bandeau de marque : le tricolore guinéen, comme sur le site public. */}
      <SidebarHeader className="h-16 border-b border-sidebar-border p-0 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 flex">
          <span className="flex-1 bg-flag-red" />
          <span className="flex-1 bg-flag-yellow" />
          <span className="flex-1 bg-flag-green" />
        </div>
        {/* Voile sombre : le jaune est à 1.41:1, illisible sous du texte. */}
        <div aria-hidden className="absolute inset-0 bg-ink/85" />

        <Link
          href="/admin"
          className="relative z-10 flex h-full w-full items-center gap-2.5 px-4 group"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10 font-mono text-[13px] font-medium text-white">
            AY
          </span>
          <span className="flex flex-col gap-0.5 group-data-[state=collapsed]:hidden">
            <span className="text-sm font-semibold leading-none text-white">
              Yattara
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
              Admin
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV.map((item) => {
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
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                      )}
                    >
                      <item.icon
                        className={cn("size-4 shrink-0", active && "text-primary")}
                      />
                      <span className="text-sm">{item.title}</span>
                      {active ? (
                        <span
                          aria-hidden
                          className="ml-auto size-1.5 rounded-full bg-primary"
                        />
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Voir le site"
              className="h-9 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              render={
                <Link href="/" target="_blank">
                  <ExternalLink className="size-4 shrink-0" />
                  <span className="text-sm">Voir le site</span>
                </Link>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOutAction}>
              <SidebarMenuButton
                type="submit"
                tooltip="Déconnexion"
                className="h-9 w-full rounded-md text-sidebar-foreground/60 hover:text-primary hover:bg-sidebar-accent/60"
              >
                <LogOut className="size-4 shrink-0" />
                <span className="text-sm">Déconnexion</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
        <p
          className="truncate px-2 pb-1 font-mono text-[10px] text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden"
          title={email}
        >
          {email}
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
