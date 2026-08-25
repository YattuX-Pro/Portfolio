import { getSkills } from "@/lib/db/queries";
import CategoryCard from "./CategoryCard";
import NewCategoryForm from "./NewCategoryForm";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const categories = await getSkills();
  const total = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <div className="flex items-baseline justify-between gap-4 pb-3 border-b-2 border-ink">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
            Compétences
          </h1>
          <span className="meta">
            {categories.length} catégories · {total} entrées
          </span>
        </div>

        {categories.length === 0 ? (
          <p className="mt-6 text-[15px] text-muted">
            Aucune catégorie. Créez-en une ci-dessous.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-5">
            {categories.map((category, i) => (
              <CategoryCard
                key={category.id}
                category={category}
                isFirst={i === 0}
                isLast={i === categories.length - 1}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink pb-3 border-b-2 border-ink">
          Nouvelle catégorie
        </h2>
        <div className="mt-6">
          <NewCategoryForm />
        </div>
      </section>
    </div>
  );
}
