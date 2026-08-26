"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, heroStats, heroStack } from "@/lib/db/schema";
import { assertAdmin } from "@/lib/admin-guard";
import { uploadCv, deleteObject, isStorageKey } from "@/lib/storage";

export type ActionState = { error: string | null; ok?: boolean };

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/profil");
}

function orNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
}

/** Accepte une URL absolue http(s) ou un chemin interne commençant par /. */
function badUrl(url: string | null): boolean {
  if (!url) return false;
  return !/^https?:\/\//i.test(url) && !url.startsWith("/");
}

export async function updateSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const heroRole = String(formData.get("heroRole") ?? "").trim();
  const heroBio = String(formData.get("heroBio") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const method = orNull(formData.get("method"));
  const githubUrl = orNull(formData.get("githubUrl"));
  const linkedinUrl = orNull(formData.get("linkedinUrl"));
  const heroAvailable = formData.get("heroAvailable") === "on";

  /* ── CV ──────────────────────────────────────────────────────────────
     Le CV est téléversé, plus saisi comme lien. Trois cas, dans cet ordre :

     1. un fichier est joint  -> on le téléverse et on remplace ;
     2. « retirer » est coché -> on efface la valeur ;
     3. rien de tout ça       -> on garde l'existant.

     Le cas 3 est le point délicat : le formulaire ne transporte plus d'URL,
     donc sans lecture de la valeur en base, tout enregistrement d'un autre
     champ (la bio, par exemple) effacerait le CV au passage. */
  const current = await db
    .select({ cvUrl: siteSettings.cvUrl })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);
  const previousCv = current[0]?.cvUrl ?? null;

  const upload = formData.get("cvFile");
  const removeCv = formData.get("cvRemove") === "on";
  let cvUrl = previousCv;
  /* La clé remplacée n'est supprimée du bucket qu'APRÈS l'écriture en base :
     supprimer d'abord laisserait un lien mort si l'insert échouait. */
  let staleCv: string | null = null;

  if (upload instanceof File && upload.size > 0) {
    const res = await uploadCv(upload);
    if ("error" in res) return { error: res.error };
    cvUrl = res.value;
    if (isStorageKey(previousCv)) staleCv = previousCv;
  } else if (removeCv) {
    cvUrl = null;
    if (isStorageKey(previousCv)) staleCv = previousCv;
  }

  if (!heroRole) return { error: "Le rôle est obligatoire." };
  if (!heroBio) return { error: "La bio est obligatoire." };
  if (!email) return { error: "L'e-mail est obligatoire." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format d'e-mail invalide." };
  }
  /* cvUrl n'est plus validé comme lien : il vient soit du téléversement,
     soit de la base. */
  for (const [label, url] of [
    ["GitHub", githubUrl],
    ["LinkedIn", linkedinUrl],
  ] as const) {
    if (badUrl(url)) {
      return { error: `Le lien ${label} doit commencer par http://, https:// ou /.` };
    }
  }

  const values = {
    heroRole,
    heroBio,
    heroAvailable,
    method,
    email,
    githubUrl,
    linkedinUrl,
    cvUrl,
    updatedAt: new Date(),
  };

  /* La table ne contient qu'une ligne (id = 1). onConflictDoUpdate couvre le
     cas d'une base migrée mais jamais seedée, où la ligne n'existe pas. */
  await db
    .insert(siteSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values });

  if (staleCv) await deleteObject(staleCv);

  refresh();
  return { error: null, ok: true };
}

/* ─── Chiffres du hero ─────────────────────────────────────────────────── */

export async function addStat(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const value = String(formData.get("value") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!value || !label) return { error: "Chiffre et libellé sont obligatoires." };

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${heroStats.position}), -1) + 1` })
    .from(heroStats);

  await db.insert(heroStats).values({ value, label, position: next });
  refresh();
  return { error: null, ok: true };
}

export async function deleteStat(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await db.delete(heroStats).where(eq(heroStats.id, id));
  refresh();
}

/* ─── Colonne « Stack principale » ─────────────────────────────────────── */

export async function addStackRow(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const groupLabel = String(formData.get("groupLabel") ?? "").trim();
  const items = String(formData.get("items") ?? "").trim();
  if (!groupLabel || !items) return { error: "Groupe et contenu sont obligatoires." };

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${heroStack.position}), -1) + 1` })
    .from(heroStack);

  await db.insert(heroStack).values({ groupLabel, items, position: next });
  refresh();
  return { error: null, ok: true };
}

export async function deleteStackRow(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await db.delete(heroStack).where(eq(heroStack.id, id));
  refresh();
}
