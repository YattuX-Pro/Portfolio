/* Génère la vignette floue (image_blur) des projets qui n'en ont pas.
 *
 *   npm run db:blur
 *
 * À lancer une fois après l'ajout de la colonne. Les téléversements suivants
 * produisent leur vignette au moment du dépôt, dans uploadImage().
 *
 * Deux sources possibles pour un imageUrl :
 *   - un chemin interne (« /carties.PNG ») : le fichier est lu dans public/ ;
 *   - une clé de stockage (« neon:… ») ou une URL externe : téléchargée.
 *
 * Idempotent : seules les lignes à image_blur NULL sont traitées, on peut
 * donc relancer sans risque.
 *
 * Lancé via `tsx --env-file=.env`. */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { isNull, and, isNotNull, eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { projects } from "../src/lib/db/schema";
/* Import des modules PURS et non de storage.ts : celui-ci porte
   `import "server-only"`, qui lève une exception hors du runtime Next. */
import { blurDataUrl } from "../src/lib/blur";
import { isStorageKey, publicObjectUrl } from "../src/lib/storage-url";

async function bytesFor(imageUrl: string): Promise<Buffer | null> {
  /* Chemin interne : lu sur le disque. Passer par HTTP supposerait que le
     serveur de dev tourne, ce qui n'a pas lieu d'être pour un script. */
  if (imageUrl.startsWith("/")) {
    /* `path.join` avec un chemin issu de la base : il est normalisé, donc un
       « /../ » ne peut pas sortir de public/. */
    const file = path.join(process.cwd(), "public", path.normalize(imageUrl));
    try {
      return await readFile(file);
    } catch {
      console.warn(`   fichier introuvable : public${imageUrl}`);
      return null;
    }
  }

  const url = isStorageKey(imageUrl) ? publicObjectUrl(imageUrl) : imageUrl;
  if (!url) {
    console.warn("   URL impossible à résoudre (AWS_ENDPOINT_URL_S3 absent ?)");
    return null;
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`   téléchargement échoué (HTTP ${res.status})`);
    return null;
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const rows = await db
    .select({ id: projects.id, title: projects.title, imageUrl: projects.imageUrl })
    .from(projects)
    .where(and(isNotNull(projects.imageUrl), isNull(projects.imageBlur)));

  if (rows.length === 0) {
    console.log("Rien à faire : toutes les images ont déjà leur vignette.");
    return;
  }

  console.log(`${rows.length} image(s) sans vignette.\n`);

  let done = 0;
  for (const row of rows) {
    console.log(`${row.title} — ${row.imageUrl}`);
    const bytes = await bytesFor(row.imageUrl!);
    if (!bytes) continue;

    const blur = await blurDataUrl(bytes);
    if (!blur) {
      console.warn("   génération échouée (sharp indisponible ?)");
      continue;
    }

    await db
      .update(projects)
      .set({ imageBlur: blur })
      .where(eq(projects.id, row.id));

    console.log(`   vignette enregistrée (${blur.length} caractères)`);
    done++;
  }

  console.log(`\n${done}/${rows.length} vignette(s) générée(s).`);
  if (done > 0) {
    console.log("Rechargez la page d'accueil pour voir le dé-floutage.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  /* Le pool `pg` garde le processus en vie : sans sortie explicite, le script
     ne rend jamais la main. */
  .finally(() => process.exit(0));
