"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { SkillGroup } from "@/lib/db/queries";
import {
  updateCategory,
  deleteCategory,
  addItem,
  deleteItem,
  moveCategory,
  type ActionState,
} from "./actions";
import { ACCENT_OPTIONS, ACCENT_VARS } from "./constants";

const FIELD =
  "w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink focus:border-ink outline-none transition-colors duration-200";

const ICON_BTN =
  "inline-flex items-center justify-center h-11 w-11 rounded-md text-ink-muted hover:text-ink hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center h-11 px-4 rounded-md bg-brand text-white text-[14px] font-medium hover:bg-brand-hover disabled:opacity-60 transition-colors duration-200 cursor-pointer shrink-0"
    >
      {pending ? "…" : label}
    </button>
  );
}

export default function CategoryCard({
  category,
  isFirst,
  isLast,
}: {
  category: SkillGroup;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editState, editAction] = useActionState<ActionState, FormData>(updateCategory, {
    error: null,
  });
  const [addState, addAction] = useActionState<ActionState, FormData>(addItem, {
    error: null,
  });

  return (
    <li className="border border-line rounded-md p-5">
      {/* En-tête : nom, couleur, ordre.
          Les formulaires de réordonnancement sont FRÈRES de celui d'édition :
          imbriquer des <form> est invalide en HTML. */}
      <div className="flex flex-wrap items-end gap-3">
      <form action={editAction} className="flex flex-wrap items-end gap-3 flex-1 min-w-0">
        <input type="hidden" name="id" value={category.id} />

        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label htmlFor={`label-${category.id}`} className="meta">
            Catégorie
          </label>
          <input
            id={`label-${category.id}`}
            name="label"
            defaultValue={category.label}
            required
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2 min-w-[150px]">
          <label htmlFor={`accent-${category.id}`} className="meta">
            Couleur
          </label>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="block h-4 w-4 shrink-0 border border-line"
              style={{ backgroundColor: ACCENT_VARS[category.accent] ?? "var(--text)" }}
            />
            <select
              id={`accent-${category.id}`}
              name="accent"
              defaultValue={category.accent}
              className={FIELD}
            >
              {ACCENT_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Submit label="Enregistrer" />
      </form>

      <div className="flex items-center">
        <form action={moveCategory}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="direction" value="up" />
          <button
            type="submit"
            disabled={isFirst}
            aria-label={`Monter ${category.label}`}
            className={ICON_BTN}
          >
            ↑
          </button>
        </form>
        <form action={moveCategory}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="direction" value="down" />
          <button
            type="submit"
            disabled={isLast}
            aria-label={`Descendre ${category.label}`}
            className={ICON_BTN}
          >
            ↓
          </button>
        </form>
      </div>
      </div>

      {editState.error ? (
        <p role="alert" className="mt-3 text-[14px] text-brand">
          {editState.error}
        </p>
      ) : null}

      {/* Entrées */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {category.items.map((item) => (
          <li key={item.id}>
            <form action={deleteItem} className="contents">
              <input type="hidden" name="id" value={item.id} />
              <span className="inline-flex items-center gap-1 border border-line rounded-md pl-3 text-[14px] text-ink">
                {item.label}
                <button
                  type="submit"
                  aria-label={`Retirer ${item.label}`}
                  className="inline-flex items-center justify-center h-11 w-9 text-ink-muted hover:text-brand transition-colors duration-200 cursor-pointer"
                >
                  ×
                </button>
              </span>
            </form>
          </li>
        ))}
        {category.items.length === 0 ? (
          <li className="meta">Aucune compétence</li>
        ) : null}
      </ul>

      {/* Ajout d'une entrée */}
      <form action={addAction} className="mt-4 flex items-end gap-2">
        <input type="hidden" name="categoryId" value={category.id} />
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor={`add-${category.id}`} className="meta">
            Ajouter une compétence
          </label>
          <input
            id={`add-${category.id}`}
            name="label"
            placeholder="Ex. Kubernetes"
            className={FIELD}
          />
        </div>
        <Submit label="Ajouter" />
      </form>

      {addState.error ? (
        <p role="alert" className="mt-2 text-[14px] text-brand">
          {addState.error}
        </p>
      ) : null}

      {/* Suppression de la catégorie */}
      <details className="mt-5 pt-4 border-t border-line">
        <summary className="meta cursor-pointer select-none">
          Supprimer cette catégorie
        </summary>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-[14px] text-ink-muted">
            Les {category.items.length} compétences seront supprimées avec elle.
          </p>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              className="inline-flex items-center h-11 px-4 rounded-md border border-line-strong text-[14px] text-ink-muted hover:text-brand hover:border-brand transition-colors duration-200 cursor-pointer"
            >
              Supprimer définitivement
            </button>
          </form>
        </div>
      </details>
    </li>
  );
}
