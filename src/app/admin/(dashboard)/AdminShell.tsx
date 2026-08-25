"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AdminNav, { useCurrentSection } from "./AdminNav";
import { signOutAction } from "@/app/admin/login/actions";

const SIDEBAR_ID = "admin-sidebar";

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const section = useCurrentSection();
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Fermeture à la navigation : passée à AdminNav, qui l'appelle au clic.
     Un effet sur pathname ferait la même chose, mais changer l'état depuis
     un effet est un anti-patron — et ici c'est inutile. */
  const close = useCallback(() => setOpen(false), []);

  /* Repasse en desktop : le tiroir doit se refermer, sinon il garde le
     verrou de défilement alors qu'il n'est plus visible. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Tiroir ouvert : Échap ferme et le défilement du corps est verrouillé. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-svh bg-bg">
      {/* ── Voile, sous lg uniquement ────────────────────────────────── */}
      {open ? (
        <div
          aria-hidden
          onClick={close}
          className="lg:hidden fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
        />
      ) : null}

      {/* ── Colonne latérale ─────────────────────────────────────────── */}
      <aside
        id={SIDEBAR_ID}
        className={`fixed inset-y-0 left-0 z-50 w-[264px] bg-surface border-r border-line flex flex-col transition-transform duration-300 ease-soft lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-line shrink-0">
          <span className="font-mono text-[13px] tracking-[0.14em] text-ink">ADMIN</span>
          <span aria-hidden className="flex items-center gap-1">
            <span className="block h-1.5 w-4 bg-flag-red" />
            <span className="block h-1.5 w-4 bg-flag-yellow" />
            <span className="block h-1.5 w-4 bg-flag-green" />
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <AdminNav onNavigate={close} />
        </div>

        <div className="border-t border-line p-3 shrink-0">
          <p className="meta px-3 truncate" title={email}>
            {email}
          </p>
          <div className="mt-1 flex flex-col">
            <Link
              href="/"
              target="_blank"
              className="flex items-center h-11 px-3 rounded-md text-[14px] text-ink-muted hover:text-ink hover:bg-bg transition-colors duration-200"
            >
              Voir le site
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center h-11 w-full px-3 rounded-md text-[14px] text-ink-muted hover:text-brand hover:bg-bg transition-colors duration-200 cursor-pointer"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Zone de contenu ──────────────────────────────────────────── */}
      <div className="lg:pl-[264px] min-h-svh flex flex-col">
        <header className="sticky top-0 z-30 h-16 shrink-0 bg-bg/90 backdrop-blur-md border-b border-line">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-3">
            <button
              ref={triggerRef}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={SIDEBAR_ID}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="lg:hidden -ml-2 h-11 w-11 flex flex-col items-center justify-center gap-[5px] rounded-md hover:bg-surface transition-colors duration-200 cursor-pointer"
            >
              <span aria-hidden className="block h-[1.5px] w-5 bg-ink" />
              <span aria-hidden className="block h-[1.5px] w-5 bg-ink" />
              <span aria-hidden className="block h-[1.5px] w-5 bg-ink" />
            </button>

            <div className="min-w-0">
              <p className="meta leading-none">{section.hint}</p>
              <h1 className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-ink truncate leading-none">
                {section.label}
              </h1>
            </div>
          </div>
        </header>

        {/* Pleine largeur : un back-office n'est pas une page de lecture,
            aucune raison de brider le contenu à une colonne centrée. */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>

        <footer className="shrink-0 border-t border-line px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="meta">
              © {new Date().getFullYear()} Aboubacar Tidiane Yattara
            </p>
            <p className="meta">Neon Postgres · eu-central-1</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
