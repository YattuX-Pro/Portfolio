"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { Project } from "@/lib/db/schema";
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
import { createProject, updateProject, type ActionState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

export default function ProjectForm({
  project,
  onSaved,
}: {
  project?: Project;
  onSaved?: () => void;
}) {
  const editing = Boolean(project);
  const [state, formAction] = useActionState<ActionState, FormData>(
    editing ? updateProject : createProject,
    { error: null },
  );

  /* Le succès referme le panneau et notifie. Passer par un effet est ici
     légitime : c'est une réaction à un changement d'état venu du serveur,
     pas un calcul dérivable pendant le rendu. */
  useEffect(() => {
    if (state.ok) {
      toast.success(editing ? "Projet mis à jour." : "Projet créé.");
      onSaved?.();
    }
  }, [state.ok, editing, onSaved]);

  return (
    <form action={formAction}>
      <FieldGroup>
        {editing ? <input type="hidden" name="id" value={project!.id} /> : null}

        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="title">Titre</FieldLabel>
          <Input id="title" name="title" required defaultValue={project?.title} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={project?.description}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="stack">Stack</FieldLabel>
          <Input id="stack" name="stack" defaultValue={project?.stack.join(", ")} />
          <FieldDescription>
            Séparée par des virgules. Exemple : Next.js, ASP.NET, Docker
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="imageUrl">Image</FieldLabel>
          <Input
            id="imageUrl"
            name="imageUrl"
            defaultValue={project?.imageUrl ?? ""}
          />
          <FieldDescription>
            Chemin local (/carties.PNG) ou URL complète. Vide = sans visuel.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="githubUrl">Code source</FieldLabel>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={project?.githubUrl ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="demoUrl">Démo</FieldLabel>
          <Input
            id="demoUrl"
            name="demoUrl"
            type="url"
            defaultValue={project?.demoUrl ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">Adresse (slug)</FieldLabel>
          <Input id="slug" name="slug" defaultValue={project?.slug} />
          <FieldDescription>
            Vide pour la déduire du titre.
          </FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <Switch
            id="published"
            name="published"
            defaultChecked={project?.published ?? true}
          />
          <FieldLabel htmlFor="published">Visible sur le site</FieldLabel>
        </Field>

        {state.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <Submit label={editing ? "Enregistrer" : "Créer le projet"} />
      </FieldGroup>
    </form>
  );
}
