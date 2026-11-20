import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ─── Projets ───────────────────────────────────────────────────────────
   `position` pilote l'ordre d'affichage ; `published` permet de préparer
   un projet sans le publier. */
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    /* Placeholder flou (LQIP) de l'image, en data URL base64 — une vignette
       d'une vingtaine de pixels, que next/image affiche étirée et floutée le
       temps du chargement.

       Stocké plutôt que recalculé au rendu : produire la vignette suppose de
       décoder l'image, ce qui n'a rien à faire dans le chemin de rendu d'une
       page. Nullable : les images d'avant cette colonne, et tout échec de
       génération, retombent sur un flou neutre côté composant. */
    imageBlur: text("image_blur"),
    /* ── Étude de cas ─────────────────────────────────────────────────
       Le détail affiché dans le panneau du site public. Tout est nullable :
       `description` reste le seul texte obligatoire, un projet peut donc
       exister sans étude de cas et le panneau n'affiche alors que les
       sections renseignées. */

    /* Le POURQUOI : le besoin, le problème de départ. */
    problem: text("problem"),
    /* La réponse apportée, côté produit comme côté technique. */
    solution: text("solution"),
    /* Ce que tu as fait dessus. « Développeur full-stack », « Analyste »… */
    role: text("role"),
    /* Texte et non entier : « 2025 », mais aussi « 2024 — 2025 ». Un projet
       s'étale rarement sur une année pile. */
    year: text("year"),

    /* Tags de stack, dans l'ordre voulu. */
    stack: text("stack").array().notNull().default([]),
    demoUrl: text("demo_url"),
    githubUrl: text("github_url"),
    position: integer("position").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("projects_slug_idx").on(t.slug)],
);

/* ─── Compétences ───────────────────────────────────────────────────────
   `accent` stocke un nom de token (flag-red, flag-green, text, muted) et
   non un hexadécimal : la palette reste pilotée par globals.css. */
export const skillCategories = pgTable("skill_categories", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  accent: text("accent").notNull().default("text"),
  position: integer("position").notNull().default(0),
});

export const skillItems = pgTable("skill_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => skillCategories.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  /* SLUG d'icône, pas un nom de composant ni un chemin d'image : la
     correspondance vit dans src/lib/tech-icons.ts. Un nom de composant en
     base deviendrait `undefined` à l'import si le registre changeait, et la
     page publique tomberait AU RENDU. Nullable : une compétence sans icône
     s'affiche simplement sans. */
  icon: text("icon"),
  position: integer("position").notNull().default(0),
});

export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  items: many(skillItems),
}));

export const skillItemsRelations = relations(skillItems, ({ one }) => ({
  category: one(skillCategories, {
    fields: [skillItems.categoryId],
    references: [skillCategories.id],
  }),
}));

/* ─── Parcours ──────────────────────────────────────────────────────────
   Le « journal de bord » du site : postes et formations, du plus récent au
   plus ancien (`position` croissante). Le numéro d'escale affiché n'est PAS
   stocké : il se déduit de l'ordre, sinon chaque ajout obligerait à
   renuméroter toutes les lignes à la main. */
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  /* Texte et non dates : « Nov. 2025 — aujourd'hui », « Mai — août 2022 ».
     Même raison que `projects.year` : une période se lit, elle ne se
     calcule pas, et deux colonnes de dates auraient imposé un format. */
  period: text("period").notNull(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  /* Une phrase sur ce qui y a été fait. Facultative. */
  summary: text("summary"),
  /* `work` ou `education` : la couleur du repère sur le site (encre pour
     un poste, vert pour une formation). Un nom et non une couleur, comme
     `skillCategories.accent`. */
  kind: text("kind").notNull().default("work"),
  /* Le poste en cours : repère rouge et mention « en cours ». */
  current: boolean("current").notNull().default(false),
  position: integer("position").notNull().default(0),
});

/* ─── Réglages du site ──────────────────────────────────────────────────
   Ligne unique (id = 1). Colonnes typées plutôt qu'un magasin clé/valeur :
   les champs sont connus, autant garder la sécurité de typage de Drizzle. */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  heroRole: text("hero_role").notNull(),
  heroAvailable: boolean("hero_available").notNull().default(true),
  heroBio: text("hero_bio").notNull(),
  method: text("method"),
  /* Origine du compteur d'expérience du hero : la date de signature du
     premier contrat.

     `timestamp` et non `date` : le compteur descend jusqu'au centième de
     seconde, il lui faut l'HEURE. Une colonne `date` aurait forcé minuit et
     rendu les champs heures/minutes/secondes du hero purement décoratifs.

     Nullable, et sans valeur par défaut : tant que la date n'est pas saisie
     depuis l'admin, le bloc entier est masqué sur le site. Un défaut arbitraire
     aurait affiché une ancienneté fausse — le pire résultat possible pour ce
     chiffre-là. */
  experienceStartAt: timestamp("experience_start_at", { withTimezone: true }),
  email: text("email").notNull(),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  cvUrl: text("cv_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* Les 3 chiffres du bas de hero (5+ Projets, 3+ Années…). */
export const heroStats = pgTable("hero_stats", {
  id: serial("id").primaryKey(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  position: integer("position").notNull().default(0),
});

/* La colonne « Stack principale » de la sidebar du hero. */
export const heroStack = pgTable("hero_stack", {
  id: serial("id").primaryKey(),
  groupLabel: text("group_label").notNull(),
  items: text("items").notNull(),
  position: integer("position").notNull().default(0),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type SkillCategory = typeof skillCategories.$inferSelect;
export type SkillItem = typeof skillItems.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type HeroStat = typeof heroStats.$inferSelect;
export type HeroStackRow = typeof heroStack.$inferSelect;
export type Experience = typeof experiences.$inferSelect;
