import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { isStorageKey, publicObjectUrl } from "@/lib/storage";
import {
  projects,
  skillCategories,
  skillItems,
  siteSettings,
  experiences,
} from "./schema";

/* `cache()` déduplique par requête : si plusieurs composants serveur
   demandent les mêmes données pendant un même rendu, une seule requête part. */

/* Volontairement NON résolu : c'est la requête de l'ADMINISTRATION, dont le
   formulaire réécrit cvUrl tel quel. Résoudre ici ferait enregistrer l'URL
   complète à la place de la clé au premier réenregistrement, figeant
   l'endpoint de la branche dans la base. Même piège que getAllProjects. */
export const getSettings = cache(async () => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return row ?? null;
});

/* Version pour les pages PUBLIQUES : la clé de stockage du CV devient une
   URL téléchargeable. */
export const getPublicSettings = cache(async () => {
  const row = await getSettings();
  if (!row || !isStorageKey(row.cvUrl)) return row;
  return { ...row, cvUrl: publicObjectUrl(row.cvUrl) };
});

/* Le journal de bord, du plus récent au plus ancien. */
export const getExperiences = cache(async () =>
  db.select().from(experiences).orderBy(asc(experiences.position)),
);

/* Une clé de stockage devient une URL publique au moment du rendu.
   La base ne garde que la clé : l'endpoint dépend de la branche Neon et le
   figer en colonne casserait les images au premier changement de branche. */
function resolveImages<T extends { imageUrl: string | null; imageMobileUrl: string | null }>(rows: T[]): T[] {
  const resolve = (v: string | null) => (isStorageKey(v) ? publicObjectUrl(v) : v);
  return rows.map((row) => ({
    ...row,
    imageUrl: resolve(row.imageUrl),
    imageMobileUrl: resolve(row.imageMobileUrl),
  }));
}

export const getPublishedProjects = cache(async () =>
  resolveImages(
    await db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(asc(projects.position)),
  ),
);

/* Volontairement NON résolu : c'est la requête de l'administration, dont le
   formulaire réécrit imageUrl tel quel. Résoudre ici ferait enregistrer
   l'URL complète à la place de la clé au premier réenregistrement, figeant
   l'endpoint de la branche dans la base. */
export const getAllProjects = cache(async () =>
  db.select().from(projects).orderBy(asc(projects.position)),
);

/* Catégories + entrées en deux requêtes puis regroupement en mémoire,
   plutôt qu'une requête par catégorie (N+1). */
export const getSkills = cache(async () => {
  const [cats, items] = await Promise.all([
    db.select().from(skillCategories).orderBy(asc(skillCategories.position)),
    db.select().from(skillItems).orderBy(asc(skillItems.position)),
  ]);

  const byCategory = new Map<number, typeof items>();
  for (const item of items) {
    const bucket = byCategory.get(item.categoryId);
    if (bucket) bucket.push(item);
    else byCategory.set(item.categoryId, [item]);
  }

  return cats.map((cat) => ({ ...cat, items: byCategory.get(cat.id) ?? [] }));
});

/* Tout ce dont la page publique a besoin, en parallèle. */
export const getSiteData = cache(async () => {
  const [settings, projectList, skills, journey] = await Promise.all([
    getPublicSettings(),
    getPublishedProjects(),
    getSkills(),
    getExperiences(),
  ]);
  return { settings, projects: projectList, skills, journey };
});

export type SiteData = Awaited<ReturnType<typeof getSiteData>>;
export type SkillGroup = SiteData["skills"][number];
