"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function signInAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-mail et mot de passe requis." };
  }

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    /* La cause réelle part dans les logs du SERVEUR, jamais dans la réponse.

       Le message rendu reste volontairement identique pour un e-mail inconnu
       et un mot de passe faux : les distinguer révélerait quels comptes
       existent. Mais il était aussi renvoyé pour une panne réseau, un
       MISSING_ORIGIN ou une limite de débit — « Identifiants invalides. »
       devenait alors un contresens qui envoyait chercher le problème du
       mauvais côté. Le masque reste, la cause est tracée. */
    console.error("[admin/login] échec signIn.email :", error);
    return { error: "Identifiants invalides." };
  }

  redirect("/admin");
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/admin/login");
}
