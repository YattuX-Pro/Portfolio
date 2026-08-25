"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { skillCategories, skillItems } from "@/lib/db/schema";
import { assertAdmin } from "@/lib/admin-guard";
import { ACCENT_VALUES } from "./constants";

/* Rappel : chaque action est un point d'entrée HTTP à part entière.
   assertAdmin() en tête, sans exception. */

export type ActionState = { error: string | null; ok?: boolean };


function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/competences");
}

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const label = String(formData.get("label") ?? "").trim();
  const accent = String(formData.get("accent") ?? "text");

  if (!label) return { error: "Le nom de la catégorie est obligatoire." };
  if (!ACCENT_VALUES.includes(accent)) return { error: "Couleur inconnue." };

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${skillCategories.position}), -1) + 1` })
    .from(skillCategories);

  await db.insert(skillCategories).values({ label, accent, position: next });
  refresh();
  return { error: null, ok: true };
}

export async function updateCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = Number(formData.get("id"));
  const label = String(formData.get("label") ?? "").trim();
  const accent = String(formData.get("accent") ?? "text");

  if (!Number.isInteger(id)) return { error: "Catégorie introuvable." };
  if (!label) return { error: "Le nom de la catégorie est obligatoire." };
  if (!ACCENT_VALUES.includes(accent)) return { error: "Couleur inconnue." };

  await db.update(skillCategories).set({ label, accent }).where(eq(skillCategories.id, id));
  refresh();
  return { error: null, ok: true };
}

export async function deleteCategory(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  /* Les entrées partent avec la catégorie : la clé étrangère est en
     ON DELETE CASCADE, pas besoin de les supprimer une à une. */
  await db.delete(skillCategories).where(eq(skillCategories.id, id));
  refresh();
}

export async function addItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const categoryId = Number(formData.get("categoryId"));
  const label = String(formData.get("label") ?? "").trim();

  if (!Number.isInteger(categoryId)) return { error: "Catégorie introuvable." };
  if (!label) return { error: "Le nom de la compétence est obligatoire." };

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${skillItems.position}), -1) + 1` })
    .from(skillItems)
    .where(eq(skillItems.categoryId, categoryId));

  await db.insert(skillItems).values({ categoryId, label, position: next });
  refresh();
  return { error: null, ok: true };
}

export async function deleteItem(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db.delete(skillItems).where(eq(skillItems.id, id));
  refresh();
}

/** Déplace une catégorie ou une entrée d'un cran. */
export async function moveCategory(formData: FormData) {
  await assertAdmin();

  const id = Number(formData.get("id"));
  const direction = String(formData.get("direction"));
  if (!Number.isInteger(id) || !["up", "down"].includes(direction)) return;

  const rows = await db
    .select({ id: skillCategories.id })
    .from(skillCategories)
    .orderBy(skillCategories.position);

  const index = rows.findIndex((r) => r.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= rows.length) return;

  const reordered = [...rows];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  await Promise.all(
    reordered.map((row, i) =>
      db.update(skillCategories).set({ position: i }).where(eq(skillCategories.id, row.id)),
    ),
  );
  refresh();
}
