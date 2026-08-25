"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Project } from "@/lib/db/schema";
import { createProject, updateProject, type ActionState } from "./actions";

const FIELD =
  "w-full rounded-md border border-line-strong bg-surface px-3.5 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-ink outline-none transition-colors duration-200";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-accent text-white text-[15px] font-medium hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
    >
      {pending ? "Enregistrement…" : label}
    </button>
  );
}

function Field({
  name,
  label,
  hint,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="meta">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export default function ProjectForm({ project }: { project?: Project }) {
  const editing = Boolean(project);
  const [state, formAction] = useActionState<ActionState, FormData>(
    editing ? updateProject : createProject,
    { error: null },
  );

  /* Pas d'état local ni de callback de succès : l'action appelle
     revalidatePath, donc Next re-rend la liste serveur toute seule. */
  return (
    <form action={formAction} className="flex flex-col gap-5">
      {editing ? <input type="hidden" name="id" value={project!.id} /> : null}

      <Field name="title" label="Titre">
        <input
          id="title"
          name="title"
          required
          defaultValue={project?.title}
          className={FIELD}
        />
      </Field>

      <Field name="description" label="Description">
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={project?.description}
          className={`${FIELD} resize-y`}
        />
      </Field>

      <Field
        name="stack"
        label="Stack"
        hint="Séparée par des virgules. Exemple : Next.js, ASP.NET, Docker"
      >
        <input
          id="stack"
          name="stack"
          defaultValue={project?.stack.join(", ")}
          className={FIELD}
        />
      </Field>

      <Field
        name="imageUrl"
        label="Image"
        hint="Chemin local (/carties.PNG) ou URL complète. Laisser vide si aucun visuel."
      >
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={project?.imageUrl ?? ""}
          className={FIELD}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field name="githubUrl" label="Code source">
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={project?.githubUrl ?? ""}
            className={FIELD}
          />
        </Field>

        <Field name="demoUrl" label="Démo">
          <input
            id="demoUrl"
            name="demoUrl"
            type="url"
            defaultValue={project?.demoUrl ?? ""}
            className={FIELD}
          />
        </Field>
      </div>

      <Field
        name="slug"
        label="Adresse (slug)"
        hint="Laisser vide pour la déduire du titre."
      >
        <input
          id="slug"
          name="slug"
          defaultValue={project?.slug}
          className={FIELD}
        />
      </Field>

      <label className="flex items-center gap-3 min-h-11 cursor-pointer">
        <input
          type="checkbox"
          name="published"
          defaultChecked={project?.published ?? true}
          className="h-5 w-5 accent-[var(--accent)] cursor-pointer"
        />
        <span className="text-[15px] text-ink">Visible sur le site</span>
      </label>

      {state.error ? (
        <p role="alert" className="text-[14px] text-accent">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p role="status" className="text-[14px]" style={{ color: "var(--flag-green-ink)" }}>
          Enregistré.
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Submit label={editing ? "Enregistrer" : "Créer le projet"} />
      </div>
    </form>
  );
}
