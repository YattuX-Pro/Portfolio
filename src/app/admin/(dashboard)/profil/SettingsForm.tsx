"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { SiteSettings } from "@/lib/db/schema";
import { updateSettings, type ActionState } from "./actions";

const FIELD =
  "w-full rounded-md border border-line-strong bg-surface px-3.5 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-ink outline-none transition-colors duration-200";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-accent text-white text-[15px] font-medium hover:bg-accent-hover disabled:opacity-60 transition-colors duration-200 cursor-pointer"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
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

export default function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, action] = useActionState<ActionState, FormData>(updateSettings, {
    error: null,
  });

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field name="heroRole" label="Rôle affiché">
        <input
          id="heroRole"
          name="heroRole"
          required
          defaultValue={settings?.heroRole ?? ""}
          className={FIELD}
        />
      </Field>

      <label className="flex items-center gap-3 min-h-11 cursor-pointer">
        <input
          type="checkbox"
          name="heroAvailable"
          defaultChecked={settings?.heroAvailable ?? true}
          className="h-5 w-5 accent-[var(--accent)] cursor-pointer"
        />
        <span className="text-[15px] text-ink">
          Afficher « Disponible » dans le hero
        </span>
      </label>

      <Field name="heroBio" label="Bio">
        <textarea
          id="heroBio"
          name="heroBio"
          required
          rows={4}
          defaultValue={settings?.heroBio ?? ""}
          className={`${FIELD} resize-y`}
        />
      </Field>

      <Field
        name="method"
        label="Méthode"
        hint="Affichée sous la grille des compétences. Vide = ligne masquée."
      >
        <input
          id="method"
          name="method"
          defaultValue={settings?.method ?? ""}
          className={FIELD}
        />
      </Field>

      <div className="pt-4 border-t border-line">
        <p className="meta">Coordonnées</p>
      </div>

      <Field name="email" label="E-mail">
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={settings?.email ?? ""}
          className={FIELD}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field name="githubUrl" label="GitHub">
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={settings?.githubUrl ?? ""}
            className={FIELD}
          />
        </Field>

        <Field name="linkedinUrl" label="LinkedIn">
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={settings?.linkedinUrl ?? ""}
            className={FIELD}
          />
        </Field>
      </div>

      <Field
        name="cvUrl"
        label="CV"
        hint="Chemin interne (/cv/CV_Yattara_Aboubacar.pdf) ou URL complète."
      >
        <input
          id="cvUrl"
          name="cvUrl"
          defaultValue={settings?.cvUrl ?? ""}
          className={FIELD}
        />
      </Field>

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

      <div>
        <Submit />
      </div>
    </form>
  );
}
