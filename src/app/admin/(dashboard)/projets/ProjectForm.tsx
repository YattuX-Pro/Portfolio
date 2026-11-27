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
          <Input
            id="title"
            name="title"
            required
            placeholder="Ex. Rental Car"
            defaultValue={project?.title}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Ce que fait le projet, en deux ou trois phrases."
            defaultValue={project?.description}
          />
        </Field>

        {/* ── Présentation sur le site ──────────────────────────────────
            Le premier projet publié est le projet phare ; les autres sont
            groupés sous un intertitre selon leur type. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="kind">Type</FieldLabel>
            <select
              id="kind"
              name="kind"
              defaultValue={project?.kind ?? "personal"}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="personal">Projet personnel</option>
              <option value="employer">Réalisé chez Netsen Group</option>
              <option value="client">Pour un client (freelance)</option>
            </select>
            <FieldDescription>Choisit le groupe du projet sur le site.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="context">Contexte</FieldLabel>
            <Input
              id="context"
              name="context"
              placeholder="Ministère de l'Élevage"
              defaultValue={project?.context ?? ""}
            />
            <FieldDescription>Le client ou le cadre, au-dessus du titre.</FieldDescription>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="contribution">Mon apport</FieldLabel>
          <Textarea
            id="contribution"
            name="contribution"
            rows={2}
            placeholder="Ce que j'y ai fait, en une ou deux phrases."
            defaultValue={project?.contribution ?? ""}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="award">Distinction</FieldLabel>
            <Input
              id="award"
              name="award"
              placeholder="3e prix ANSUTEN"
              defaultValue={project?.award ?? ""}
            />
            <FieldDescription>Le sceau du projet phare. Facultatif.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="facts">Repères</FieldLabel>
            <Textarea
              id="facts"
              name="facts"
              rows={3}
              placeholder={"Utilisation : Des milliers de personnes\nDistinction : 3e prix ANSUTEN"}
              defaultValue={project?.facts.join("\n")}
            />
            <FieldDescription>Projet phare : un par ligne, « Libellé : valeur ».</FieldDescription>
          </Field>
        </div>

        {/* ── Étude de cas ─────────────────────────────────────────────
            Ce que le panneau de détail affiche sur le site. Tout est
            facultatif : une section vide ne s'affiche simplement pas. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="role">Rôle</FieldLabel>
            <Input
              id="role"
              name="role"
              placeholder="Développeur full-stack"
              defaultValue={project?.role ?? ""}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="year">Année</FieldLabel>
            <Input
              id="year"
              name="year"
              placeholder="2025 ou 2024 — 2025"
              defaultValue={project?.year ?? ""}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="problem">Le besoin</FieldLabel>
          <Textarea
            id="problem"
            name="problem"
            rows={3}
            placeholder="Quel problème le projet résout-il ? Dans quel contexte ?"
            defaultValue={project?.problem ?? ""}
          />
          <FieldDescription>
            Le « pourquoi ». S&apos;affiche en premier dans le panneau de
            détail.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="solution">La réponse</FieldLabel>
          <Textarea
            id="solution"
            name="solution"
            rows={4}
            placeholder="Ce que vous avez conçu et construit, et les choix techniques qui comptent."
            defaultValue={project?.solution ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="stack">Stack</FieldLabel>
          <Input
            id="stack"
            name="stack"
            placeholder="Next.js, ASP.NET, Docker"
            defaultValue={project?.stack.join(", ")}
          />
          <FieldDescription>
            Séparée par des virgules. Exemple : Next.js, ASP.NET, Docker
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="imageFile">Téléverser une image</FieldLabel>
          <Input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          />
          <FieldDescription>
            JPEG, PNG, WebP, AVIF ou GIF, 5 Mo maximum. Envoyée vers le stockage
            objet Neon. Un fichier choisi ici remplace le champ ci-dessous.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="imageUrl">Ou saisir une adresse</FieldLabel>
          <Input
            id="imageUrl"
            name="imageUrl"
            placeholder="/carties.PNG"
            defaultValue={project?.imageUrl ?? ""}
          />
          <FieldDescription>
            Chemin local (/carties.PNG) ou URL complète. Vide = sans visuel.
            Une valeur commençant par « neon: » désigne un fichier déjà
            téléversé — la laisser telle quelle.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="imageMobileFile">Capture mobile (projet phare)</FieldLabel>
          <Input
            id="imageMobileFile"
            name="imageMobileFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          />
          <Input
            id="imageMobileUrl"
            name="imageMobileUrl"
            aria-label="Ou adresse de la capture mobile"
            placeholder="/projets/nmaphoto-mobile.webp"
            defaultValue={project?.imageMobileUrl ?? ""}
          />
          <FieldDescription>
            Affichée dans un téléphone sur mobile. Un fichier choisi remplace
            l&apos;adresse. Vide = la capture principale est utilisée.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="githubUrl">Code source</FieldLabel>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/…"
            defaultValue={project?.githubUrl ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="demoUrl">Site en ligne</FieldLabel>
          <Input
            id="demoUrl"
            name="demoUrl"
            type="url"
            placeholder="https://…"
            defaultValue={project?.demoUrl ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">Adresse (slug)</FieldLabel>
          <Input
            id="slug"
            name="slug"
            placeholder="rental-car"
            defaultValue={project?.slug}
          />
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
