"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { SiteSettings } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { updateSettings, type ActionState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? "Enregistrement…" : "Enregistrer"}
    </Button>
  );
}

export default function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, action] = useActionState<ActionState, FormData>(updateSettings, {
    error: null,
  });

  useEffect(() => {
    if (state.ok) toast.success("Profil mis à jour.");
  }, [state.ok]);

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="heroRole">Rôle affiché</FieldLabel>
          <Input
            id="heroRole"
            name="heroRole"
            required
            placeholder="Analyste Développeur"
            defaultValue={settings?.heroRole ?? ""}
          />
        </Field>

        <Field orientation="horizontal">
          <Switch
            id="heroAvailable"
            name="heroAvailable"
            defaultChecked={settings?.heroAvailable ?? true}
          />
          <FieldLabel htmlFor="heroAvailable">
            Afficher « Disponible » dans le hero
          </FieldLabel>
        </Field>

        <Field>
          <FieldLabel htmlFor="heroBio">Bio</FieldLabel>
          <Textarea
            id="heroBio"
            name="heroBio"
            required
            rows={4}
            placeholder="Une ou deux phrases sur ce que vous faites."
            defaultValue={settings?.heroBio ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="method">Méthode</FieldLabel>
          <Input
            id="method"
            name="method"
            placeholder="Agile Scrum"
            defaultValue={settings?.method ?? ""}
          />
          <FieldDescription>
            Affichée sous la grille des compétences. Vide = ligne masquée.
          </FieldDescription>
        </Field>

        <Separator />

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="vous@exemple.com"
            defaultValue={settings?.email ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="githubUrl">GitHub</FieldLabel>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/…"
            defaultValue={settings?.githubUrl ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            placeholder="https://www.linkedin.com/in/…"
            defaultValue={settings?.linkedinUrl ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="cvUrl">CV</FieldLabel>
          <Input
            id="cvUrl"
            name="cvUrl"
            placeholder="/cv/CV_Yattara_Aboubacar.pdf"
            defaultValue={settings?.cvUrl ?? ""}
          />
          <FieldDescription>
            Chemin interne (/cv/CV_Yattara_Aboubacar.pdf) ou URL complète.
          </FieldDescription>
        </Field>

        {state.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <Submit />
      </FieldGroup>
    </form>
  );
}
