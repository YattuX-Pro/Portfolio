"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
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

/* `<input type="datetime-local">` renvoie « 2022-09-01T00:00 » — une heure
   SANS fuseau. On la lit donc explicitement en UTC en ajoutant le « Z ».

   ⚠️ C'est le point délicat de ce champ. Sans le « Z », `new Date(...)` aurait
   interprété la chaîne dans le fuseau du SERVEUR : en local (Europe/Paris) le
   1er septembre 00h00 devenait 22h00 la veille en UTC, et la même sauvegarde
   depuis Vercel (UTC) donnait une autre valeur. La date d'ancienneté se
   serait décalée de deux heures selon l'endroit d'où on enregistre.

   Lire en UTC est aussi la lecture JUSTE ici : la Guinée est à UTC+0, l'heure
   saisie est donc l'heure réelle de signature. `SettingsForm` réaffiche le
   champ avec la même convention (`toISOString`), l'aller-retour est stable. */
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

function parseUtcDatetime(raw: string): Date | null {
  if (!LOCAL_DATETIME.test(raw)) return null;
  /* Les secondes sont facultatives selon le navigateur : on les complète. */
  const withSeconds = raw.length === 16 ? `${raw}:00` : raw;
  const date = new Date(`${withSeconds}.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
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

  /* Date du premier contrat. Vide est légitime : le compteur d'expérience
     disparaît alors du hero. */
  const rawStart = orNull(formData.get("experienceStartAt"));
  let experienceStartAt: Date | null = null;
  if (rawStart) {
    experienceStartAt = parseUtcDatetime(rawStart);
    if (!experienceStartAt) {
      return { error: "Date du premier contrat invalide." };
    }
    /* Une date future donnerait des durées négatives, donc un compteur qui
       affiche « -1 an » sur la page d'accueil. On refuse à la saisie plutôt
       que d'avoir à s'en défendre au rendu. */
    if (experienceStartAt.getTime() > Date.now()) {
      return { error: "La date du premier contrat ne peut pas être dans le futur." };
    }
  }

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
    experienceStartAt,
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
