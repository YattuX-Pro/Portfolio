"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";
import { assertAdmin } from "@/lib/admin-guard";

/* CHAQUE action commence par assertAdmin() : une server action est un point
   d'entrée HTTP à part entière, la vérification du layout ne la protège pas.
   Même structure que les actions de Projets. */

export type ActionState = { error: string | null; ok?: boolean };

const KINDS = ["work", "education"] as const;

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/parcours");
}

/** Vide -> null, pour ne pas stocker de chaînes vides en base. */
function orNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
}

function readForm(formData: FormData) {
  const kind = String(formData.get("kind") ?? "work");
  return {
    period: String(formData.get("period") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    organization: String(formData.get("organization") ?? "").trim(),
    summary: orNull(formData.get("summary")),
    /* Une valeur hors liste retombe sur « poste » plutôt que d'être
       enregistrée : c'est elle qui choisit la couleur sur le site. */
    kind: (KINDS as readonly string[]).includes(kind) ? kind : "work",
    current: formData.get("current") === "on",
  };
}

function validate(v: ReturnType<typeof readForm>): string | null {
  if (!v.period) return "La période est obligatoire.";
  if (!v.title) return "L'intitulé est obligatoire.";
  if (!v.organization) return "L'organisation est obligatoire.";
  return null;
}

export async function createExperience(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const values = readForm(formData);
  const invalid = validate(values);
  if (invalid) return { error: invalid };

  /* Une nouvelle étape est presque toujours la plus récente : elle entre EN
     TÊTE du journal (position la plus basse), pas à la fin comme un projet. */
  const [{ first }] = await db
    .select({ first: sql<number>`coalesce(min(${experiences.position}), 1) - 1` })
    .from(experiences);

  await db.insert(experiences).values({ ...values, position: first });
  refresh();
  return { error: null, ok: true };
}

export async function updateExperience(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "Étape introuvable." };

  const values = readForm(formData);
  const invalid = validate(values);
  if (invalid) return { error: invalid };

  await db.update(experiences).set(values).where(eq(experiences.id, id));
  refresh();
  return { error: null, ok: true };
}

export async function deleteExperience(formData: FormData) {
  await assertAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db.delete(experiences).where(eq(experiences.id, id));
  refresh();
}

/** Déplace une étape d'un cran en échangeant sa place avec sa voisine. */
export async function moveExperience(formData: FormData) {
  await assertAdmin();

  const id = Number(formData.get("id"));
  const direction = String(formData.get("direction"));
  if (!Number.isInteger(id) || !["up", "down"].includes(direction)) return;

  const ordered = await db
    .select({ id: experiences.id })
    .from(experiences)
    .orderBy(experiences.position);

  const index = ordered.findIndex((row) => row.id === id);
  if (index === -1) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= ordered.length) return;

  /* On réécrit tout l'ordre plutôt que d'échanger deux valeurs : les
     positions négatives de `createExperience` laissent des trous. */
  const reordered = [...ordered];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  await Promise.all(
    reordered.map((row, i) =>
      db.update(experiences).set({ position: i }).where(eq(experiences.id, row.id)),
    ),
  );

  refresh();
}
