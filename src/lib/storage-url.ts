/* Adressage des objets du bucket : le préfixe stocké en base, et l'URL
   publique correspondante.

   Module SANS `server-only`, séparé de storage.ts pour deux raisons :

   - construire une URL ne demande aucun identifiant. queries.ts n'importait
     jusqu'ici tout le module de stockage — client S3 et clés comprises —
     seulement pour composer une chaîne ;
   - les scripts lancés hors du runtime Next (le remplissage des vignettes)
     ne peuvent pas charger un module marqué `server-only`.

   Les opérations qui touchent réellement au bucket (dépôt, suppression)
   restent dans storage.ts, sous sa garde. */

export const BUCKET = process.env.STORAGE_BUCKET ?? "portfolio-images";

/* Clé interne stockée en base, distinguée d'un chemin /public ou d'une URL
   externe par ce préfixe. */
export const STORAGE_PREFIX = "neon:";

export function isStorageKey(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith(STORAGE_PREFIX);
}

export function toStorageValue(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

export function toObjectKey(value: string) {
  return value.slice(STORAGE_PREFIX.length);
}

/** URL publique d'un objet du bucket (image ou CV).

    L'endpoint est reconstruit depuis l'environnement à chaque rendu plutôt
    que stocké en base : il est propre à la branche Neon, et le figer dans
    une colonne casserait tous les liens au premier changement de branche.
    La base ne garde que la clé. */
export function publicObjectUrl(value: string): string | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  if (!endpoint) return null;
  return `${endpoint.replace(/\/+$/, "")}/${BUCKET}/${toObjectKey(value)}`;
}
