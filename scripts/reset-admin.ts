/* Réinitialise le mot de passe du compte administrateur.
 *
 *   ADMIN_PASSWORD='<nouveau mot de passe>' npm run admin:reset -- --yes
 *
 * Les APOSTROPHES SIMPLES sont importantes : avec des guillemets doubles ou
 * sans rien, le shell interprète `$`, `!`, `` ` `` et `\` avant que Node ne
 * voie la valeur, et le mot de passe enregistré n'est pas celui que vous avez
 * tapé. Voir aussi `npm run admin:check`.
 *
 * ── Pourquoi une SUPPRESSION puis une recréation ────────────────────────
 * Neon Auth est du Better Auth. Changer un mot de passe y demande soit le
 * mot de passe actuel (/change-password), soit un e-mail de réinitialisation
 * (/forget-password), soit le rôle admin. Aucun des trois n'est disponible
 * quand le mot de passe est justement perdu et qu'aucun envoi d'e-mail n'est
 * configuré. On repart donc du compte : ses lignes sont supprimées, puis
 * `sign-up/email` le recrée avec le nouveau mot de passe.
 *
 * DESTRUCTIF, d'où le --yes obligatoire. Ce qui disparaît : la ligne
 * neon_auth.user et, par ON DELETE CASCADE, ses lignes account (le mot de
 * passe) et session (les connexions ouvertes). Le contenu du portfolio —
 * projets, compétences, réglages — vit dans d'autres tables et n'est pas
 * touché. L'identifiant du compte change, ce qui n'a pas d'incidence : rien
 * dans le schéma du site ne référence l'utilisateur.
 *
 * Lancé via `tsx --env-file=.env`. */

import { Pool } from "pg";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Variable manquante : ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  if (!process.argv.includes("--yes")) {
    console.error(
      "Action destructive. Relancez avec --yes :\n" +
        "  ADMIN_PASSWORD='…' npm run admin:reset -- --yes",
    );
    process.exit(1);
  }

  const password = required("ADMIN_PASSWORD");
  const baseUrl = required("NEON_AUTH_BASE_URL").replace(/\/+$/, "");
  const connectionString = required("DATABASE_URL");

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (allowed.length === 0) {
    console.error(
      "ADMIN_EMAILS est vide. Renseignez-le d'abord : c'est cette liste qui\n" +
        "autorise l'accès à /admin, un compte non listé serait refusé.",
    );
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL ?? allowed[0];

  if (!allowed.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
    console.error(
      `${email} n'est pas dans ADMIN_EMAILS. Le compte serait recréé mais\n` +
        "refusé à l'entrée de l'admin. Ajoutez-le d'abord.",
    );
    process.exit(1);
  }

  console.log(`Longueur du mot de passe reçu par Node : ${password.length}`);
  console.log(
    "  (si ce nombre ne correspond pas à ce que vous avez tapé, interrompez :\n" +
      "   le shell l'a modifié, relancez avec des apostrophes simples)\n",
  );

  const pool = new Pool({ connectionString, max: 1 });
  try {
    /* Suppression ciblée sur l'e-mail, insensible à la casse — Neon Auth
       enregistre l'adresse telle qu'elle a été saisie. */
    const { rowCount } = await pool.query(
      `delete from neon_auth."user" where lower(email) = lower($1)`,
      [email],
    );
    console.log(
      rowCount
        ? `Ancien compte supprimé (${rowCount} ligne, sessions et mot de passe compris).`
        : "Aucun compte existant pour cette adresse — création simple.",
    );
  } finally {
    await pool.end();
  }

  const res = await fetch(`${baseUrl}/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      /* Exigé par Neon Auth dès que callbackURL n'est pas absolue. */
      Origin: process.env.APP_ORIGIN ?? "http://localhost:3000",
    },
    body: JSON.stringify({
      email,
      password,
      name: process.env.ADMIN_NAME ?? email,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
  };

  if (!res.ok) {
    console.error(
      `Échec de la recréation (${res.status}) : ${body.message ?? body.code ?? "erreur inconnue"}`,
    );
    console.error(
      "Le compte a été supprimé : relancez cette commande avec un mot de passe\n" +
        "valide (8 caractères minimum) pour le recréer.",
    );
    process.exit(1);
  }

  console.log(`\nCompte recréé pour ${email}.`);
  console.log("Vérifiez avec :  ADMIN_PASSWORD='…' npm run admin:check");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
