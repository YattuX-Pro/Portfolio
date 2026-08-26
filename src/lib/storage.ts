import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { blurDataUrl } from "./blur";
import { BUCKET, toObjectKey, toStorageValue } from "./storage-url";

/* Neon Object Storage — compatible S3.

   Le client lit AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3
   et AWS_REGION dans l'environnement, comme n'importe quel client AWS.
   `forcePathStyle` est OBLIGATOIRE : Neon n'adresse les buckets qu'en
   path-style, pas en virtual-hosted. Sans lui, chaque requête part sur un
   hôte inexistant.

   Le bucket est en public_read : les images et le CV d'un portfolio sont
   publics par nature. Une URL présignée aurait expiré au bout d'une heure
   alors que la page publique est mise en cache statiquement — elle aurait
   fini par servir des liens morts.

   Ce module porte `server-only` parce qu'il instancie le client S3 avec les
   clés. L'adressage (préfixe, URL publique) vit dans storage-url.ts et le
   calcul des vignettes dans blur.ts : ni l'un ni l'autre ne touche aux
   identifiants, et les scripts hors Next peuvent donc les réutiliser. Les
   deux sont réexportés ici pour ne pas casser les imports existants. */

export {
  BUCKET,
  STORAGE_PREFIX,
  isStorageKey,
  toStorageValue,
  toObjectKey,
  publicObjectUrl,
} from "./storage-url";
export { blurDataUrl } from "./blur";

let client: S3Client | null = null;

function s3() {
  if (!client) client = new S3Client({ forcePathStyle: true });
  return client;
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const ACCEPTED_TYPES = Object.keys(IMAGE_EXTENSIONS);
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/* Le CV est un PDF, et lui seul : c'est le format qu'un recruteur ouvre sans
   rien installer, et le seul qui garde sa mise en page. Un .docx téléversé
   par erreur se serait téléchargé depuis le portfolio sans prévisualisation
   possible. */
export const CV_ACCEPTED_TYPE = "application/pdf";
export const MAX_CV_BYTES = 10 * 1024 * 1024;

export function extensionFor(contentType: string) {
  return IMAGE_EXTENSIONS[contentType];
}

/** Téléverse des octets et renvoie la valeur à stocker en base. */
async function putBytes(
  bytes: Buffer,
  contentType: string,
  key: string,
  disposition?: string,
) {
  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      ContentDisposition: disposition,
    }),
  );
  return { value: toStorageValue(key) };
}

async function put(file: File, key: string, disposition?: string) {
  return putBytes(
    Buffer.from(await file.arrayBuffer()),
    file.type,
    key,
    disposition,
  );
}

/** Téléverse une image de projet, avec sa vignette floue. */
export async function uploadImage(
  file: File,
  slug: string,
): Promise<{ value: string; blur: string | null } | { error: string }> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { error: "Format non accepté. Utilisez JPEG, PNG, WebP, AVIF ou GIF." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Fichier trop lourd : 5 Mo maximum." };
  }

  /* Une clé neuve à chaque téléversement plutôt que d'écraser la même :
     un objet en cache n'est jamais plus frais que sa clé. */
  const ext = extensionFor(file.type);
  const bytes = Buffer.from(await file.arrayBuffer());

  /* Vignette calculée à partir des OCTETS déjà en mémoire, pas en relisant
     l'objet depuis le bucket : le fichier est là, le relire serait un
     aller-retour réseau pour rien. */
  const [uploaded, blur] = await Promise.all([
    putBytes(bytes, file.type, `projets/${slug}/${crypto.randomUUID()}.${ext}`),
    blurDataUrl(bytes),
  ]);

  return { value: uploaded.value, blur };
}

/** Téléverse le CV (PDF). */
export async function uploadCv(
  file: File,
): Promise<{ value: string } | { error: string }> {
  /* Le type déclaré par le navigateur ne suffit pas : il vient du client et
     se falsifie. On vérifie donc aussi la signature du fichier plus bas. */
  if (file.type !== CV_ACCEPTED_TYPE) {
    return { error: "Le CV doit être un PDF." };
  }
  if (file.size > MAX_CV_BYTES) {
    return { error: "Fichier trop lourd : 10 Mo maximum." };
  }

  /* Les cinq premiers octets d'un PDF valide sont « %PDF- ». Un fichier
     renommé en .pdf passerait le contrôle de type MIME, pas celui-ci. */
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const magic = String.fromCharCode(...header);
  if (magic !== "%PDF-") {
    return { error: "Ce fichier n'est pas un PDF valide." };
  }

  /* Content-Disposition posé sur l'OBJET, et non laissé à l'attribut
     `download` de la balise <a> : cet attribut est ignoré par le navigateur
     dès que le lien est cross-origin, et le bucket est un autre domaine que
     le portfolio. Sans cet en-tête, « Télécharger le CV » ouvrirait le PDF
     dans un onglet au lieu de l'enregistrer. Le nom de fichier proposé au
     visiteur est fixé ici, pas hérité de celui du fichier téléversé. */
  return put(
    file,
    `cv/${crypto.randomUUID()}.pdf`,
    'attachment; filename="CV_Aboubacar_Tidiane_Yattara.pdf"',
  );
}

/** Supprime un objet. Les échecs sont avalés : un objet orphelin est moins
    grave qu'une suppression de projet qui échoue à cause du stockage. */
export async function deleteObject(value: string) {
  try {
    await s3().send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: toObjectKey(value) }),
    );
  } catch {
    /* volontairement ignoré */
  }
}
