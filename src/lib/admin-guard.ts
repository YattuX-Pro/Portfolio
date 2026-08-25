import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/* Portail unique de l'espace d'administration.

   Deux barrières distinctes :
   1. être authentifié auprès de Neon Auth ;
   2. avoir un e-mail présent dans ADMIN_EMAILS.

   La seconde est indispensable. Neon Auth expose des points d'entrée
   d'inscription : sans liste blanche, un compte créé par un tiers serait
   authentifié — donc admin. Ici il est authentifié mais refusé.

   À appeler dans le layout de /admin ET au début de CHAQUE server action :
   une vérification dans le layout ne protège pas les actions, qui sont des
   points d'entrée HTTP à part entière et peuvent être appelées directement. */

function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminUser = { id: string; email: string; name?: string | null };

/** Session admin valide, ou `null`. Ne redirige pas. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user?.email) return null;

  const allowed = allowedEmails();
  /* Liste vide = personne n'entre. Un défaut ouvert serait pire qu'une
     panne : mieux vaut un admin inaccessible qu'un admin ouvert à tous. */
  if (allowed.length === 0) return null;
  if (!allowed.includes(user.email.toLowerCase())) return null;

  return { id: user.id, email: user.email, name: user.name };
}

/** Exige une session admin, sinon redirige vers la page de connexion. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Variante pour les server actions : renvoie une erreur au lieu de rediriger. */
export async function assertAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("Non autorisé.");
  return user;
}
