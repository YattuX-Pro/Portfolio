import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-guard";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion — Administration",
  /* Ne doit jamais apparaître dans un moteur de recherche. */
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  /* Déjà connecté et autorisé : inutile de repasser par le formulaire. */
  if (await getAdminUser()) redirect("/admin");

  return (
    <main className="min-h-svh flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="meta">Administration</p>

        <div aria-hidden className="flex items-center gap-2 mt-3 mb-8">
          <span className="block h-1.5 flex-1 bg-flag-red" />
          <span className="block h-1.5 flex-1 bg-flag-yellow" />
          <span className="block h-1.5 flex-1 bg-flag-green" />
        </div>

        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-ink">
          Connexion
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-muted">
          Espace réservé. Aucun compte ne peut être créé depuis cette page.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
