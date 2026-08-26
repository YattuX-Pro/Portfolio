"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { assertAdmin } from "@/lib/admin-guard";
import { uploadImage, deleteObject, isStorageKey } from "@/lib/storage";

/* CHAQUE action commence par assertAdmin().
   Une server action est un point d'entrée HTTP à part entière : la
   vérification faite dans le layout ne la protège pas. Sans ce contrôle,
   n'importe qui pourrait invoquer l'action directement. */

export type ActionState = { error: string | null; ok?: boolean };

function slugify(input: string) {
  return input
    .normalize("NFD")
    /* Retire les diacritiques isolés par NFD (é -> e + U+0301).
       Échappement explicite : la plage écrite littéralement serait
       invisible et fragile à la relecture. */
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseStack(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** Vide -> null, pour ne pas stocker de chaînes vides en base. */
function orNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
}

async function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugRaw || title);

  /* Un fichier téléversé l'emporte sur le champ texte : c'est l'action
     explicite de l'utilisateur. Sinon on garde ce qu'il a saisi. */
  const upload = formData.get("imageFile");
  let imageUrl = orNull(formData.get("imageUrl"));
  let uploadError: string | null = null;

  if (upload instanceof File && upload.size > 0) {
    const res = await uploadImage(upload, slug || "sans-slug");
    if ("error" in res) uploadError = res.error;
    else imageUrl = res.value;
  }

  return {
    uploadError,
    title,
    description,
    slug,
    imageUrl,
    demoUrl: orNull(formData.get("demoUrl")),
    githubUrl: orNull(formData.get("githubUrl")),
    stack: parseStack(String(formData.get("stack") ?? "")),
    published: formData.get("published") === "on",
  };
}

function validate(v: Awaited<ReturnType<typeof readForm>>): string | null {
  if (v.uploadError) return v.uploadError;
  if (!v.title) return "Le titre est obligatoire.";
  if (!v.description) return "La description est obligatoire.";
  if (!v.slug) return "Le titre doit contenir au moins une lettre ou un chiffre.";
  for (const [label, url] of [
    ["démo", v.demoUrl],
    ["code source", v.githubUrl],
  ] as const) {
    if (url && !/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      return `Le lien ${label} doit commencer par http://, https:// ou /.`;
    }
  }
  return null;
}

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const { uploadError, ...values } = await readForm(formData);
  const invalid = validate({ ...values, uploadError });
  if (invalid) return { error: invalid };

  /* position : à la suite du dernier projet. COALESCE gère la table vide. */
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${projects.position}), -1) + 1` })
    .from(projects);

  try {
    await db.insert(projects).values({ ...values, position: next });
  } catch (e) {
    if (String(e).includes("projects_slug_idx")) {
      return { error: "Un projet porte déjà cette adresse (slug). Changez le titre." };
    }
    throw e;
  }

  revalidatePath("/");
  revalidatePath("/admin/projets");
  return { error: null, ok: true };
}

export async function updateProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "Projet introuvable." };

  const { uploadError, ...values } = await readForm(formData);
  const invalid = validate({ ...values, uploadError });
  if (invalid) return { error: invalid };

  try {
    await db
      .update(projects)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(projects.id, id));
  } catch (e) {
    if (String(e).includes("projects_slug_idx")) {
      return { error: "Un projet porte déjà cette adresse (slug). Changez le titre." };
    }
    throw e;
  }

  revalidatePath("/");
  revalidatePath("/admin/projets");
  return { error: null, ok: true };
}

export async function deleteProject(formData: FormData) {
  await assertAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  /* Retire l'objet du bucket avant la ligne, sinon la clé est perdue et
     l'image reste orpheline pour toujours. */
  const [row] = await db
    .select({ imageUrl: projects.imageUrl })
    .from(projects)
    .where(eq(projects.id, id));
  if (row?.imageUrl && isStorageKey(row.imageUrl)) await deleteObject(row.imageUrl);

  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/");
  revalidatePath("/admin/projets");
}

/** Déplace un projet d'un cran en échangeant sa position avec son voisin. */
export async function moveProject(formData: FormData) {
  await assertAdmin();

  const id = Number(formData.get("id"));
  const direction = String(formData.get("direction"));
  if (!Number.isInteger(id) || !["up", "down"].includes(direction)) return;

  const ordered = await db
    .select({ id: projects.id, position: projects.position })
    .from(projects)
    .orderBy(projects.position);

  const index = ordered.findIndex((p) => p.id === id);
  if (index === -1) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= ordered.length) return;

  /* Les positions peuvent avoir des trous ou des doublons selon l'historique :
     on réécrit tout l'ordre plutôt que d'échanger deux valeurs. */
  const reordered = [...ordered];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  await Promise.all(
    reordered.map((row, i) =>
      db.update(projects).set({ position: i }).where(eq(projects.id, row.id)),
    ),
  );

  revalidatePath("/");
  revalidatePath("/admin/projets");
}
