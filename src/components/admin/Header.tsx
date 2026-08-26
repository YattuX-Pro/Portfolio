"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

import { useAdminUser } from "@/components/admin/AdminUserProvider";
import { signOutAction } from "@/app/admin/login/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

/* Bandeau de la console, repris de l'admin Guidoc (components/layout/header).
   Rendu par CHAQUE page et non par le layout : la page connaît son titre, sa
   description et ses actions, le layout non.

   `children` reçoit la barre d'onglets quand la page en a — elle se colle
   sous le bandeau et reste visible au défilement. */
export default function Header({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const user = useAdminUser();
  const confirm = useConfirm();
  const [profileOpen, setProfileOpen] = useState(false);
  const logoutFormRef = useRef<HTMLFormElement>(null);

  const initials = (user.name ?? user.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    /* Se déconnecter d'une console d'administration n'a rien d'anodin : au
       moindre clic dans un menu, la session partait sans confirmation. */
    const ok = await confirm({
      title: "Se déconnecter ?",
      description:
        "Vous devrez saisir à nouveau vos identifiants pour revenir.",
      confirmText: "Se déconnecter",
    });
    if (!ok) return;
    /* Soumission d'un vrai <form> plutôt qu'un appel direct à l'action : le
       `redirect()` du serveur est alors traité par le routeur. Appelée à la
       main, l'action fait remonter ce redirect comme une exception dans le
       `await`, indiscernable d'une vraie panne. */
    logoutFormRef.current?.requestSubmit();
  }

  return (
    <>
      <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 size-8 cursor-pointer text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="mr-1 h-4" />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-sm font-semibold">{title}</span>
            {description && (
              <span className="hidden truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60 sm:inline">
                — {description}
              </span>
            )}
            {/* Guidoc marque l'espace admin en ambre. La charte du portfolio
                n'a qu'un accent : le rouge du drapeau (5.38:1 sur le crème,
                5.03:1 sur le sombre). Une seconde couleur interactive serait
                une dérive. */}
            <Badge
              variant="outline"
              className="hidden h-5 items-center border-brand/30 bg-brand/5 px-1.5 font-mono text-[10px] tracking-[0.12em] text-brand sm:flex"
            >
              ADMIN
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {actions}

            <Button
              variant="ghost"
              size="icon"
              /* `relative` : la lune est positionnée en absolu, sans ancrage
                 elle se cale sur le bandeau au lieu du bouton. */
              className="relative size-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Basculer le thème</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Menu du compte"
                    className="ml-1 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                }
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="mb-1 border-b border-border px-2 py-2">
                  <p className="truncate text-sm font-medium">
                    {user.name ?? "Administrateur"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => setProfileOpen(true)}
                >
                  <User className="size-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  render={<Link href="/" target="_blank" />}
                >
                  <ExternalLink className="size-4" />
                  Voir le site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {children}
      </header>

      <form ref={logoutFormRef} action={signOutAction} className="hidden" />

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-sm">
          <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
            <div className="flex items-center gap-3">
              <Avatar size="lg" className="rounded-xl">
                <AvatarFallback className="rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <DialogTitle className="truncate text-base">
                  {user.name ?? "Administrateur"}
                </DialogTitle>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 px-6 py-5">
            {/* Aucune couleur de statut : la charte n'a qu'un accent, et
                peindre « Actif » en vert en ferait une seconde. Le vert
                officiel du drapeau ne passe d'ailleurs pas le seuil en
                texte (3.72:1). */}
            {[
              { label: "Nom", value: user.name },
              { label: "Adresse e-mail", value: user.email },
              { label: "Rôle", value: "Administrateur" },
              { label: "Statut", value: "Actif" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
              >
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-medium">{value ?? "—"}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
