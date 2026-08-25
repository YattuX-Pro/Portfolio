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

/* ─── Réglages du site ──────────────────────────────────────────────────
   Ligne unique (id = 1). Colonnes typées plutôt qu'un magasin clé/valeur :
   les champs sont connus, autant garder la sécurité de typage de Drizzle. */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  heroRole: text("hero_role").notNull(),
  heroAvailable: boolean("hero_available").notNull().default(true),
  heroBio: text("hero_bio").notNull(),
  method: text("method"),
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
