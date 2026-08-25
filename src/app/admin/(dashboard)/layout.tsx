import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
/* Les groupes de routes n'existent pas sur le disque pour la résolution
   d'imports : login est à côté de (dashboard), pas dedans. */
import { signOutAction } from "@/app/admin/login/actions";

/* auth.getSession() lit les cookies : la section doit être rendue
   dynamiquement, jamais mise en cache statiquement. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

const TABS = [
  { href: "/admin", label: "Projets" },
  { href: "/admin/competences", label: "Compétences" },
  { href: "/admin/profil", label: "Profil" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Vraie barrière : session valide ET e-mail dans ADMIN_EMAILS.
     Le middleware n'a filtré que l'absence de session. */
  const user = await requireAdmin();

  return (
    <div className="min-h-svh">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[13px] tracking-[0.14em] text-ink">
                ADMIN
              </span>
              <span aria-hidden className="flex items-center gap-1">
                <span className="block h-1.5 w-4 bg-flag-red" />
                <span className="block h-1.5 w-4 bg-flag-yellow" />
                <span className="block h-1.5 w-4 bg-flag-green" />
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="meta truncate hidden sm:inline">{user.email}</span>
              <Link
                href="/"
                className="inline-flex items-center h-11 px-3 text-[14px] text-muted hover:text-ink transition-colors duration-200"
              >
                Voir le site
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center h-11 px-3 text-[14px] text-muted hover:text-accent transition-colors duration-200 cursor-pointer"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>

          <nav className="flex items-center gap-1 -mb-px" aria-label="Sections">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-3 h-11 inline-flex items-center text-[14px] text-muted hover:text-ink border-b-2 border-transparent hover:border-line-strong transition-colors duration-200"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">{children}</main>
    </div>
  );
}
