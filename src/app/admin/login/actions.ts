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
    /* Message volontairement identique pour un e-mail inconnu et un mot de
       passe faux : distinguer les deux révélerait quels comptes existent. */
    return { error: "Identifiants invalides." };
  }

  redirect("/admin");
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/admin/login");
}
