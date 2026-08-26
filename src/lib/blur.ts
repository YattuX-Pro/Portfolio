/** Vignette floue (LQIP) d'une image, en data URL base64.
 *
 * Module SANS `server-only`, contrairement à storage.ts : cette fonction ne
 * touche à aucun identifiant, c'est du traitement d'image pur. La garde
 * `server-only` de storage.ts existe pour empêcher le client d'embarquer le
 * client S3 et ses clés — l'appliquer ici empêchait surtout les scripts hors
 * Next (le remplissage rétroactif) de réutiliser le code.
 *
 * 20 px de large : next/image l'étire à la taille du cadre et lui applique un
 * flou, donc la définition n'a aucune importance — seules comptent les
 * couleurs. À cette taille la chaîne pèse quelques centaines d'octets et
 * voyage dans le HTML, sans requête supplémentaire.
 *
 * WebP plutôt que JPEG : à qualité égale la chaîne base64 est nettement plus
 * courte, et c'est du HTML transféré à chaque visite.
 *
 * `sharp` est importé DYNAMIQUEMENT et l'échec est avalé : il arrive comme
 * dépendance de Next et son binaire est propre à la plateforme. Une image
 * sans vignette s'affiche très bien — le composant retombe sur un flou
 * neutre. Faire échouer un téléversement pour un placeholder serait hors de
 * proportion.
 */
export async function blurDataUrl(bytes: Buffer): Promise<string | null> {
  try {
    const { default: sharp } = await import("sharp");
    const out = await sharp(bytes)
      .resize(20, 20, { fit: "inside" })
      .webp({ quality: 45 })
      .toBuffer();
    return `data:image/webp;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}
