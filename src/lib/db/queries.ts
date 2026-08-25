import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import {
  projects,
  skillCategories,
  skillItems,
  siteSettings,
  heroStats,
  heroStack,
} from "./schema";

/* `cache()` déduplique par requête : si plusieurs composants serveur
   demandent les mêmes données pendant un même rendu, une seule requête part. */

export const getSettings = cache(async () => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return row ?? null;
});

export const getHeroStats = cache(async () =>
  db.select().from(heroStats).orderBy(asc(heroStats.position)),
);

export const getHeroStack = cache(async () =>
  db.select().from(heroStack).orderBy(asc(heroStack.position)),
);

export const getPublishedProjects = cache(async () =>
  db
    .select()
    .from(projects)
    .where(eq(projects.published, true))
    .orderBy(asc(projects.position)),
);

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
  const [settings, stats, stack, projectList, skills] = await Promise.all([
    getSettings(),
    getHeroStats(),
    getHeroStack(),
    getPublishedProjects(),
    getSkills(),
  ]);
  return { settings, stats, stack, projects: projectList, skills };
});

export type SiteData = Awaited<ReturnType<typeof getSiteData>>;
export type SkillGroup = SiteData["skills"][number];
