"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  FolderKanbanIcon,
  LayersIcon,
  UserIcon,
  ExternalLinkIcon,
  LogOutIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { signOutAction } from "@/app/admin/login/actions";

const SECTIONS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboardIcon },
  { href: "/admin/projets", label: "Projets", icon: FolderKanbanIcon },
  { href: "/admin/competences", label: "Compétences", icon: LayersIcon },
  { href: "/admin/profil", label: "Profil", icon: UserIcon },
] as const;

/* /admin préfixe toutes les autres routes : sans égalité stricte pour la
   racine, « Tableau de bord » resterait actif partout. */
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = SECTIONS.find((s) => isActive(pathname, s.href)) ?? SECTIONS[0];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="font-mono text-[13px] tracking-[0.14em] group-data-[collapsible=icon]:hidden">
              ADMIN
            </span>
            {/* Filet tricolore guinéen, comme sur le site public. */}
            <span aria-hidden className="flex items-center gap-1">
              <span className="block h-1.5 w-3 bg-flag-red" />
              <span className="block h-1.5 w-3 bg-flag-yellow" />
              <span className="block h-1.5 w-3 bg-flag-green" />
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SECTIONS.map((s) => (
                  <SidebarMenuItem key={s.href}>
                    <SidebarMenuButton
                      isActive={isActive(pathname, s.href)}
                      tooltip={s.label}
                      render={
                        <Link href={s.href}>
                          <s.icon />
                          <span>{s.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Voir le site"
                render={
                  <Link href="/" target="_blank">
                    <ExternalLinkIcon />
                    <span>Voir le site</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <form action={signOutAction}>
                <SidebarMenuButton type="submit" tooltip="Déconnexion" className="w-full">
                  <LogOutIcon />
                  <span>Déconnexion</span>
                </SidebarMenuButton>
              </form>
            </SidebarMenuItem>
          </SidebarMenu>
          <p
            className="px-2 pb-1 text-xs text-sidebar-foreground/60 truncate group-data-[collapsible=icon]:hidden"
            title={email}
          >
            {email}
          </p>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink render={<Link href="/admin">Administration</Link>} />
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Pleine largeur : un back-office n'est pas une page de lecture. */}
        <main className="flex-1 p-4 md:p-6">{children}</main>

        <footer className="border-t px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Aboubacar Tidiane Yattara</p>
            <p>Neon Postgres · eu-central-1</p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
