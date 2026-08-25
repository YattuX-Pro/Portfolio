import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/* Neon Object Storage — compatible S3.

   Le client lit AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3
   et AWS_REGION dans l'environnement, comme n'importe quel client AWS.
   `forcePathStyle` est OBLIGATOIRE : Neon n'adresse les buckets qu'en
   path-style, pas en virtual-hosted. Sans lui, chaque requête part sur un
   hôte inexistant.

   Le bucket est en public_read : les images d'un portfolio sont publiques
   par nature. Une URL présignée aurait expiré au bout d'une heure alors que
   la page publique est mise en cache statiquement — elle aurait fini par
   servir des liens morts. */

export const BUCKET = process.env.STORAGE_BUCKET ?? "portfolio-images";

/* Clé interne stockée en base, distinguée d'un chemin /public ou d'une URL
   externe par ce préfixe. */
export const STORAGE_PREFIX = "neon:";

let client: S3Client | null = null;

function s3() {
  if (!client) client = new S3Client({ forcePathStyle: true });
  return client;
}

export function isStorageKey(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith(STORAGE_PREFIX);
}

export function toStorageValue(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

export function toObjectKey(value: string) {
  return value.slice(STORAGE_PREFIX.length);
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const ACCEPTED_TYPES = Object.keys(EXTENSIONS);
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function extensionFor(contentType: string) {
  return EXTENSIONS[contentType];
}

/** Téléverse un fichier et renvoie la valeur à stocker en base. */
export async function uploadImage(
  file: File,
  slug: string,
): Promise<{ value: string } | { error: string }> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { error: "Format non accepté. Utilisez JPEG, PNG, WebP, AVIF ou GIF." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Fichier trop lourd : 5 Mo maximum." };
  }

  const ext = extensionFor(file.type);
  /* Une clé neuve à chaque téléversement plutôt que d'écraser la même :
     un objet en cache n'est jamais plus frais que sa clé. */
  const key = `projets/${slug}/${crypto.randomUUID()}.${ext}`;

  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { value: toStorageValue(key) };
}

/** URL publique d'un objet.

    L'endpoint est reconstruit depuis l'environnement à chaque rendu plutôt
    que stocké en base : il est propre à la branche Neon, et le figer dans
    une colonne casserait toutes les images au premier changement de
    branche. La base ne garde que la clé. */
export function publicImageUrl(value: string): string | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  if (!endpoint) return null;
  return `${endpoint.replace(/\/+$/, "")}/${BUCKET}/${toObjectKey(value)}`;
}

/** Supprime un objet. Les échecs sont avalés : un objet orphelin est moins
    grave qu'une suppression de projet qui échoue à cause du stockage. */
export async function deleteImage(value: string) {
  try {
    await s3().send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: toObjectKey(value) }),
    );
  } catch {
    /* volontairement ignoré */
  }
}
