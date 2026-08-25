/* Création du compte administrateur, à lancer UNE fois.
 *
 *   ADMIN_PASSWORD='<votre mot de passe>' npm run admin:create
 *
 * Le mot de passe passe par une variable d'environnement : ne l'écrivez ni
 * dans ce fichier ni dans un commit. Préfixez la commande d'un espace si
 * votre shell est configuré pour ne pas historiser ces lignes.
 *
 * Pourquoi un appel HTTP direct plutôt que createNeonAuth() :
 * l'instance de @neondatabase/auth/next/server appelle cookies() de Next en
 * interne et exige donc un contexte de requête. Hors du runtime Next, elle
 * échoue avec « `cookies` was called outside a request scope ». On parle
 * donc directement au point d'entrée Neon Auth, qui est du Better Auth.
 *
 * Lancé via `tsx --env-file=.env`. */

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
  const baseUrl = required("NEON_AUTH_BASE_URL").replace(/\/+$/, "");

  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (emails.length === 0) {
    console.error(
      "ADMIN_EMAILS est vide. Renseignez-le d'abord : c'est cette liste qui\n" +
        "autorise l'accès à /admin, un compte non listé serait refusé.",
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
    const hints: Record<string, string> = {
      PASSWORD_TOO_SHORT: "Mot de passe trop court.",
      USER_ALREADY_EXISTS:
        "Ce compte existe déjà. Connectez-vous sur /admin/login.",
      MISSING_ORIGIN: "Origine manquante — définissez APP_ORIGIN.",
    };
    const hint = body.code ? hints[body.code] : undefined;
    console.error(
      `Échec (${res.status}) : ${hint ?? body.message ?? "erreur inconnue"}`,
    );
    process.exit(1);
  }

  console.log(`Compte créé pour ${email}. Connectez-vous sur /admin/login.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
