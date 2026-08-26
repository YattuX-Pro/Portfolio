import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-guard";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion",
  /* Ne doit jamais apparaître dans un moteur de recherche. */
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  /* Déjà connecté et autorisé : inutile de repasser par le formulaire. */
  if (await getAdminUser()) redirect("/admin");

  /* Composition de la page de connexion Guidoc — pastille d'identité, titre,
     sous-titre, formulaire en colonne étroite — habillée de la charte du
     portfolio : monogramme sur encre et liseré tricolore, plutôt que l'icône
     de bouclier sur bleu. */
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          {/* `brand-band` et non `bg-ink` : l'encre est un token de thème, elle
              devient claire en mode sombre et le monogramme blanc y
              disparaîtrait. Le bandeau de marque, lui, est en valeurs
              littérales — même pastille que dans la barre latérale. */}
          <span className="brand-band flex size-12 items-center justify-center rounded-xl font-mono text-base font-medium text-white">
            AY
          </span>

          <h1 className="text-2xl font-semibold tracking-[-0.03em]">
            Administration
          </h1>

          {/* Signature du portfolio. Décoratif et `aria-hidden` : le jaune ne
              doit rien porter d'informatif. */}
          <span aria-hidden className="flex h-1.5 w-16 overflow-hidden rounded-full">
            <span className="flex-1 bg-flag-red" />
            <span className="flex-1 bg-flag-yellow" />
            <span className="flex-1 bg-flag-green" />
          </span>

          <p className="text-sm text-muted-foreground">
            Accès réservé. Aucun compte ne peut être créé depuis cette page.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
