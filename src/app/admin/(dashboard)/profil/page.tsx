import { getSettings, getHeroStats, getHeroStack } from "@/lib/db/queries";
import SettingsForm from "./SettingsForm";
import ListEditor from "./ListEditor";
import { addStat, deleteStat, addStackRow, deleteStackRow } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  /* Trois lectures indépendantes : en parallèle plutôt qu'en cascade. */
  const [settings, stats, stack] = await Promise.all([
    getSettings(),
    getHeroStats(),
    getHeroStack(),
  ]);

  return (
    <div className="flex flex-col gap-14">
      <section>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink pb-3 border-b-2 border-ink">
          Identité & contact
        </h2>
        <div className="mt-6">
          <SettingsForm settings={settings} />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4 pb-3 border-b-2 border-ink">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
            Chiffres du hero
          </h2>
          <span className="meta">{stats.length} entrées</span>
        </div>
        <div className="mt-6">
          <ListEditor
            rows={stats.map((s) => ({ id: s.id, left: s.value, right: s.label }))}
            fields={{
              left: { name: "value", label: "Chiffre", placeholder: "5+" },
              right: { name: "label", label: "Libellé", placeholder: "Projets" },
            }}
            addAction={addStat}
            deleteAction={deleteStat}
            emptyLabel="Aucun chiffre affiché dans le hero."
          />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4 pb-3 border-b-2 border-ink">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
            Colonne « Stack principale »
          </h2>
          <span className="meta">{stack.length} lignes</span>
        </div>
        <p className="mt-4 text-[13px] leading-[1.6] text-ink-muted">
          Visible uniquement à partir de 1024&nbsp;px, dans la colonne de droite du
          hero. Vide, la colonne disparaît entièrement.
        </p>
        <div className="mt-5">
          <ListEditor
            rows={stack.map((s) => ({ id: s.id, left: s.groupLabel, right: s.items }))}
            fields={{
              left: { name: "groupLabel", label: "Groupe", placeholder: "Back-end" },
              right: {
                name: "items",
                label: "Contenu",
                placeholder: ".NET · FastAPI",
              },
            }}
            addAction={addStackRow}
            deleteAction={deleteStackRow}
            emptyLabel="Aucune ligne : la colonne est masquée sur le site."
          />
        </div>
      </section>
    </div>
  );
}
