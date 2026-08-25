import { getAllProjects } from "@/lib/db/queries";
import ProjectForm from "./ProjectForm";
import ProjectRow from "./ProjectRow";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const list = await getAllProjects();

  return (
    <div className="flex flex-col gap-14">
      <section>
        <div className="flex items-baseline justify-between gap-4 pb-3 border-b-2 border-ink">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
            Projets
          </h1>
          <span className="meta">
            {list.length} {list.length > 1 ? "entrées" : "entrée"}
          </span>
        </div>

        {list.length === 0 ? (
          <p className="mt-6 text-[15px] text-muted">
            Aucun projet pour l&apos;instant. Utilisez le formulaire ci-dessous.
          </p>
        ) : (
          <ul className="mt-2">
            {list.map((project, i) => (
              <ProjectRow
                key={project.id}
                project={project}
                isFirst={i === 0}
                isLast={i === list.length - 1}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink pb-3 border-b-2 border-ink">
          Nouveau projet
        </h2>
        <div className="mt-6">
          <ProjectForm />
        </div>
      </section>
    </div>
  );
}
