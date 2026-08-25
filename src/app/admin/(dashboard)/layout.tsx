import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
/* Les groupes de routes n'existent pas sur le disque pour la résolution
   d'imports : login est à côté de (dashboard), pas dedans. */
import { signOutAction } from "@/app/admin/login/actions";
import { AdminSideNav, AdminTabNav } from "./AdminNav";

/* auth.getSession() lit les cookies : la section doit être rendue
   dynamiquement, jamais mise en cache statiquement. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Vraie barrière : session valide ET e-mail dans ADMIN_EMAILS.
     Le middleware n'a filtré que l'absence de session. */
  const user = await requireAdmin();

  return (
    /* grid-rows garde le pied de page en bas même quand le contenu est court. */
    <div className="min-h-svh grid grid-rows-[auto_auto_1fr_auto] bg-bg">
      {/* ── Barre supérieure ─────────────────────────────────────────── */}
      <header className="border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 min-w-0 group"
            aria-label="Accueil de l'administration"
          >
            <span className="font-mono text-[13px] tracking-[0.14em] text-ink group-hover:text-accent transition-colors duration-200">
              ADMIN
            </span>
            <span aria-hidden className="flex items-center gap-1 shrink-0">
              <span className="block h-1.5 w-4 bg-flag-red" />
              <span className="block h-1.5 w-4 bg-flag-yellow" />
              <span className="block h-1.5 w-4 bg-flag-green" />
            </span>
          </Link>

          <div className="flex items-center gap-1 min-w-0">
            <span className="meta truncate hidden md:inline mr-2" title={user.email}>
              {user.email}
            </span>
            <Link
              href="/"
              target="_blank"
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
      </header>

      {/* ── Onglets, sous lg uniquement ──────────────────────────────── */}
      <AdminTabNav />

      {/* ── Colonne latérale + contenu ───────────────────────────────── */}
      <div className="w-full">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-x-12 gap-y-8 items-start">
          <aside className="hidden lg:block">
            <AdminSideNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>

      {/* ── Pied de page ─────────────────────────────────────────────── */}
      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="meta">
            © {new Date().getFullYear()} Aboubacar Tidiane Yattara
          </p>
          <p className="meta">Neon Postgres · eu-central-1</p>
        </div>
      </footer>
    </div>
  );
}
