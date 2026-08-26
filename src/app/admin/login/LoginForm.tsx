"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { signInAction, type LoginState } from "./actions";

function SubmitButton() {
  /* useFormStatus doit être appelé dans un enfant du <form>, pas dans le
     composant qui le rend — d'où ce sous-composant. */
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full cursor-pointer"
      disabled={pending}
    >
      {pending ? <Spinner className="size-4" /> : null}
      {pending ? "Connexion…" : "Se connecter"}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    signInAction,
    { error: null },
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="vous@exemple.com"
          required
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      {state.error ? (
        /* role=alert : annoncé par les lecteurs d'écran à l'apparition. */
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
