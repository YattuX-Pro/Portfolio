/* Création du compte administrateur, à lancer UNE fois.
 *
 *   ADMIN_PASSWORD='votre-mot-de-passe' npm run admin:create
 *
 * Le mot de passe passe par une variable d'environnement et n'est jamais
 * écrit dans un fichier ni affiché. Utilisez un espace en début de commande
 * si votre shell est configuré pour ne pas historiser ces lignes.
 *
 * Ce script n'importe pas src/lib/auth.ts, qui porte `server-only` et ne
 * peut donc pas être chargé hors du runtime Next. Il recrée une instance.
 *
 * Lancé via `tsx --env-file=.env`. */

import { createNeonAuth } from "@neondatabase/auth/next/server";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Variable manquante : ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const password = required("ADMIN_PASSWORD");
  const baseUrl = required("NEON_AUTH_BASE_URL");
  const secret = required("NEON_AUTH_COOKIE_SECRET");

  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (emails.length === 0) {
    console.error(
      "ADMIN_EMAILS est vide. Renseignez-le d'abord : c'est cette liste qui\n" +
        "autorise l'accès à /admin, un compte non listé sera refusé.",
    );
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL ?? emails[0];

  if (!emails.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
    console.error(
      `${email} n'est pas dans ADMIN_EMAILS. Le compte serait créé mais\n` +
        "refusé à l'entrée de l'admin. Ajoutez-le d'abord.",
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("Mot de passe trop court : 12 caractères minimum.");
    process.exit(1);
  }

  const auth = createNeonAuth({ baseUrl, cookies: { secret } });

  const { error } = await auth.signUp.email({
    email,
    password,
    name: process.env.ADMIN_NAME ?? "Aboubacar Tidiane Yattara",
  });

  if (error) {
    console.error(`Échec de la création : ${error.message ?? String(error)}`);
    process.exit(1);
  }

  console.log(`Compte créé pour ${email}. Connectez-vous sur /admin/login.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
