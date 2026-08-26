/* Diagnostic de connexion à l'administration.
 *
 *   ADMIN_PASSWORD='<votre mot de passe>' npm run admin:check
 *
 * Les APOSTROPHES SIMPLES sont importantes. Avec des guillemets doubles ou
 * sans rien, le shell interprète `$`, `!`, `` ` `` et `\` avant que Node ne
 * voie la valeur — le mot de passe réellement envoyé n'est alors pas celui
 * que vous avez tapé. C'est la panne la plus fréquente ici : le compte se
 * crée sans erreur, avec un mot de passe que personne ne connaît.
 *
 * Pourquoi ce script existe : sur /admin/login, deux échecs très différents
 * se ressemblent — un mot de passe refusé, et une session valide refusée par
 * requireAdmin() faute d'être dans ADMIN_EMAILS. Les deux ramènent sur le
 * formulaire. Ce script dit lequel des deux se produit.
 *
 * Appel HTTP direct plutôt que createNeonAuth() : cette instance appelle
 * cookies() de Next et exige un contexte de requête, cf. create-admin.ts.
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

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = process.env.ADMIN_EMAIL ?? allowed[0];
  if (!email) {
    console.error("ADMIN_EMAILS est vide : personne ne peut entrer dans l'admin.");
    process.exit(1);
  }

  console.log(`Projet Neon Auth : ${new URL(baseUrl).host}`);
  console.log(`E-mail testé     : ${email}`);
  console.log(`Longueur du mot de passe reçu par Node : ${password.length}`);
  console.log(
    "  (si ce nombre ne correspond pas à ce que vous avez tapé, le shell l'a\n" +
      "   modifié — relancez avec des apostrophes simples)",
  );
  console.log();

  /* ── Étape 1 : Neon Auth accepte-t-il le couple e-mail / mot de passe ? ── */
  const res = await fetch(`${baseUrl}/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: process.env.APP_ORIGIN ?? "http://localhost:3000",
    },
    body: JSON.stringify({ email, password }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
  };

  if (!res.ok) {
    console.log(`ÉTAPE 1 — Neon Auth : REFUSÉ (HTTP ${res.status})`);
    console.log(`  code    : ${body.code ?? "—"}`);
    console.log(`  message : ${body.message ?? "—"}`);
    console.log();
    if (body.code === "INVALID_EMAIL_OR_PASSWORD") {
      console.log(
        "→ Le mot de passe enregistré n'est pas celui-ci. Le compte existe,\n" +
          "  seul son mot de passe est inconnu. Voir « Réinitialiser » plus bas.",
      );
    } else if (body.code === "EMAIL_NOT_VERIFIED") {
      console.log(
        "→ Neon Auth exige une vérification d'e-mail sur ce projet. À désactiver\n" +
          "  dans la console Neon, ou vérifiez l'adresse.",
      );
    }
    process.exit(1);
  }

  console.log("ÉTAPE 1 — Neon Auth : OK, le mot de passe est le bon.");

  /* ── Étape 2 : la liste blanche de l'admin, même règle que getAdminUser() ── */
  if (!allowed.includes(email.toLowerCase())) {
    console.log("ÉTAPE 2 — Garde admin : REFUSÉ");
    console.log(`  ${email} n'est pas dans ADMIN_EMAILS (${allowed.join(", ")}).`);
    console.log();
    console.log(
      "→ Voilà la panne : la connexion réussit, puis requireAdmin() rejette la\n" +
        "  session et vous renvoie sur /admin/login SANS message. Ajoutez cette\n" +
        "  adresse à ADMIN_EMAILS, puis REDÉMARREZ `npm run dev` — Next ne relit\n" +
        "  pas .env à chaud.",
    );
    process.exit(1);
  }

  console.log("ÉTAPE 2 — Garde admin : OK, l'adresse est dans ADMIN_EMAILS.");
  console.log();
  console.log(
    "Les deux étapes passent. Si /admin/login échoue malgré tout, c'est le\n" +
      "serveur de dev qui tourne avec un .env périmé : redémarrez-le.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/* Sans au moins un import ou export, TypeScript traite ce fichier comme un
   script GLOBAL : ses déclarations de premier niveau (`required`, `main`)
   entrent alors en collision avec celles des autres scripts du dossier —
   « Duplicate function implementation ». Cet export vide force la portée
   module. */
export {};
