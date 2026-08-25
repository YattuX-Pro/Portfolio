"use client";

import { useState } from "react";
import type { Project } from "@/lib/db/schema";
import ProjectForm from "./ProjectForm";
import { deleteProject, moveProject } from "./actions";

const ICON_BTN =
  "inline-flex items-center justify-center h-11 w-11 rounded-md text-ink-muted hover:text-ink hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer";

export default function ProjectRow({
  project,
  isFirst,
  isLast,
}: {
  project: Project;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const panelId = `projet-${project.id}`;

  return (
    <li className="border-b border-line">
      <div className="flex items-center gap-3 py-3">
        {/* Réordonnancement */}
        <div className="flex items-center">
          <form action={moveProject}>
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={isFirst}
              aria-label={`Monter ${project.title}`}
              className={ICON_BTN}
            >
              ↑
            </button>
          </form>
          <form action={moveProject}>
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={isLast}
              aria-label={`Descendre ${project.title}`}
              className={ICON_BTN}
            >
              ↓
            </button>
          </form>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-ink truncate">{project.title}</p>
          <p className="meta truncate">{project.stack.join(" · ") || "sans stack"}</p>
        </div>

        {!project.published ? (
          <span className="meta text-brand shrink-0">Masqué</span>
        ) : null}

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center h-11 px-3 text-[14px] text-ink hover:text-brand transition-colors duration-200 cursor-pointer shrink-0"
        >
          {open ? "Fermer" : "Modifier"}
        </button>
      </div>

      {open ? (
        <div id={panelId} className="pb-8 pt-2">
          <ProjectForm project={project} />

          {/* Suppression : confirmation en deux temps, sans window.confirm
              qui est bloquant et non stylable. */}
          <div className="mt-8 pt-5 border-t border-line flex flex-wrap items-center gap-3">
            {confirming ? (
              <>
                <p role="alert" className="text-[14px] text-ink">
                  Supprimer « {project.title} » définitivement ?
                </p>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center h-11 px-4 rounded-md bg-brand text-white text-[14px] font-medium hover:bg-brand-hover transition-colors duration-200 cursor-pointer"
                  >
                    Oui, supprimer
                  </button>
                </form>
                <button
                  onClick={() => setConfirming(false)}
                  className="inline-flex items-center h-11 px-4 text-[14px] text-ink-muted hover:text-ink transition-colors duration-200 cursor-pointer"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="inline-flex items-center h-11 px-4 rounded-md border border-line-strong text-[14px] text-ink-muted hover:text-brand hover:border-brand transition-colors duration-200 cursor-pointer"
              >
                Supprimer ce projet
              </button>
            )}
          </div>
        </div>
      ) : null}
    </li>
  );
}
