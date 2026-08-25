"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction, type LoginState } from "./actions";

function SubmitButton() {
  /* useFormStatus doit être appelé dans un enfant du <form>, pas dans le
     composant qui le rend — d'où ce sous-composant. */
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex items-center justify-center h-12 w-full rounded-md bg-accent text-white text-[15px] font-medium hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
    >
      {pending ? "Connexion…" : "Se connecter"}
    </button>
  );
}

const FIELD =
  "h-12 w-full rounded-md border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-ink outline-none transition-colors duration-200";

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(signInAction, {
    error: null,
  });

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="meta">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="meta">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </div>

      {state.error ? (
        /* role=alert : le message est annoncé par les lecteurs d'écran
           au moment où il apparaît. */
        <p role="alert" className="text-[14px] text-accent">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
