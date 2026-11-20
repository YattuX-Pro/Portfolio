"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { Experience } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { createExperience, updateExperience, type ActionState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

export default function ExperienceForm({
  experience,
  onSaved,
}: {
  experience?: Experience;
  onSaved?: () => void;
}) {
  const editing = Boolean(experience);
  const [state, formAction] = useActionState<ActionState, FormData>(
    editing ? updateExperience : createExperience,
    { error: null },
  );

  /* Même mécanique que le formulaire de projet : le succès venu du serveur
     referme le panneau et notifie. */
  useEffect(() => {
    if (state.ok) {
      toast.success(editing ? "Étape mise à jour." : "Étape ajoutée.");
      onSaved?.();
    }
  }, [state.ok, editing, onSaved]);

  return (
    <form action={formAction}>
      <FieldGroup>
        {editing ? <input type="hidden" name="id" value={experience!.id} /> : null}

        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="title">Intitulé</FieldLabel>
          <Input
            id="title"
            name="title"
            required
            placeholder="Analyste Développeur"
            defaultValue={experience?.title}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="organization">Organisation</FieldLabel>
          <Input
            id="organization"
            name="organization"
            required
            placeholder="Netsen Group"
            defaultValue={experience?.organization}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="period">Période</FieldLabel>
          <Input
            id="period"
            name="period"
            required
            placeholder="Mai 2024 — oct. 2025"
            defaultValue={experience?.period}
          />
          <FieldDescription>
            Texte libre, affiché tel quel : « Nov. 2025 — aujourd&apos;hui ».
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="summary">Ce qui y a été fait</FieldLabel>
          <Textarea
            id="summary"
            name="summary"
            rows={3}
            placeholder="Une phrase : missions, technologies, responsabilités."
            defaultValue={experience?.summary ?? ""}
          />
          <FieldDescription>Facultatif.</FieldDescription>
        </Field>

        {/* Un <select> natif : deux valeurs, aucune raison d'embarquer un
            composant de liste déroulante pour ça. */}
        <Field>
          <FieldLabel htmlFor="kind">Type</FieldLabel>
          <select
            id="kind"
            name="kind"
            defaultValue={experience?.kind ?? "work"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="work">Poste</option>
            <option value="education">Formation</option>
          </select>
          <FieldDescription>
            Choisit la couleur du repère sur le site : encre pour un poste,
            vert pour une formation.
          </FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <Switch
            id="current"
            name="current"
            defaultChecked={experience?.current ?? false}
          />
          <FieldLabel htmlFor="current">Poste en cours</FieldLabel>
        </Field>

        {state.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <Submit label={editing ? "Enregistrer" : "Ajouter l'étape"} />
      </FieldGroup>
    </form>
  );
}
