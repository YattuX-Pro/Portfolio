"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "./actions";

const FIELD =
  "w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/60 focus:border-ink outline-none transition-colors duration-200";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center h-11 px-4 rounded-md bg-accent text-white text-[14px] font-medium hover:bg-accent-hover disabled:opacity-60 transition-colors duration-200 cursor-pointer shrink-0"
    >
      {pending ? "…" : "Ajouter"}
    </button>
  );
}

/* Éditeur générique à deux colonnes, partagé par les chiffres du hero
   (valeur / libellé) et la colonne stack (groupe / contenu). */
export default function ListEditor({
  rows,
  fields,
  addAction,
  deleteAction,
  emptyLabel,
}: {
  rows: { id: number; left: string; right: string }[];
  fields: { left: { name: string; label: string; placeholder: string }; right: { name: string; label: string; placeholder: string } };
  addAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: (formData: FormData) => Promise<void>;
  emptyLabel: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(addAction, {
    error: null,
  });

  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-[15px] text-muted">{emptyLabel}</p>
      ) : (
        <ul className="border-t border-line">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 py-2 border-b border-line"
            >
              <span className="font-mono text-[13px] text-ink shrink-0 min-w-[70px]">
                {row.left}
              </span>
              <span className="flex-1 text-[15px] text-muted truncate">{row.right}</span>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={row.id} />
                <button
                  type="submit"
                  aria-label={`Supprimer ${row.left}`}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-md text-muted hover:text-accent transition-colors duration-200 cursor-pointer"
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2 min-w-[110px]">
          <label htmlFor={fields.left.name} className="meta">
            {fields.left.label}
          </label>
          <input
            id={fields.left.name}
            name={fields.left.name}
            required
            placeholder={fields.left.placeholder}
            className={FIELD}
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label htmlFor={fields.right.name} className="meta">
            {fields.right.label}
          </label>
          <input
            id={fields.right.name}
            name={fields.right.name}
            required
            placeholder={fields.right.placeholder}
            className={FIELD}
          />
        </div>
        <Submit />
      </form>

      {state.error ? (
        <p role="alert" className="mt-3 text-[14px] text-accent">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
