"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, heroStats, heroStack } from "@/lib/db/schema";
import { assertAdmin } from "@/lib/admin-guard";

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
  const cvUrl = orNull(formData.get("cvUrl"));
  const heroAvailable = formData.get("heroAvailable") === "on";

  if (!heroRole) return { error: "Le rôle est obligatoire." };
  if (!heroBio) return { error: "La bio est obligatoire." };
  if (!email) return { error: "L'e-mail est obligatoire." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format d'e-mail invalide." };
  }
  for (const [label, url] of [
    ["GitHub", githubUrl],
    ["LinkedIn", linkedinUrl],
    ["CV", cvUrl],
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
