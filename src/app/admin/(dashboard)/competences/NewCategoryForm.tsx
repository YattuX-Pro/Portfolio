"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCategory, type ActionState } from "./actions";
import { ACCENT_OPTIONS } from "./constants";

const FIELD =
  "w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink focus:border-ink outline-none transition-colors duration-200";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-brand text-white text-[14px] font-medium hover:bg-brand-hover disabled:opacity-60 transition-colors duration-200 cursor-pointer shrink-0"
    >
      {pending ? "Création…" : "Créer"}
    </button>
  );
}

export default function NewCategoryForm() {
  const [state, action] = useActionState<ActionState, FormData>(createCategory, {
    error: null,
  });

  return (
    <>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
          <label htmlFor="new-label" className="meta">
            Nom
          </label>
          <input
            id="new-label"
            name="label"
            required
            placeholder="Ex. Mobile"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2 min-w-[170px]">
          <label htmlFor="new-accent" className="meta">
            Couleur
          </label>
          <select id="new-accent" name="accent" defaultValue="text" className={FIELD}>
            {ACCENT_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <Submit />
      </form>

      {state.error ? (
        <p role="alert" className="mt-3 text-[14px] text-brand">
          {state.error}
        </p>
      ) : null}

      <p className="mt-4 text-[13px] leading-[1.6] text-ink-muted">
        Le jaune du drapeau n&apos;est pas proposé : à 1,41:1 sur le fond crème,
        il ne franchit pas le seuil de contraste de 3:1 exigé pour un élément
        graphique porteur d&apos;information.
      </p>
    </>
  );
}
