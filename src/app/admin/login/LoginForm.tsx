"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signInAction, type LoginState } from "./actions";

function SubmitButton() {
  /* useFormStatus doit être appelé dans un enfant du <form>, pas dans le
     composant qui le rend — d'où ce sous-composant. */
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? "Connexion…" : "Se connecter"}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(signInAction, {
    error: null,
  });

  return (
    <form action={formAction} className="mt-8">
      <FieldGroup>
        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={state.error ? true : undefined}
          />
        </Field>

        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={state.error ? true : undefined}
          />
        </Field>

        {state.error ? (
          /* role=alert : annoncé par les lecteurs d'écran à l'apparition. */
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <SubmitButton />
      </FieldGroup>
    </form>
  );
}
