import Link from "next/link";
import { getAllProjects, getSkills, getSettings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

function Tile({
  value,
  label,
  hint,
  accent,
}: {
  value: string | number;
  label: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="border border-line rounded-md bg-surface p-5">
      <div aria-hidden className="h-1 w-10 mb-4" style={{ backgroundColor: accent }} />
      <p className="text-[32px] font-semibold tracking-[-0.03em] leading-none text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-2 meta">{label}</p>
      {hint ? <p className="mt-1 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  /* Trois lectures indépendantes : en parallèle, jamais en cascade. */
  const [projects, skills, settings] = await Promise.all([
    getAllProjects(),
    getSkills(),
    getSettings(),
  ]);

  const published = projects.filter((p) => p.published);
  const hidden = projects.length - published.length;
  const skillCount = skills.reduce((n, c) => n + c.items.length, 0);

  const lastUpdated = projects.reduce<Date | null>(
    (latest, p) => (!latest || p.updatedAt > latest ? p.updatedAt : latest),
    null,
  );

  return (
    <div className="flex flex-col gap-10">
      {/* Indicateurs */}
      <section>
        <h2 className="meta pb-3 border-b border-line">Vue d&apos;ensemble</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Tile
            value={published.length}
            label="Projets publiés"
            hint={hidden > 0 ? `${hidden} masqué${hidden > 1 ? "s" : ""}` : "Aucun masqué"}
            accent="var(--flag-red)"
          />
          <Tile
            value={skills.length}
            label="Catégories"
            hint={`${skillCount} compétences`}
            accent="var(--flag-green)"
          />
          <Tile
            value={settings?.heroAvailable ? "Oui" : "Non"}
            label="Disponible"
            hint="Affiché dans le hero"
            accent="var(--text)"
          />
          <Tile
            value={
              lastUpdated
                ? lastUpdated.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "—"
            }
            label="Dernière modif."
            hint="Projet le plus récent"
            accent="var(--muted)"
          />
        </div>
      </section>

      {/* Projets récents */}
      <section>
        <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-line">
          <h2 className="meta">Projets</h2>
          <Link
            href="/admin/projets"
            className="text-[14px] text-accent hover:text-accent-hover transition-colors duration-200"
          >
            Tout gérer
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="mt-5 text-[15px] text-muted">
            Aucun projet.{" "}
            <Link href="/admin/projets" className="text-accent hover:underline">
              En créer un
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-1">
            {projects.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 py-3 border-b border-line"
              >
                <span
                  aria-hidden
                  className="block h-2 w-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: p.published
                      ? "var(--flag-green)"
                      : "var(--line-strong)",
                  }}
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-medium text-ink truncate">
                    {p.title}
                  </span>
                  <span className="block meta truncate">
                    {p.stack.join(" · ") || "sans stack"}
                  </span>
                </span>
                {!p.published ? (
                  <span className="meta text-accent shrink-0">Masqué</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Raccourcis */}
      <section>
        <h2 className="meta pb-3 border-b border-line">Raccourcis</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/admin/projets", label: "Ajouter un projet", hint: "Titre, stack, liens" },
            { href: "/admin/competences", label: "Modifier la stack", hint: "Catégories et entrées" },
            { href: "/admin/profil", label: "Mettre à jour le profil", hint: "Bio, contact, CV" },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="border border-line rounded-md bg-surface p-5 hover:border-ink transition-colors duration-200 group"
            >
              <p className="text-[15px] font-medium text-ink group-hover:text-accent transition-colors duration-200">
                {s.label}
              </p>
              <p className="mt-1 text-[13px] text-muted">{s.hint}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
